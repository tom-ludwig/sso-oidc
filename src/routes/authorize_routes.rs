use axum::{Extension, Router, routing::get};
use std::sync::Arc;

use crate::{
    handlers::authorization_code_handler::authorize, models::services_config::ServicesConfig,
};

pub fn authorize_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new()
        .route("/authorize", get(authorize))
        .layer(Extension(service_config))
}
