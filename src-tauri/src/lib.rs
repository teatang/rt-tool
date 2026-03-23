use std::fs;
use std::path::Path;
use regex::Regex;

/// 打招呼命令
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// 搜索文件命令
/// 在指定目录中递归搜索包含关键词的文件
#[tauri::command]
fn search_files(path: String, keyword: String) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    let path = Path::new(&path);

    if !path.exists() {
        return Err("Path does not exist".to_string());
    }

    // 递归搜索函数
    fn search_recursive(dir: &Path, keyword: &str, results: &mut Vec<String>) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("");

                // 不区分大小写匹配
                if file_name.to_lowercase().contains(&keyword.to_lowercase()) {
                    if let Some(path_str) = path.to_str() {
                        results.push(path_str.to_string());
                    }
                }

                // 如果是目录，递归搜索
                if path.is_dir() {
                    search_recursive(&path, keyword, results);
                }
            }
        }
    }

    search_recursive(path, &keyword, &mut results);
    Ok(results)
}

/// 列出目录下匹配正则的文件（非递归）
#[tauri::command]
fn list_dir_files(path: String, pattern: String) -> Result<Vec<FileItem>, String> {
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
fn batch_rename(items: Vec<RenameItem>) -> Result<Vec<String>, String> {
    let mut errors = Vec::new();

    for item in items {
        if item.old_path != item.new_path {
            match fs::rename(&item.old_path, &item.new_path) {
                Ok(_) => {}
                Err(e) => errors.push(format!("{}: {}", item.old_path, e))
            }
        }
    }

    if errors.is_empty() {
        Ok(vec![])
    } else {
        Ok(errors)
    }
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
    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
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
        .invoke_handler(tauri::generate_handler![greet, search_files, rename_file, reveal_in_explorer, list_dir_files, batch_rename])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
