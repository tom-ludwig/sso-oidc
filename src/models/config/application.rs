use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ApplicationsConfig {
    pub applications: Vec<Application>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Application {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub client_id: String,
    pub client_secret: String,
    pub uri: String,
    pub redirect_uris: Vec<String>,
    pub post_logout_redirect_uris: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,
}
