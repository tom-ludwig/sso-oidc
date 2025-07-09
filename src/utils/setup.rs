use crate::models::services_config::ServicesConfig;
use crate::routes::routes::setup_routes;
use crate::services::authorize_code_service::AuthorizeCodeService;
use crate::services::session_service::SessionService;
use crate::services::user_service::UserService;
use crate::utils::database::create_postgres_pool;
use crate::utils::redis_utils::create_redis_pool;
use axum::Router;
use bb8_redis::{RedisConnectionManager, bb8::Pool as RedisPool};
use sqlx::{Pool as SqlxPool, Postgres};
use std::sync::Arc;
use tokio::net::TcpListener;

pub async fn setup_server() -> Result<(), anyhow::Error> {
    let (sqlx_pool, redis_pool) = setup_databases()
        .await
        .expect("Failed to setup database and Redis pools");

    let services = setup_services(sqlx_pool, redis_pool).expect("Failed to setup services");

    let (listener, main_router) = setup_router(services)
        .await
        .expect("Failed to setup router");

    println!("Server running on: {}", listener.local_addr()?);
    axum::serve(listener, main_router)
        .await
        .expect("Server failed to start");

    Ok(())
}

async fn setup_databases()
-> Result<(SqlxPool<Postgres>, RedisPool<RedisConnectionManager>), anyhow::Error> {
    let sqlx_pool = create_postgres_pool()
        .await
        .expect("Failed to create Postgres Connection Pool");

    let redis_pool = create_redis_pool()
        .await
        .expect("Failed to create Redis Connection Pool");

    Ok((sqlx_pool, redis_pool))
}

fn setup_services(
    sqlx_pool: SqlxPool<Postgres>,
    redis_pool: RedisPool<RedisConnectionManager>,
) -> Result<Arc<ServicesConfig>, anyhow::Error> {
    let user_service = UserService::new(sqlx_pool.clone());
    let auth_code_service = AuthorizeCodeService::new(sqlx_pool.clone(), redis_pool.clone());
    let session_service = SessionService::new(sqlx_pool.clone(), redis_pool);

    let services = Arc::new(ServicesConfig {
        user_service,
        auth_code_service,
        session_service,
    });

    Ok(services)
}

async fn setup_router(
    services: Arc<ServicesConfig>,
) -> Result<(TcpListener, Router), anyhow::Error> {
    let main_router = setup_routes(services);

    let port = 8080;
    let address = format!("0.0.0.0:{port}");
    let listener = TcpListener::bind(&address).await?;

    Ok((listener, main_router))
}
