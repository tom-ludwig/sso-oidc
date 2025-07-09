use std::sync::Arc;

use axum::Router;

use crate::{models::services_config::ServicesConfig, utils::token_issuer::TokenIssuer};

use super::{authorize_routes::authorize_routes, token_routes::token_routes};

pub fn setup_routes(services: Arc<ServicesConfig>, token_issuer: Arc<TokenIssuer>) -> Router {
    // let user_routes = user_routes(services.clone());
    let authorize_routes = authorize_routes(services.clone());
    let token_routes = token_routes(services, token_issuer);

    Router::new()
        // .nest("/api", user_routes)
        .nest("/oauth", authorize_routes)
        .nest("/oauth", token_routes)
}
