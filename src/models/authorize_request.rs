use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct AuthorizeRequest {
    pub response_type: String,
    pub client_id: String,
    pub redirect_uri: String,
    pub scope: Option<String>,
    pub state: Option<String>,
    pub nonce: Option<String>,
}
