use serde::Deserialize;

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub struct User {
    pub password_hash: String,
}

pub struct UserInformation {
    pub username: String,
    pub email: String,
    pub is_active: bool,
}

pub struct UserIDSQL {
    pub id: String,
}
