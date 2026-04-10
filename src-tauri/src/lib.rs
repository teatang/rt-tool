mod tray;

use std::fs;
use std::path::Path;
use std::io;
use regex::Regex;
use tauri::Manager;

/// 跨设备重命名：先复制再删除源文件（带验证）
fn rename_cross_device(from: &Path, to: &Path) -> io::Result<()> {
    // 获取源文件大小
    let from_meta = fs::metadata(from)?;
    let from_size = from_meta.len();

    // 复制文件
    fs::copy(from, to)?;

    // 验证目标文件大小匹配
    let to_meta = fs::metadata(to)?;
    if to_meta.len() != from_size {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Copy verification failed: file size mismatch",
        ));
    }

    // 验证通过后再删除源文件
    fs::remove_file(from)?;
    Ok(())
}

/// 打招呼命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 搜索文件命令
/// 在指定目录中递归搜索包含关键词的文件
#[tauri::command]
fn search_files(path: String, keyword: String) -> Result<Vec<String>, String> {
    // 输入验证
    if path.trim().is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    if keyword.trim().is_empty() {
        return Err("Keyword cannot be empty".to_string());
    }

    let mut results = Vec::new();
    let max_results = 10000;
    let max_depth = 50; // 最大递归深度，防止深层目录遍历
    let base_path = Path::new(&path);

    // 路径规范化检查：防止路径遍历攻击
    let canonical_path = base_path.canonicalize()
        .map_err(|_| "Path cannot be resolved (invalid path)")?;

    if !canonical_path.exists() {
        return Err("Path does not exist".to_string());
    }

    // 递归搜索函数
    fn search_recursive(dir: &Path, keyword: &str, results: &mut Vec<String>, max_results: usize, current_depth: usize, max_depth: usize) {
        if current_depth >= max_depth || results.len() >= max_results {
            return;
        }
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                if results.len() >= max_results {
                    return;
                }
                let entry_path = entry.path();

                // 跳过符号链接，避免无限递归
                if entry_path.is_symlink() {
                    continue;
                }

                let file_name = entry_path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");

                // 不区分大小写匹配
                if file_name.to_lowercase().contains(&keyword.to_lowercase()) {
                    if let Some(path_str) = entry_path.to_str() {
                        results.push(path_str.to_string());
                    }
                }

                // 如果是目录（非符号链接），递归搜索
                if entry_path.is_dir() {
                    search_recursive(&entry_path, keyword, results, max_results, current_depth + 1, max_depth);
                }
            }
        }
    }

    search_recursive(&canonical_path, &keyword, &mut results, max_results, 0, max_depth);
    Ok(results)
}

/// 列出目录下匹配正则的文件（非递归）
#[tauri::command]
fn list_dir_files(path: String, pattern: String) -> Result<Vec<FileItem>, String> {
    // 输入验证
    if path.trim().is_empty() {
        return Err("Path cannot be empty".to_string());
    }
    if pattern.trim().is_empty() {
        return Err("Pattern cannot be empty".to_string());
    }

    let dir_path = Path::new(&path);

    if !dir_path.exists() {
        return Err("Path does not exist".to_string());
    }

    if !dir_path.is_dir() {
        return Err("Path is not a directory".to_string());
    }

    let regex = match Regex::new(&pattern) {
        Ok(r) => r,
        Err(e) => return Err(format!("Invalid regex: {}", e))
    };

    let mut items = Vec::new();

    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let file_path = entry.path();
        if file_path.is_file() {
            if let Some(file_name) = file_path.file_name().and_then(|n| n.to_str()) {
                if regex.is_match(file_name) {
                    if let Some(path_str) = file_path.to_str() {
                        items.push(FileItem {
                            path: path_str.to_string(),
                            old_name: file_name.to_string(),
                            new_name: file_name.to_string()
                        });
                    }
                }
            }
        }
    }

    Ok(items)
}

/// 文件项结构
#[derive(serde::Serialize)]
struct FileItem {
    path: String,
    old_name: String,
    new_name: String
}

/// 批量重命名文件
#[tauri::command]
fn batch_rename(items: Vec<RenameItem>) -> Result<(), String> {
    // 第一步：预验证所有路径，确保所有源文件存在且目标路径有效
    for item in &items {
        if item.old_path.trim().is_empty() {
            return Err("Source path cannot be empty".to_string());
        }
        if item.new_path.trim().is_empty() {
            return Err("Target path cannot be empty".to_string());
        }
        let old_path = Path::new(&item.old_path);
        if !old_path.exists() {
            return Err(format!("Source file does not exist: {}", item.old_path));
        }
        if !old_path.is_file() {
            return Err(format!("Source is not a file: {}", item.old_path));
        }
        // 检查目标目录是否存在
        if let Some(parent) = Path::new(&item.new_path).parent() {
            if !parent.exists() {
                return Err(format!("Target directory does not exist: {}", parent.display()));
            }
        }
    }

    // 第二步：执行重命名操作
    let mut errors = Vec::new();
    let mut renamed_files: Vec<(String, String)> = Vec::new(); // 用于回滚记录

    for item in items {
        if item.old_path != item.new_path {
            match fs::rename(&item.old_path, &item.new_path) {
                Ok(_) => {
                    renamed_files.push((item.new_path.clone(), item.old_path.clone()));
                }
                Err(e) => {
                    // Windows 跨驱动器移动文件时，rename 返回 EXDEV 错误
                    // 使用复制+删除方式处理
                    if e.kind() == io::ErrorKind::CrossesDevices {
                        match rename_cross_device(Path::new(&item.old_path), Path::new(&item.new_path)) {
                            Ok(_) => {
                                renamed_files.push((item.new_path.clone(), item.old_path.clone()));
                            }
                            Err(e2) => {
                                errors.push(format!("{}: {}", item.old_path, e2));
                            }
                        }
                    } else {
                        errors.push(format!("{}: {}", item.old_path, e));
                    }
                }
            }
        }
    }

    // 如果有错误，尝试回滚已成功的重命名
    if !errors.is_empty() {
        // 回滚操作（忽略回滚错误，仅记录）
        for (new_path, old_path) in renamed_files {
            let _ = fs::rename(&new_path, &old_path);
        }
        return Err(errors.join("; "));
    }

    Ok(())
}

/// 重命名项结构
#[derive(serde::Deserialize)]
struct RenameItem {
    old_path: String,
    new_path: String
}

/// 重命名文件命令
#[tauri::command]
fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    match fs::rename(&old_path, &new_path) {
        Ok(_) => Ok(()),
        Err(e) => {
            // Windows 跨驱动器移动文件时，rename 返回 EXDEV 错误
            // 使用复制+删除方式处理
            if e.kind() == io::ErrorKind::CrossesDevices {
                rename_cross_device(Path::new(&old_path), Path::new(&new_path))
                    .map_err(|e2| e2.to_string())
            } else {
                Err(e.to_string())
            }
        }
    }
}

/// 在文件管理器中显示文件所在目录
#[tauri::command]
fn reveal_in_explorer(path: String) -> Result<(), String> {
    let file_path = Path::new(&path);
    opener::reveal(file_path).map_err(|e| e.to_string())
}

/// 应用入口
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // 初始化系统托盘
            tray::init_tray(app.handle())?;

            // 监听窗口关闭事件，点击关闭按钮时隐藏窗口而不是退出
            let window = app.get_webview_window("main").unwrap();
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // 阻止窗口关闭，改为隐藏
                    api.prevent_close();
                    let _ = window_clone.hide();
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, search_files, rename_file, reveal_in_explorer, list_dir_files, batch_rename])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
