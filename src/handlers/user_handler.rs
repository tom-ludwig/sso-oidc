use std::sync::Arc;

use axum::{
    http::{header::SET_COOKIE, Response as HttpResponse, StatusCode},
    response::IntoResponse,
    Extension, Json,
};

use cookie::Cookie;
use uuid::Uuid;

use crate::models::{services_config::ServicesConfig, user_models::CreateUserRequest};

pub async fn register_user_handler(
    Extension(services): Extension<Arc<ServicesConfig>>,
    Json(new_user): Json<CreateUserRequest>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    match services.user_service.create_user(&new_user).await {
        Ok(_) => {
            let session_id = Uuid::new_v4().to_string();
            let ttl: u64 = 900;

            let user = match services
                .user_service
                .get_user_id_from_email(&new_user.email)
                .await
            {
                Ok(user) => user,
                Err(_) => {
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Failed to retrieve user id from the database.".to_string(),
                    ))
                }
            };

            let cookie = Cookie::build(("session_id", &session_id))
                .path("/")
                .max_age(cookie::time::Duration::seconds(ttl as i64))
                .http_only(true)
                .secure(true)
                .same_site(cookie::SameSite::None);

            let json = match serde_json::to_string(&user) {
                Ok(json) => json,
                Err(_) => {
                    return Err((
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Could not serialize user.".to_string(),
                    ))
                }
            };
            Ok(HttpResponse::builder()
                .status(StatusCode::OK)
                .header(SET_COOKIE, cookie.to_string())
                .body(json.into())
                .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response()))
        }
        Err(e) => {
            // Here you can customize the error message based on the description
            let error_message = e.to_string();
            if error_message.contains("Failed to parse tenant UUID") {
                Err((StatusCode::BAD_REQUEST, error_message))
            } else if error_message.contains("hashing failed") {
                Err((StatusCode::INTERNAL_SERVER_ERROR, error_message))
            } else if error_message.contains("A user with this email or username already exists") {
                Err((StatusCode::CONFLICT, error_message))
            } else {
                Err((StatusCode::INTERNAL_SERVER_ERROR, error_message))
            }
        }
    }
}
