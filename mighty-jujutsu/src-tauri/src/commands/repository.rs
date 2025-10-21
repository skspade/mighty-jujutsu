use crate::error::JJResult;
use crate::jj::JJExecutor;

#[tauri::command]
pub async fn jj_status(repo_path: Option<String>) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.status().await
}

#[tauri::command]
pub async fn jj_init(path: String) -> JJResult<String> {
    JJExecutor::init(path).await
}

#[tauri::command]
pub async fn jj_diff(repo_path: Option<String>, revision: Option<String>) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.diff(revision.as_deref()).await
}
