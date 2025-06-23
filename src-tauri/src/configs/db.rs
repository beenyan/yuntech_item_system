use anyhow::Result;
use mongodb::Database;
use mongodb::{options::ClientOptions, Client};

const DATABASE_NAME: &str = "item_system";

pub struct Coll {}

#[allow(dead_code)]
impl Coll {
    pub const USER: &'static str = "users";
    pub const MAINTENANCE: &'static str = "maintenances";
    pub const ITEM: &'static str = "items";
    pub const LEND: &'static str = "lends";
    pub const VIEW_LEND: &'static str = "view_lends";
    pub const VIEW_MAINTENANCE: &'static str = "view_maintenances";
}

pub async fn connect(host: &str, username: &str, password: &str) -> Result<Database> {
    let uri = format!("mongodb://{username}:{password}@{host}:27017");
    let mut client_options = ClientOptions::parse_async(&uri).await?;
    client_options.connect_timeout = Some(std::time::Duration::from_secs(5));
    client_options.default_database = Some(DATABASE_NAME.to_string());
    client_options.app_name = Some("Item System".to_string());

    let client = Client::with_options(client_options)?;
    let database = client.database(DATABASE_NAME);

    Ok(database)
}
