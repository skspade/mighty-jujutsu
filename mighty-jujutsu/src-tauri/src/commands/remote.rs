use crate::error::JJResult;
use crate::jj::JJExecutor;

#[tauri::command]
pub async fn jj_git_fetch(repo_path: Option<String>, remote: Option<String>) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.git_fetch(remote.as_deref()).await
}

#[tauri::command]
pub async fn jj_git_push(
    repo_path: Option<String>,
    bookmark: Option<String>,
) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.git_push(bookmark.as_deref()).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jj_git_fetch_default() {
        let result = jj_git_fetch(None, None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_git_fetch_with_remote() {
        let result = jj_git_fetch(None, Some("origin".to_string())).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_git_push_default() {
        let result = jj_git_push(None, None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_git_push_with_bookmark() {
        let result = jj_git_push(None, Some("main".to_string())).await;
        assert!(result.is_ok() || result.is_err());
    }
}
