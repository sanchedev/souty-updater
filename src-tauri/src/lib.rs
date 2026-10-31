use std::fs::File;
use std::io::Write;

#[tauri::command]
async fn download_mod_file(url: String, file_path: String, api_key: String) -> Result<(), String> {
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("x-api-key", api_key)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Error HTTP: {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;

    let mut file = File::create(file_path).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notifications::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![download_mod_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
