use crate::models::config::tenant::Tenant;
use sqlx::{Pool, Postgres};
use uuid::Uuid;
// Add this import

pub struct TenantService {
    db_pool: Pool<Postgres>,
}

impl TenantService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn create_tenant(&self, mut tenant: Tenant) -> Result<Uuid, anyhow::Error> {
        if tenant.name.trim().is_empty() {
            return Err(anyhow::anyhow!("Tenant name cannot be empty"));
        }

        if tenant.id == Uuid::nil() {
            tenant.id = Uuid::new_v4();
        }

        sqlx::query!(
            "INSERT INTO tenants (id, name) VALUES ($1, $2)",
            tenant.id,
            tenant.name
        )
        .execute(&self.db_pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create tenant: {}", e))?;

        Ok(tenant.id)
    }
}
