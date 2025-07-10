use std::sync::Arc;

use axum::{
    extract::State,
    http::{Response, StatusCode, header},
    response::IntoResponse,
};
use serde_json::Value;

pub async fn jwk_set_handler(State(jwk_set): State<Arc<Value>>) -> impl IntoResponse {
    match serde_json::to_string(&jwk_set) {
        Ok(body) => Response::builder()
            .status(StatusCode::OK)
            .header(header::CONTENT_TYPE, "application/json")
            .body(axum::body::Body::from(body))
            .unwrap(),
        Err(e) => Response::builder()
            .status(StatusCode::INTERNAL_SERVER_ERROR)
            .body(format!("Failed to serialize JSON: {}", e).into())
            .unwrap(),
    }
}
