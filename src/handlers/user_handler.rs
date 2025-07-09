// pub async fn get_test_user(
//     Query(params): Query<AuthorizeRequest>,
//     TypedHeader(cookies): TypedHeader<Cookie>,
//     Extension(services): Extension<Arc<ServicesConfig>>,
// ) -> impl IntoResponse {
//     services.user_service.test_create_user();
//
//     return StatusCode::OK;
// }
