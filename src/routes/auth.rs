use std::sync::Arc;

use axum::{Router, routing::post};

use crate::{handlers::login_handler::authenticate_user, models::services_config::ServicesConfig};

pub fn auth_routes(service_config: Arc<ServicesConfig>) -> Router {
    Router::new().route(
        "/login",
        post({
            let shared_state = Arc::clone(&service_config);
            move |json| authenticate_user(shared_state, json)
        }),
    )
}
