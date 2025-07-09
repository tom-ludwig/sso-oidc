use sqlx::{Pool, Postgres};

use crate::{models::login::LoginRequest, utils::password_hash_utils::verify_password};

pub struct UserService {
    db_pool: Pool<Postgres>,
}

pub struct User {
    pub password_hash: String
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    /// Authorizes the user with a cookie if the credentials passed are valid
    pub async fn auth_user(&self, login_request: &LoginRequest) -> Option<bool> {
        let result = sqlx::query_as!(User, "SELECT password_hash FROM Users WHERE email = $1", login_request.email)
            .fetch_one(&self.db_pool)
            .await;

        let stored_hash = match result {
            Ok(row) => {
                row.password_hash
            }
            Err(_) => return None,
        };

        match verify_password(login_request.password.as_str(), &stored_hash)
        {
            Ok(is_authenticated) => Some(is_authenticated),
            Err(_) => return None,
        }

    }
}
