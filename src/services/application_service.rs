use anyhow::Error;
use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::models::application_model::Application;

pub struct ApplicationClientService {
    db_pool: Pool<Postgres>,
}

impl ApplicationClientService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn get_client_information(&self, client_id: &str) -> Result<Application, Error> {
        let result = sqlx::query_as!(
            Application,
            "SELECT client_secret, redirect_uris FROM Applications WHERE client_id = $1",
            client_id,
        )
        .fetch_one(&self.db_pool)
        .await;

        return Ok(result?);
    }
}
