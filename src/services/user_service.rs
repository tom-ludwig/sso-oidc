use crate::models::config::user::User;
use crate::models::user_models::UserIDSQL;
use crate::models::user_models::UserInformation;
use crate::utils;
use crate::{
    models::{
        login::{LoginRequest, UserPasswordHashSQL},
        session::SessionData,
        user_models::CreateUserRequest,
    },
    utils::password_hash_utils::verify_password,
};
use anyhow::Result;
use sqlx::query;
use sqlx::Error as SqlxError;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

pub struct UserService {
    db_pool: Pool<Postgres>,
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }
    pub async fn create_user(&self, new_user: &CreateUserRequest) -> Result<(), anyhow::Error> {
        let tenant_uuid = Uuid::parse_str(&new_user.tenant_id)
            .map_err(|e| anyhow::anyhow!("Failed to parse tenant UUID: {}", e))?;

        let hashed_password = utils::password_hash_utils::hash_password(&new_user.password)
            .map_err(|e| anyhow::anyhow!("Password hashing failed: {}", e))?;

        let user_uuid = Uuid::new_v4();

        let result = query!(
            r#"
            INSERT INTO Users (id, tenant_id, username, email, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT ON CONSTRAINT users_tenant_id_username_key DO NOTHING
            "#,
            user_uuid,
            tenant_uuid,
            new_user.username,
            new_user.email,
            hashed_password.1
        )
        .execute(&self.db_pool)
        .await;
        println!("{:?}", result);

        if let Ok(pg_result) = result {
            if pg_result.rows_affected() == 0 {
                println!(
                    "No rows affected: Conflict detected or no changes due to current constraints."
                );
                Err(anyhow::anyhow!(
                    "A user with this email or username already exists"
                ))
            } else {
                println!("User successfully inserted!");
                Ok(())
            }
        } else {
            match result {
                Err(SqlxError::Database(db_err)) => Err(anyhow::anyhow!(
                    "Database error occurred: {}",
                    db_err.message()
                )),
                Err(SqlxError::Configuration(_)) => {
                    Err(anyhow::anyhow!("Configuration error occurred"))
                }
                Err(SqlxError::Tls(_)) => Err(anyhow::anyhow!("TLS error occurred")),
                _ => Err(anyhow::anyhow!("An unexpected error occurred")),
            }
        }
    }

    pub async fn create_user_without_cookie(
        &self,
        mut new_user: User,
    ) -> Result<Uuid, anyhow::Error> {
        if new_user.username.trim().is_empty() {
            return Err(anyhow::anyhow!("Username cannot be empty"));
        }

        if new_user.id == Uuid::nil() {
            new_user.id = Uuid::new_v4();
        }

        sqlx::query!(
            "
    INSERT INTO Users (id, tenant_id, username, email, password_hash, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    ",
            new_user.id,
            new_user.tenant_id,
            new_user.username,
            new_user.email,
            new_user.password_hash,
            new_user.is_active,
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create user: {}", e))?;

        Ok(new_user.id)
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
            UserPasswordHashSQL,
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
