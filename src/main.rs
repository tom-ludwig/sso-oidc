mod handlers;
mod models;
mod routes;
mod services;
mod utils;

use utils::setup::setup_server;

#[tokio::main]
async fn main() {
    if let Err(e) = setup_server().await {
        eprintln!("Failed to start server: {e}");
        std::process::exit(1);
    }
}
