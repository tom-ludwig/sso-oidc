use dotenv::dotenv;
use sqlx::Pool;
use sqlx::Postgres;
use sqlx::postgres::PgPoolOptions;
use std::env;

pub async fn create_postgres_pool() -> Result<Pool<Postgres>, sqlx::Error> {
    dotenv().ok();

    let host = env::var("DATABASE_HOST_EXTERNAL").expect("DATABASE_HOST_EXTERNAL must be set");
    let port = env::var("DATABASE_PORT").expect("DATABASE_PORT must be set");
    let user = env::var("POSTGRES_USER").expect("POSTGRES_USER must be set");
    let password = env::var("POSTGRES_PASSWORD").expect("POSTGRES_PASSWORD must be set");
    let dbname = env::var("POSTGRES_DB").expect("POSTGRES_DB must be set");

    let database_url = format!("postgres://{user}:{password}@{host}:{port}/{dbname}");

    // Configure the connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    Ok(pool)
}
