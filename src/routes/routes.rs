use std::sync::Arc;

use axum::Router;

use crate::models::services_config::ServicesConfig;

use super::authorize_routes::authorize_routes;

use super::auth::auth_routes;
use super::user_routes::user_routes;


pub fn setup_routes(services: Arc<ServicesConfig>) -> Router {
    let user_routes = user_routes(services.clone());
    let auth_routes = auth_routes(services.clone());
    let authorize_routes = authorize_routes(services);
  


    Router::new()
        .nest("/api", user_routes)
        .nest("/auth", auth_routes)
        .nest("/v1", authorize_routes)
        // .layer(cors)
}
