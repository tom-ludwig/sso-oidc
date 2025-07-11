use crate::routes::routes::setup_routes;
use crate::services::application_service::ApplicationClientService;
use crate::services::authorize_code_service::AuthorizeCodeService;
use crate::services::config::application_service::ApplicationService;
use crate::services::config::tenant_service::TenantService;
use crate::services::session_service::SessionService;
use crate::services::user_service:: UserService;
use crate::utils::config_loader::{
    load_applications_config, load_tenants_config, load_users_config,
};
use crate::utils::database::create_postgres_pool;
use crate::utils::redis_utils::create_redis_pool;
use crate::utils::token_verifier::TokenVerifier;
use crate::{models::services_config::ServicesConfig, utils::token_issuer::TokenIssuer};
use axum::Router;
use bb8_redis::{bb8::Pool as RedisPool, RedisConnectionManager};
use http::{HeaderName, HeaderValue, Method};
use serde_json::Value;
use sqlx::{Pool as SqlxPool, Postgres};
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::CorsLayer;

use super::jwks_utils::generate_jwk_set_from_cert;

pub async fn setup_server() -> Result<(), anyhow::Error> {
    let (sqlx_pool, redis_pool) = setup_databases()
        .await
        .expect("Failed to setup database and Redis pools");

    let token_issuer = Arc::new(
        TokenIssuer::from_pem_file("keys/private.pem", "https://sso-oidc.com")
            .expect("Failed to load Certificates for Token Issuer"),
    );

    let services = setup_services(sqlx_pool.clone(), redis_pool);
    let (tenant_service, application_service, user_service) = setup_config_services(sqlx_pool);

    setup_configurations(tenant_service, application_service, user_service)
        .await
        .expect("Failed to load configurations");

    // TODO: Change audience to be custom for each check
    let _token_verifier = Arc::new(
        TokenVerifier::from_pem_file("keys/public.pem", "https://sso-oidc.com", "aud")
            .expect("Failed to load Certificates for Token Verifier"),
    );

    let jwks = setup_jwks().expect("Failed to create JSON Web Key Set");

    let (listener, addr) = setup_router(services, token_issuer, jwks)
        .await
        .expect("Failed to setup router");

    println!("Server running on: {addr}");
    axum_server::bind(addr)
        .serve(listener.into_make_service())
        .await
        .unwrap();

    Ok(())
}

fn setup_jwks() -> Result<serde_json::Value, anyhow::Error> {
    match generate_jwk_set_from_cert("keys/public.pem") {
        Ok(jwk_set) => {
            return Ok(jwk_set);
        }
        Err(e) => {
            return Err(e);
        }
    }
}

async fn setup_databases(
) -> Result<(SqlxPool<Postgres>, RedisPool<RedisConnectionManager>), anyhow::Error> {
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
    let auth_code_service = AuthorizeCodeService::new(redis_pool.clone());
    let session_service = SessionService::new(redis_pool);
    let application_service = ApplicationClientService::new(sqlx_pool.clone());

    Arc::new(ServicesConfig {
        user_service,
        auth_code_service,
        session_service,
        application_service,
    })
}

fn setup_config_services(sqlx_pool: SqlxPool<Postgres>) -> (TenantService, ApplicationService, UserService) {
    let tenant_service = TenantService::new(sqlx_pool.clone());
    let application_service = ApplicationService::new(sqlx_pool.clone());
    let user_service = UserService::new(sqlx_pool);

    (tenant_service, application_service, user_service)
}

async fn setup_router(
    services: Arc<ServicesConfig>,
    token_issuer: Arc<TokenIssuer>,
    jwks: Value,
) -> Result<(Router, SocketAddr), anyhow::Error> {
    let cors = CorsLayer::new()
        .allow_origin([
            "http://localhost:5173".parse::<HeaderValue>().unwrap(),
            "http://localhost:5555".parse::<HeaderValue>().unwrap(),
        ])
        .allow_methods(vec![Method::GET, Method::POST, Method::OPTIONS]) // Specify methods needed
        .allow_headers(vec![
            HeaderName::from_static("content-type"),
            HeaderName::from_static("authorization"),
        ]) // Specify common headers
        .allow_credentials(true);

    let main_router = setup_routes(services, token_issuer, jwks).layer(cors);

    let port = 8080;
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    Ok((main_router, addr))
}

async fn setup_configurations(
    tenant_service: TenantService,
    application_service: ApplicationService,
    user_service: UserService,
) -> Result<(), anyhow::Error> {
    let tenants_config = load_tenants_config("config/tenants.yaml").await?;
    let applications_config = load_applications_config("config/applications.yaml").await?;
    let users_config = load_users_config("config/users.yaml").await?;

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

    for user in users_config.users {
        let user_id = user.id;
        if user_service
            .create_user_without_cookie(user)
            .await
            .is_err() {
            println!("User {user_id} already exists. Skipping...");
        }
    }

    Ok(())
}
