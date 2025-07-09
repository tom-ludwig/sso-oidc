use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthCodeData {
    pub user_id: String,
    pub client_id: String,
    pub redirect_uri: String,
    pub scope: Option<String>,
    pub nonce: Option<String>,
    pub expires_in: u64,
}
