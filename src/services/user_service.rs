use sqlx::{Pool, Postgres, Row};

use crate::{models::login::LoginRequest, utils::password_hash_utils::hash_password};

pub struct UserService {
    db_pool: Pool<Postgres>,
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn test_create_user(&self) {
        let rows = sqlx::query("SELECT * FROM users")
            .fetch_all(&self.db_pool)
            .await
            .unwrap();

        // println!("Rows: {}", rows.pop())
    }

    /// Authorizes the user with a cookie if the credentials passed are valid
    pub async fn auth_user(&self, login_request: &LoginRequest) -> Option<bool> {
        let query = "SELECT pass FROM users WHERE username = $1";

        let result = sqlx::query(query)
            .bind(&login_request.username)
            .fetch_one(&self.db_pool)
            .await;

        let (_salt, hashed_password) = match hash_password(login_request.password_unhashed.as_str())
        {
            Ok((_salt, hashed_password)) => (_salt, hashed_password),
            Err(_) => return Some(false),
        };

        match result {
            Ok(row) => {
                let stored_hash: String = row.try_get("pass").ok()?;
                Some(stored_hash == hashed_password)
            }
            Err(_) => Some(false),
        }
    }
}
