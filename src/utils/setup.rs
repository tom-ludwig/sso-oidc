use crate::models::services_config::ServicesConfig;
use crate::routes::routes::setup_routes;
use crate::services::authorize_code_service::AuthorizeCodeService;
use crate::services::config::application_service::ApplicationService;
use crate::services::config::tenant_service::TenantService;
use crate::services::session_service::SessionService;
use crate::services::user_service::UserService;
use crate::utils::config_loader::{load_applications_config, load_tenants_config};
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

    let services = setup_services(sqlx_pool, redis_pool);

    setup_configurations(services.clone())
        .await
        .expect("Failed to load configurations");

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
) -> Arc<ServicesConfig> {
    let user_service = UserService::new(sqlx_pool.clone());
    let auth_code_service = AuthorizeCodeService::new(sqlx_pool.clone(), redis_pool.clone());
    let session_service = SessionService::new(sqlx_pool.clone(), redis_pool);
    let tenant_service = TenantService::new(sqlx_pool.clone());
    let application_service = ApplicationService::new(sqlx_pool);

    Arc::new(ServicesConfig {
        user_service,
        auth_code_service,
        session_service,
        tenant_service,
        application_service,
    })
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

async fn setup_configurations(services: Arc<ServicesConfig>) -> Result<(), anyhow::Error> {
    let tenants_config = load_tenants_config("config/tenants.yaml").await?;
    let applications_config = load_applications_config("config/applications.yaml").await?;

    for tenant in tenants_config.tenants {
        let tenant_id = tenant.id.clone();
        if let Err(_) = services.tenant_service.create_tenant(tenant).await {
            println!("Tenant {} already exists. Skipping...", tenant_id);
        }
    }

    for application in applications_config.applications {
        let application_id = application.id.clone();
        if let Err(_) = services
            .application_service
            .create_application(application)
            .await
        {
            println!("Application {} already exists. Skipping...", application_id);
        }
    }

    Ok(())
}
