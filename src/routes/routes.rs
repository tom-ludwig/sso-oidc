use std::sync::Arc;

use axum::Router;

use crate::models::services_config::ServicesConfig;

use super::user_routes::user_routes;

pub fn setup_routes(services: Arc<ServicesConfig>) -> Router {
    let user_routes = user_routes(services);

    Router::new().nest("/api", user_routes)
}
