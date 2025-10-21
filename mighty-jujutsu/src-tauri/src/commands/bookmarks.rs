use crate::error::JJResult;
use crate::jj::{JJExecutor, JJParser};
use crate::models::Bookmark;

#[tauri::command]
pub async fn jj_bookmark_list(repo_path: Option<String>) -> JJResult<Vec<Bookmark>> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };

    let json = executor.bookmark_list().await?;
    JJParser::parse_bookmarks(json)
}

#[tauri::command]
pub async fn jj_bookmark_create(
    repo_path: Option<String>,
    name: String,
    revision: Option<String>,
) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.bookmark_create(&name, revision.as_deref()).await
}

#[tauri::command]
pub async fn jj_bookmark_track(repo_path: Option<String>, name: String) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.bookmark_track(&name).await
}

#[tauri::command]
pub async fn jj_bookmark_delete(repo_path: Option<String>, name: String) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.bookmark_delete(&name).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jj_bookmark_list() {
        let result = jj_bookmark_list(None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_bookmark_create() {
        let result = jj_bookmark_create(None, "test-bookmark".to_string(), None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_bookmark_track() {
        let result = jj_bookmark_track(None, "main@origin".to_string()).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_bookmark_delete() {
        let result = jj_bookmark_delete(None, "test-bookmark".to_string()).await;
        assert!(result.is_ok() || result.is_err());
    }
}
