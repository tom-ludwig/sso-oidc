use std::sync::Arc;

use axum::{Extension, Router, routing::get};

use crate::{handlers::user_handler::get_test_user, models::services_config::ServicesConfig};

pub fn user_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new()
        .route("/test-users", get(get_test_user))
        .layer(Extension(service_config))
}
