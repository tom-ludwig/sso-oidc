use std::sync::Arc;

use axum::{Extension, Router, routing::post};

use crate::handlers::user_handler::register_user_handler;
use crate::models::services_config::ServicesConfig;

pub fn user_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new()
        .route("/register", post(register_user_handler))
        .layer(Extension(service_config))
}
