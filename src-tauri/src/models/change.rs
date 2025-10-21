use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Change {
    pub path: String,
    pub status: ChangeStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ChangeStatus {
    Added,
    Modified,
    Deleted,
    Renamed { from: String },
    Copied { from: String },
}
