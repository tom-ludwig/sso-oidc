use std::sync::Arc;

use axum::{Extension, Router, routing::post};

use crate::{
    handlers::token_handler::token, models::services_config::ServicesConfig,
    utils::token_issuer::TokenIssuer,
};

pub fn token_routes(service_config: Arc<ServicesConfig>, token_issuer: Arc<TokenIssuer>) -> Router {
    Router::new()
        .route("/token", post(token))
        .layer(Extension(service_config))
        .layer(Extension(token_issuer))
}
