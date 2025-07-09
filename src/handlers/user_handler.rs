<<<<<<< HEAD
use std::sync::Arc;

use axum::{Extension, http::StatusCode, response::IntoResponse};

use crate::models::services_config::ServicesConfig;

pub async fn get_test_user(
    Extension(services): Extension<Arc<ServicesConfig>>,
) -> impl IntoResponse {
    services.user_service.test_create_user().await;

    StatusCode::OK
}
=======
// pub async fn get_test_user(
//     Query(params): Query<AuthorizeRequest>,
//     TypedHeader(cookies): TypedHeader<Cookie>,
//     Extension(services): Extension<Arc<ServicesConfig>>,
// ) -> impl IntoResponse {
//     services.user_service.test_create_user();
//
//     return StatusCode::OK;
// }
>>>>>>> master
