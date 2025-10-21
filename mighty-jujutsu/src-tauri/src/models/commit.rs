use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Commit {
    pub change_id: String,
    pub commit_id: String,
    pub author: Author,
    pub committer: Author,
    pub description: String,
    pub branches: Vec<String>,
    pub tags: Vec<String>,
    pub is_working_copy: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Author {
    pub name: String,
    pub email: String,
    pub timestamp: String,
}
