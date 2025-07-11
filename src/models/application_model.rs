#[derive(Debug)]
pub struct Application {
    pub client_secret: String,
    pub redirect_uris: Vec<String>,
}
