use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bookmark {
    pub name: String,
    pub target: String,
    pub is_tracking: bool,
    pub remote: Option<String>,
}
