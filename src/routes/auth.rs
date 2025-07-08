use std::sync::Arc;

use axum::{Extension, Router, routing::get};

use crate::{handlers::login_handler::authenticate_user, models::services_config::ServicesConfig};

pub fn auth_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new()
        .route("/login", get(authenticate_user))
        .layer(Extension(service_config))
}
