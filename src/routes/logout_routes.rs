use std::sync::Arc;

use axum::{Extension, Router, routing::post};

use crate::{
    handlers::logout_handler::logout,
    models::services_config::ServicesConfig,
};

pub fn logout_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new()
        .route("/logout", post(logout))
        .layer(Extension(service_config))
} 