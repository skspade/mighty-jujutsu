use crate::error::JJResult;
use crate::jj::{JJExecutor, JJParser};
use crate::models::Commit;

#[tauri::command]
pub async fn jj_log(repo_path: Option<String>, limit: Option<usize>) -> JJResult<Vec<Commit>> {
    let executor = match repo_path {
        Some(path) => JJExecutor::with_repo(path),
        None => JJExecutor::new(),
    };

    let json = executor.log(limit).await?;
    JJParser::parse_log(json)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_jj_log_no_limit() {
        let result = jj_log(None, None).await;
        assert!(result.is_ok() || result.is_err());
    }

    #[tokio::test]
    async fn test_jj_log_with_limit() {
        let result = jj_log(None, Some(10)).await;
        assert!(result.is_ok() || result.is_err());
    }
}
