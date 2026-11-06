use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::Instant;

#[derive(Debug, Deserialize)]
pub struct HttpHeaderItem {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

#[derive(Debug, Deserialize)]
pub struct HttpRequestPayload {
    pub method: String,
    pub url: String,
    pub headers: Vec<HttpHeaderItem>,
    pub body_type: String, // "none", "json", "raw", "x-www-form-urlencoded"
    pub body: Option<String>,
    pub timeout_seconds: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct HttpResponsePayload {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
    pub elapsed_ms: u128,
    pub size_bytes: usize,
}

/// 发送 HTTP 请求并返回响应信息
#[tauri::command]
pub async fn api_client_send_http(request: HttpRequestPayload) -> Result<HttpResponsePayload, String> {
    let timeout = std::time::Duration::from_secs(request.timeout_seconds.unwrap_or(30));
    let client = reqwest::Client::builder()
        .timeout(timeout)
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let method = match request.method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "PATCH" => reqwest::Method::PATCH,
        "HEAD" => reqwest::Method::HEAD,
        "OPTIONS" => reqwest::Method::OPTIONS,
        other => return Err(format!("Unsupported HTTP method: {}", other)),
    };

    let mut req_builder = client.request(method, &request.url);

    // 添加请求头
    let mut has_content_type = false;
    for h in request.headers {
        if h.enabled && !h.key.trim().is_empty() {
            if h.key.trim().eq_ignore_ascii_case("content-type") {
                has_content_type = true;
            }
            if let Ok(header_name) = reqwest::header::HeaderName::from_bytes(h.key.trim().as_bytes()) {
                if let Ok(header_val) = reqwest::header::HeaderValue::from_str(&h.value) {
                    req_builder = req_builder.header(header_name, header_val);
                }
            }
        }
    }

    // 根据 body 类型装载请求体
    match request.body_type.as_str() {
        "json" => {
            if let Some(body_str) = request.body {
                if !body_str.is_empty() {
                    if !has_content_type {
                        req_builder = req_builder.header(reqwest::header::CONTENT_TYPE, "application/json");
                    }
                    req_builder = req_builder.body(body_str);
                }
            }
        }
        "raw" => {
            if let Some(body_str) = request.body {
                if !body_str.is_empty() {
                    req_builder = req_builder.body(body_str);
                }
            }
        }
        "x-www-form-urlencoded" => {
            if let Some(body_str) = request.body {
                if !body_str.is_empty() {
                    if !has_content_type {
                        req_builder = req_builder.header(reqwest::header::CONTENT_TYPE, "application/x-www-form-urlencoded");
                    }
                    req_builder = req_builder.body(body_str);
                }
            }
        }
        _ => {}
    }

    let start_time = Instant::now();
    let response = req_builder.send().await.map_err(|e| format!("Request failed: {}", e))?;
    let elapsed_ms = start_time.elapsed().as_millis();

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("Unknown")
        .to_string();

    let mut resp_headers = Vec::new();
    for (name, value) in response.headers() {
        let val_str = value.to_str().unwrap_or("").to_string();
        resp_headers.push((name.as_str().to_string(), val_str));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Failed to read response body: {}", e))?;
    let size_bytes = bytes.len();
    let body_str = String::from_utf8_lossy(&bytes).to_string();

    Ok(HttpResponsePayload {
        status,
        status_text,
        headers: resp_headers,
        body: body_str,
        elapsed_ms,
        size_bytes,
    })
}

/// 获取持久化存储路径 `~/.rt-tool/api_client.json`
fn get_storage_path() -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or_else(|| "Could not determine user home directory".to_string())?;
    let dir = home.join(".rt-tool");
    if !dir.exists() {
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create directory {:?}: {}", dir, e))?;
    }
    Ok(dir.join("api_client.json"))
}

/// 读取本地保存的 API 数据
#[tauri::command]
pub fn api_client_load_data() -> Result<String, String> {
    let path = get_storage_path()?;
    if !path.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {:?}: {}", path, e))
}

/// 保存 API 数据到本地硬盘
#[tauri::command]
pub fn api_client_save_data(json_content: String) -> Result<(), String> {
    let path = get_storage_path()?;
    fs::write(&path, json_content).map_err(|e| format!("Failed to write to {:?}: {}", path, e))
}
