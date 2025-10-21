use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Repository {
    pub path: String,
    pub working_copy_path: String,
}

impl Repository {
    pub fn new(path: String, working_copy_path: String) -> Self {
        Self {
            path,
            working_copy_path,
        }
    }
}
