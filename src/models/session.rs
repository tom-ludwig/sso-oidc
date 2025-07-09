use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SessionData {
    pub user_id: String,
    // TODO: maybe add roles, email, etc. here
}
