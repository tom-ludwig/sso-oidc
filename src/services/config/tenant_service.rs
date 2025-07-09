use sqlx::{Pool, Postgres};
use uuid::Uuid;

pub struct TenantService {
    db_pool: Pool<Postgres>,
}

impl TenantService {
    pub fn new(db_pool: Pool<Postgres>) -> Self {
        Self { db_pool }
    }

    pub async fn create_tenant(&self, id: Option<Uuid>, name: &str) -> Result<Uuid, anyhow::Error> {
        if name.trim().is_empty() {
            return Err(anyhow::anyhow!("Tenant name cannot be empty"));
        }

        let tenant_id = id.unwrap_or_else(|| Uuid::new_v4());

        sqlx::query!("INSERT INTO tenants (id, name) VALUES ($1, $2)", id, name)
            .execute(&self.db_pool)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to create tenant: {}", e))?;

        Ok(tenant_id)
    }
}
