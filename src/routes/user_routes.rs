use std::sync::Arc;

use axum::{Extension, Router, routing::get};

use crate::models::services_config::ServicesConfig;

pub fn user_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new().layer(Extension(service_config))
}
