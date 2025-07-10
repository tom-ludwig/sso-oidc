use crate::models::config::application::ApplicationsConfig;
use crate::models::config::tenant::TenantsConfig;
use crate::models::config::user::UserConfig;
use std::path::Path;
use tokio::fs;

pub async fn load_tenants_config<P: AsRef<Path>>(path: P) -> Result<TenantsConfig, anyhow::Error> {
    let content = fs::read_to_string(path).await?;
    let config: TenantsConfig = serde_yaml::from_str(&content)?;
    Ok(config)
}

pub async fn load_applications_config<P: AsRef<Path>>(
    path: P,
) -> Result<ApplicationsConfig, anyhow::Error> {
    let content = fs::read_to_string(path).await?;
    let config: ApplicationsConfig = serde_yaml::from_str(&content)?;
    Ok(config)
}

pub async fn load_users_config<P: AsRef<Path>>(path: P) -> Result<UserConfig, anyhow::Error> {
    let content = fs::read_to_string(path).await?;
    let config: UserConfig = serde_yaml::from_str(&content)?;

    Ok(config)
}
