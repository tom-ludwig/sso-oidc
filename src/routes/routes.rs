use std::sync::Arc;

use axum::{Router, routing::get};
use serde_json::Value;

use crate::{
    handlers::{jwk_set_handler::jwk_set_handler, oidc_discovery_handler::discovery_handler},
    models::services_config::ServicesConfig,
    utils::token_issuer::TokenIssuer,
};

use super::{auth::auth_routes, authorize_routes::authorize_routes, token_routes::token_routes};

pub fn setup_routes(
    services: Arc<ServicesConfig>,
    token_issuer: Arc<TokenIssuer>,
    jwks: Value,
) -> Router {
    let authorize_routes = authorize_routes(services.clone());
    let token_routes = token_routes(services.clone(), token_issuer);
    let auth_routes = auth_routes(services);

    let sharred_jwks = Arc::new(jwks);

    Router::new()
        .route("/.well-known/openid-configuration", get(discovery_handler))
        .route("/.well-known/jwks.json", get(jwk_set_handler))
        .with_state(sharred_jwks)
        .nest("/oauth", authorize_routes)
        .nest("/oauth", token_routes)
        .nest("/oauth", auth_routes)
}
