use crate::services::{
    authorize_code_service::AuthorizeCodeService, config::application_service::ApplicationService,
    config::tenant_service::TenantService, session_service::SessionService,
    user_service::UserService,
};

pub struct ServicesConfig {
    pub user_service: UserService,
    pub auth_code_service: AuthorizeCodeService,
    pub session_service: SessionService,
    pub tenant_service: TenantService,
    pub application_service: ApplicationService,
}
