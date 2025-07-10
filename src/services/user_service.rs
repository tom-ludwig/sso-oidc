use crate::models::user_models::UserIDSQL;
use crate::models::user_models::UserInformation;
use crate::utils;
use crate::{
    models::{
        login::{LoginRequest, User},
        session::SessionData,
        user_models::CreateUserRequest,
    },
    utils::password_hash_utils::verify_password,
};
use anyhow::{Context, Result};
use sqlx::query;
use sqlx::query_scalar;
use sqlx::{Error as SqlxError, postgres::PgDatabaseError};
use sqlx::{Pool, Postgres};
use uuid::Uuid;

pub struct UserService {
    db_pool: Pool<Postgres>,
}

impl UserService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn create_user(&self, new_user: CreateUserRequest) -> Result<(), anyhow::Error> {
        let tenant_uuid = Uuid::parse_str(&new_user.tenant_id)
            .map_err(|e| anyhow::anyhow!("Failed to parse tenant UUID: {}", e))?;

        let hashed_password = utils::password_hash_utils::hash_password(&new_user.password)
            .map_err(|e| anyhow::anyhow!("Password hashing failed: {}", e))?;

        // let exists: Option<Uuid> = query_scalar!(
        //     r#"
        //     SELECT id FROM Users WHERE email = $1
        //     "#,
        //     new_user.email
        // )
        // .fetch_optional(&self.db_pool)
        // .await
        // .context("Failed to check if email exists")?;

        // if exists.is_some() {
        //     return Err(anyhow::anyhow!("A user with this email already exists"));
        // }

        let user_uuid = Uuid::new_v4();
        //            // RETURNING id

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
        // .context("Failed to insert new user")?;
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
