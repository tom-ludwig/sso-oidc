use crate::models::config::application::Application;
use anyhow::Result;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

pub struct ApplicationService {
    db_pool: Pool<Postgres>,
}

impl ApplicationService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn create_application(&self, mut application: Application) -> Result<Uuid> {
        if application.name.trim().is_empty() {
            return Err(anyhow::anyhow!("Application name cannot be empty"));
        }
        if application.client_id.trim().is_empty() {
            return Err(anyhow::anyhow!("Client ID cannot be empty"));
        }

        if application.id == Uuid::nil() {
            application.id = Uuid::new_v4();
        }

        sqlx::query!(
        r#"
        INSERT INTO applications
        (id, tenant_id, name, client_id, client_secret, uri, redirect_uris, post_logout_redirect_uris)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
        application.id,
        application.tenant_id,
        application.name,
        application.client_id,
        application.client_secret,
        application.uri,
        &application.redirect_uris,
        &application.post_logout_redirect_uris
    )
            .execute(&self.db_pool)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to create application: {}", e))?;

        Ok(application.id)
    }
}
