use thiserror::Error;

#[derive(Error, Debug)]
pub enum JJError {
    #[error("JJ command failed: {0}")]
    CommandFailed(String),

    #[error("Failed to parse JJ output: {0}")]
    ParseError(String),

    #[error("Repository not found at path: {0}")]
    RepositoryNotFound(String),

    #[error("Invalid repository: {0}")]
    InvalidRepository(String),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    #[error("UTF-8 error: {0}")]
    Utf8Error(#[from] std::string::FromUtf8Error),
}

impl serde::Serialize for JJError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type JJResult<T> = Result<T, JJError>;
