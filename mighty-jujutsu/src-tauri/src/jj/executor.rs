use crate::error::{JJError, JJResult};
use std::path::Path;
use std::process::Stdio;
use tokio::process::Command;

pub struct JJExecutor {
    repo_path: Option<String>,
}

impl JJExecutor {
    pub fn new() -> Self {
        Self { repo_path: None }
    }

    pub fn with_repo<P: AsRef<Path>>(repo_path: P) -> Self {
        Self {
            repo_path: Some(repo_path.as_ref().to_string_lossy().to_string()),
        }
    }

    pub async fn execute(&self, args: &[&str]) -> JJResult<String> {
        let mut cmd = Command::new("jj");

        if let Some(ref path) = self.repo_path {
            cmd.arg("--repository").arg(path);
        }

        cmd.args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        let output = cmd
            .output()
            .await
            .map_err(|e| JJError::CommandFailed(format!("Failed to execute jj command: {}", e)))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(JJError::CommandFailed(format!(
                "JJ command failed with status {}: {}",
                output.status, stderr
            )));
        }

        String::from_utf8(output.stdout).map_err(JJError::from)
    }

    pub async fn execute_json(&self, args: &[&str]) -> JJResult<serde_json::Value> {
        let output = self.execute(args).await?;
        serde_json::from_str(&output).map_err(JJError::from)
    }

    pub async fn status(&self) -> JJResult<String> {
        self.execute(&["status"]).await
    }

    pub async fn log(&self, limit: Option<usize>) -> JJResult<serde_json::Value> {
        let mut args = vec!["log", "--no-graph", "-T", "json"];
        let limit_str;
        if let Some(n) = limit {
            limit_str = format!("{}", n);
            args.push("-n");
            args.push(&limit_str);
        }
        self.execute_json(&args).await
    }

    pub async fn diff(&self, revision: Option<&str>) -> JJResult<String> {
        let mut args = vec!["diff"];
        if let Some(rev) = revision {
            args.push("-r");
            args.push(rev);
        }
        self.execute(&args).await
    }

    pub async fn init<P: AsRef<Path>>(path: P) -> JJResult<String> {
        let executor = Self::new();
        executor
            .execute(&["init", path.as_ref().to_str().unwrap()])
            .await
    }
}

impl Default for JJExecutor {
    fn default() -> Self {
        Self::new()
    }
}
