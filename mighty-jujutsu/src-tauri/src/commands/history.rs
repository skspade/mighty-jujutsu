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
