use bb8_redis::RedisConnectionManager;
use redis::{AsyncCommands, TypedCommands};

use sqlx::{Pool, Postgres};

use crate::models::auth_code_data::AuthCodeData;

#[derive(Clone)]
pub struct AuthorizeCodeService {
    db_pool: Pool<Postgres>,
    redis_pool: bb8::Pool<RedisConnectionManager>,
}

impl AuthorizeCodeService {
    pub fn new(db_pool: Pool<Postgres>, redis_pool: bb8::Pool<RedisConnectionManager>) -> Self {
        Self {
            db_pool,
            redis_pool,
        }
    }

    /// Store a new authorization code in Redis with TTL.
    pub async fn store_code(
        &self,
        code: &str,
        data: AuthCodeData,
        ttl_seconds: u64,
    ) -> Result<(), anyhow::Error> {
        let mut conn = self.redis_pool.get().await?;
        let serialized = serde_json::to_string(&data)?;

        let _: () = conn.set_ex(code, serialized, ttl_seconds).await?;

        Ok(())
    }

    /// Consume and verify a code (one-time use). Deletes it after retrieval.
    pub async fn consume_code(&self, code: &str) -> Result<Option<AuthCodeData>, anyhow::Error> {
        let mut conn = self.redis_pool.get().await?;

        // Use GETDEL if Redis >= 6.2
        let data: Option<String> = conn.get_del(code).await?;

        match data {
            Some(json) => {
                let parsed: AuthCodeData = serde_json::from_str(&json)?;
                Ok(Some(parsed))
            }
            None => Ok(None),
        }
    }
}
