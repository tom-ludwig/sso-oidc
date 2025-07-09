use bb8::Pool as RedisPool;
use bb8_redis::RedisConnectionManager;
use redis::AsyncCommands;
use sqlx::{Pool, Postgres};

use crate::models::session::SessionData;

#[derive(Clone)]
pub struct SessionService {
    db_pool: Pool<Postgres>,
    redis_pool: bb8::Pool<RedisConnectionManager>,
}

impl SessionService {
    pub fn new(db_pool: Pool<Postgres>, redis_pool: bb8::Pool<RedisConnectionManager>) -> Self {
        Self {
            db_pool,
            redis_pool,
        }
    }

    // Validate a session with a session_id from a cookie
    pub async fn validate_session(
        &self,
        session_id: &str,
    ) -> Result<Option<String>, anyhow::Error> {
        let mut conn = self.redis_pool.get().await?;

        // Use "sess:{session_id}" as Redis key convention
        let key = format!("sess:{}", session_id);

        // Get value from Redis
        let raw: Option<String> = conn.get(&key).await?;

        match raw {
            Some(json) => {
                let session: SessionData = serde_json::from_str(&json)?;
                Ok(Some(session.user_id))
            }
            None => Ok(None),
        }
    }

    /// Store a session in redis
    pub async fn set_session(
        &self,
        session_id: &str,
        session: &SessionData,
        ttl_seconds: u64,
    ) -> Result<(), anyhow::Error> {
        let mut conn = self.redis_pool.get().await?;

        let key = format!("sess:{}", session_id);
        let value = serde_json::to_string(session)?;

        let _: () = conn.set_ex(key, value, ttl_seconds).await?;

        Ok(())
    }
}
