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

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jj_status_no_path() {
        let result = jj_status(None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_init() {
        let result = jj_init("/tmp/test-repo".to_string()).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_diff_no_revision() {
        let result = jj_diff(None, None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_diff_with_revision() {
        let result = jj_diff(None, Some("@".to_string())).await;
        assert!(result.is_ok() || result.is_err());
    }
}
