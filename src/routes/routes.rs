use std::sync::Arc;

use axum::Router;

use crate::{models::services_config::ServicesConfig, utils::token_issuer::TokenIssuer};

use super::{auth::auth_routes, authorize_routes::authorize_routes, token_routes::token_routes};

pub fn setup_routes(services: Arc<ServicesConfig>, token_issuer: Arc<TokenIssuer>) -> Router {
    let authorize_routes = authorize_routes(services.clone());
    let token_routes = token_routes(services.clone(), token_issuer);
    let auth_routes = auth_routes(services);

    Router::new()
        .nest("/oauth", authorize_routes)
        .nest("/oauth", token_routes)
        .nest("/oauth", auth_routes)
}
