use crate::error::{JJError, JJResult};
use crate::models::{Author, Commit};
use serde_json::Value;

pub struct JJParser;

impl JJParser {
    pub fn parse_log(json: Value) -> JJResult<Vec<Commit>> {
        let commits_array = json
            .as_array()
            .ok_or_else(|| JJError::ParseError("Expected array of commits".to_string()))?;

        commits_array
            .iter()
            .map(|commit_val| Self::parse_commit(commit_val))
            .collect()
    }

    fn parse_commit(val: &Value) -> JJResult<Commit> {
        let obj = val
            .as_object()
            .ok_or_else(|| JJError::ParseError("Expected commit object".to_string()))?;

        Ok(Commit {
            change_id: Self::get_string(obj, "change_id")?,
            commit_id: Self::get_string(obj, "commit_id")?,
            author: Self::parse_author(obj.get("author"))?,
            committer: Self::parse_author(obj.get("committer"))?,
            description: Self::get_string(obj, "description")?,
            branches: Self::get_string_array(obj, "branches").unwrap_or_default(),
            tags: Self::get_string_array(obj, "tags").unwrap_or_default(),
            is_working_copy: obj
                .get("is_working_copy")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
        })
    }

    fn parse_author(val: Option<&Value>) -> JJResult<Author> {
        let obj = val
            .and_then(|v| v.as_object())
            .ok_or_else(|| JJError::ParseError("Expected author object".to_string()))?;

        Ok(Author {
            name: Self::get_string(obj, "name")?,
            email: Self::get_string(obj, "email")?,
            timestamp: Self::get_string(obj, "timestamp")?,
        })
    }

    fn get_string(
        obj: &serde_json::Map<String, Value>,
        key: &str,
    ) -> JJResult<String> {
        obj.get(key)
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| JJError::ParseError(format!("Missing or invalid field: {}", key)))
    }

    fn get_string_array(
        obj: &serde_json::Map<String, Value>,
        key: &str,
    ) -> JJResult<Vec<String>> {
        obj.get(key)
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .ok_or_else(|| JJError::ParseError(format!("Missing or invalid array: {}", key)))
    }
}
