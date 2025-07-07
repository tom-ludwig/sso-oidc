use std::sync::Arc;

use models::services_config::ServicesConfig;
use routes::routes::setup_routes;
use services::user_service::UserService;
use tokio::net::TcpListener;
use utils::database::init_db_pool;

mod handlers;
mod models;
mod routes;
mod services;
mod utils;

#[tokio::main]
async fn main() {
    let db_pool = init_db_pool()
        .await
        .expect("Failed to connect to the database: {:?}");

    println!("Successfully connected to the database");

    let user_service = UserService::new(db_pool);
    let services = Arc::new(ServicesConfig { user_service });

    let main_router = setup_routes(services);

    let port = 8080;
    let address = format!("0.0.0.0:{port}");
    let listener = TcpListener::bind(&address).await.unwrap();

    println!("Server running on: {port}");
    axum::serve(listener, main_router).await.unwrap();
}
