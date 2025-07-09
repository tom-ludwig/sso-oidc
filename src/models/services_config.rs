use crate::services::{
    authorize_code_service::AuthorizeCodeService, session_service::SessionService,
    user_service::UserService,
};

pub struct ServicesConfig {
    pub user_service: UserService,
    pub auth_code_service: AuthorizeCodeService,
    pub session_service: SessionService,
}
