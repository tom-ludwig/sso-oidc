use bb8_redis::{RedisConnectionManager, bb8::Pool};
use dotenv::dotenv;
use redis::AsyncCommands;
use std::env;

pub async fn create_redis_pool() -> Result<Pool<RedisConnectionManager>, anyhow::Error> {
    dotenv().ok();

    let redis_url = env::var("REDIS_URL").expect("REDIS_URL must be set");

    // Create a connection manager for Redis
    let manager = RedisConnectionManager::new(redis_url).expect("Invalid Redis URL");

    // Build a connection pool with a defined maximum size
    let pool = Pool::builder()
        .max_size(15)
        .build(manager)
        .await
        .expect("Failed to create Redis connection pool");

    {
        let mut conn = pool.get().await?;
        let pong: String = conn.ping().await?;

        if pong.to_uppercase() != "PONG" {
            anyhow::bail!("Unexpected PING response from Redis: {}", pong);
        }
        println!("Successfully connected to redis");
    }

    Ok(pool)
}
