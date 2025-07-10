use crate::routes::routes::setup_routes;
use crate::services::authorize_code_service::AuthorizeCodeService;
use crate::services::config::application_service::ApplicationService;
use crate::services::config::tenant_service::TenantService;
use crate::services::session_service::SessionService;
use crate::services::user_service::UserService;
use crate::utils::config_loader::{load_applications_config, load_tenants_config};
use crate::utils::database::create_postgres_pool;
use crate::utils::redis_utils::create_redis_pool;
use crate::utils::token_verifier::TokenVerifier;
use crate::{models::services_config::ServicesConfig, utils::token_issuer::TokenIssuer};
use axum::Router;
use bb8_redis::{RedisConnectionManager, bb8::Pool as RedisPool};
use http::HeaderValue;
use http::header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE, LOCATION, ORIGIN};
use sqlx::{Pool as SqlxPool, Postgres};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

pub async fn setup_server() -> Result<(), anyhow::Error> {
    let (sqlx_pool, redis_pool) = setup_databases()
        .await
        .expect("Failed to setup database and Redis pools");

    let token_issuer = Arc::new(
        TokenIssuer::from_pem_file("keys/private.pem", "https://sso-oidc.com")
            .expect("Failed to load Certificates for Token Issuer"),
    );

    let services = setup_services(sqlx_pool.clone(), redis_pool);
    let (tenant_service, application_service) = setup_config_services(sqlx_pool);

    setup_configurations(tenant_service, application_service)
        .await
        .expect("Failed to load configurations");

    // TODO: Change audience to be custom for each check
    let _token_verifier = Arc::new(
        TokenVerifier::from_pem_file("keys/public.pem", "https://sso-oidc.com", "aud")
            .expect("Failed to load Certificates for Token Verifier"),
    );

    let (main_router, addr) = setup_router(services, token_issuer)
        .await
        .expect("Failed to setup router");

    println!("Server running on: {addr}");
    axum_server::bind(addr)
        .serve(main_router.into_make_service())
        .await
        .unwrap();

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

    Arc::new(ServicesConfig {
        user_service,
        auth_code_service,
        session_service,
    })
}

fn setup_config_services(sqlx_pool: SqlxPool<Postgres>) -> (TenantService, ApplicationService) {
    let tenant_service = TenantService::new(sqlx_pool.clone());
    let application_service = ApplicationService::new(sqlx_pool);

    (tenant_service, application_service)
}

async fn setup_router(
    services: Arc<ServicesConfig>,
    token_issuer: Arc<TokenIssuer>,
) -> Result<(Router, SocketAddr), anyhow::Error> {
    let cors = CorsLayer::new()
        // New old one (from the Pepe)
        // .allow_origin(["http://localhost:5173".parse::<HeaderValue>().unwrap()])
        // .allow_credentials(true)
        // .allow_methods([http::Method::GET, http::Method::POST])
        // .allow_headers(Any);
        // .allow_origin("http://myapp.local:5173".parse::<HeaderValue>().unwrap())
        //
        // Old old one
        // .allow_origin("http://localhost:5173/".parse::<HeaderValue>().unwrap())
        // .allow_credentials(true)
        // .allow_methods([http::Method::GET, http::Method::POST])
        // .allow_headers([ORIGIN, CONTENT_TYPE, ACCEPT, AUTHORIZATION])
        // .expose_headers([LOCATION]);
        //
        .allow_origin(["http://localhost:5173/login".parse::<HeaderValue>().unwrap(), "http://localhost:5173/".parse::<HeaderValue>().unwrap(), "http://localhost:5173".parse::<HeaderValue>().unwrap()])
        // .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let main_router = setup_routes(services, token_issuer).layer(cors);

    let port = 8080;
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    // let addr = SocketAddr::from(([127, 0, 0, 1], port));

    Ok((main_router, addr))
}

async fn setup_configurations(
    tenant_service: TenantService,
    application_service: ApplicationService,
) -> Result<(), anyhow::Error> {
    let tenants_config = load_tenants_config("config/tenants.yaml").await?;
    let applications_config = load_applications_config("config/applications.yaml").await?;

    for tenant in tenants_config.tenants {
        let tenant_id = tenant.id;
        if tenant_service.create_tenant(tenant).await.is_err() {
            println!("Tenant {tenant_id} already exists. Skipping...");
        }
    }

    for application in applications_config.applications {
        let application_id = application.id;
        if application_service
            .create_application(application)
            .await
            .is_err()
        {
            println!("Application {application_id} already exists. Skipping...");
        }
    }

    Ok(())
}
