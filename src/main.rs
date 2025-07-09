use std::sync::Arc;

use models::services_config::ServicesConfig;
use routes::routes::setup_routes;
use services::authorize_code_service::AuthorizeCodeService;
use services::session_service::SessionService;
use services::user_service::UserService;
use utils::database::init_db_pool;
use utils::redis_utils::create_redis_pool;

use http::HeaderValue;
use std::net::SocketAddr;
use tower_http::cors::{Any, CorsLayer};

mod handlers;
mod models;
mod routes;
mod services;
mod utils;

use utils::setup::setup_server;

#[tokio::main]
async fn main() {
    if let Err(e) = setup_server().await {
        eprintln!("Failed to start server: {}", e);
        std::process::exit(1);
    }
}
