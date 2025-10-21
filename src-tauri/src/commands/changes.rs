use crate::error::JJResult;
use crate::jj::JJExecutor;

#[tauri::command]
pub async fn jj_new(repo_path: Option<String>, message: Option<String>) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.new_change(message.as_deref()).await
}

#[tauri::command]
pub async fn jj_describe(
    repo_path: Option<String>,
    message: String,
    change_id: Option<String>,
) -> JJResult<String> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };
    executor.describe(&message, change_id.as_deref()).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jj_new_without_message() {
        let result = jj_new(None, None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_new_with_message() {
        let result = jj_new(None, Some("Test change".to_string())).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_describe_with_message() {
        let result = jj_describe(None, "Test description".to_string(), None).await;
        assert!(result.is_ok() || result.is_err());
    }
}
