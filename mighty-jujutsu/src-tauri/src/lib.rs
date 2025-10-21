mod commands;
mod error;
mod jj;
mod models;

use commands::bookmarks::{jj_bookmark_create, jj_bookmark_delete, jj_bookmark_list, jj_bookmark_track};
use commands::changes::{jj_describe, jj_new};
use commands::history::jj_log;
use commands::remote::{jj_git_fetch, jj_git_push};
use commands::repository::{jj_diff, jj_init, jj_status};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            jj_status,
            jj_init,
            jj_diff,
            jj_log,
            jj_new,
            jj_describe,
            jj_bookmark_list,
            jj_bookmark_create,
            jj_bookmark_track,
            jj_bookmark_delete,
            jj_git_fetch,
            jj_git_push
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
