use crate::models::services_config::ServicesConfig;
use axum::{
    Extension,
    http::{Response as HttpResponse, StatusCode, header::SET_COOKIE},
    response::IntoResponse,
};
use axum_extra::{TypedHeader, headers::Cookie};
use cookie::Cookie as CookieBuilder;
use std::sync::Arc;

pub async fn logout(
    TypedHeader(cookies): TypedHeader<Cookie>,
    Extension(services): Extension<Arc<ServicesConfig>>,
) -> impl IntoResponse {
    // Get session_id from cookie if it exists
    if let Some(session_id) = cookies.get("session_id") {
        // Delete session from Redis (ignore errors since the goal is cleanup)
        let _ = services.session_service.delete_session(session_id).await;
    }

    // Create expired cookies to remove them from the client
    let session_cookie = CookieBuilder::build(("session_id", ""))
        .path("/")
        .max_age(cookie::time::Duration::seconds(0))
        .http_only(true)
        .secure(true)
        .same_site(cookie::SameSite::Lax);

    let refresh_cookie = CookieBuilder::build(("refresh_token", ""))
        .path("/oauth/refresh")
        .max_age(cookie::time::Duration::seconds(0))
        .http_only(true)
        .secure(true)
        .same_site(cookie::SameSite::Lax);

    // Create response with both expired cookies
    let mut response = HttpResponse::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json");

    // Add both Set-Cookie headers
    response = response.header(SET_COOKIE, refresh_cookie.to_string());
    response = response.header(SET_COOKIE, session_cookie.to_string());

    let body = r#"{"message": "Logged out successfully"}"#;

    response
        .body(body.into())
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}

