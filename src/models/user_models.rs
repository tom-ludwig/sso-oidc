use serde::Deserialize;

pub struct UserInformation {
    pub username: String,
    pub email: String,
    pub is_active: bool,
}

pub struct UserIDSQL {
    pub id: String,
}

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub tenant_id: String,
    pub username: String,
    pub email: String,
    pub password: String,
}
