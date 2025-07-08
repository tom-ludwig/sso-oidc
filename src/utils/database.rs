use dotenv::dotenv;
use sqlx::Pool;
use sqlx::Postgres;
use sqlx::postgres::PgPoolOptions;
use std::env;

pub async fn init_db_pool() -> Result<Pool<Postgres>, sqlx::Error> {
    dotenv().ok();

    let host = env::var("DATABASE_HOST_EXTERNAL").expect("DATABASE_HOST must be set");
    let port = env::var("DATABASE_PORT").expect("DATABASE_PORT must be set");
    let user = env::var("DATABASE_USER").expect("DATABASE_USER must be set");
    let password = env::var("DATABASE_PASSWORD").expect("DATABASE_PASSWORD must be set");
    let dbname = env::var("DATABASE_NAME").expect("DATABASE_NAME must be set");

    let database_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        user, password, host, port, dbname
    );

    // Configure the connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    Ok(pool)
}
