use sqlx::{Pool, Postgres};

use crate::{
    models::{
        login::{LoginRequest, User, UserIDSQL, UserInformation},
        session::SessionData,
    },
    utils::password_hash_utils::verify_password,
};

pub struct UserService {
    db_pool: Pool<Postgres>,
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn get_user_id_from_email(
        &self,
        email: &String,
    ) -> Result<SessionData, anyhow::Error> {
        let result = sqlx::query_as!(UserIDSQL, "SELECT id FROM Users where email = $1", email)
            .fetch_one(&self.db_pool)
            .await?;

        Ok(SessionData { user_id: result.id })
    }
    /// Authorizes the user with a cookie if the credentials passed are valid
    pub async fn auth_user(&self, login_request: &LoginRequest) -> Option<bool> {
        let result = sqlx::query_as!(
            User,
            "SELECT password_hash FROM Users WHERE email = $1",
            login_request.email
        )
        .fetch_one(&self.db_pool)
        .await;

        let stored_hash = match result {
            Ok(row) => row.password_hash,
            Err(_) => return None,
        };

        match verify_password(login_request.password.as_str(), &stored_hash) {
            Ok(is_authenticated) => Some(is_authenticated),
            Err(_) => return None,
        }
    }

    pub async fn get_user_information(
        &self,
        user_id: &str,
    ) -> Result<UserInformation, anyhow::Error> {
        let user_uuid = uuid::Uuid::parse_str(user_id)?;

        let result = sqlx::query_as!(
            UserInformation,
            "SELECT username, email, is_active FROM Users where id = $1",
            user_uuid
        )
        .fetch_one(&self.db_pool)
        .await;

        Ok(result?)
    }
}
