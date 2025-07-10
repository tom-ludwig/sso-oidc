use std::sync::Arc;

use axum::{Extension, Json, response::IntoResponse};
use http::StatusCode;

use crate::models::{services_config::ServicesConfig, user_models::CreateUserRequest};

pub async fn register_user_handler(
    Extension(services): Extension<Arc<ServicesConfig>>,
    Json(new_user): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    match services.user_service.create_user(new_user).await {
        Ok(_) => Ok(StatusCode::CREATED.into_response()),
        Err(e) => {
            // Here you can customize the error message based on the description
            let error_message = e.to_string();
            if error_message.contains("Failed to parse tenant UUID") {
                Err((StatusCode::BAD_REQUEST, error_message))
            } else if error_message.contains("hashing failed") {
                Err((StatusCode::INTERNAL_SERVER_ERROR, error_message))
            } else if error_message.contains("email already exists") {
                Err((StatusCode::CONFLICT, error_message))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, error_message))
            }
        }
    }
}
