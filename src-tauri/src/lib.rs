use std::fs;
use std::path::Path;

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
        .invoke_handler(tauri::generate_handler![greet, search_files, rename_file, reveal_in_explorer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
