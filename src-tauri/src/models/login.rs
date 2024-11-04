use crate::{configs::db, utils::my_result::ErrMsg};
use anyhow::{anyhow, Result};
use mongodb::Database;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Login {
    host: String,
    username: String,
    password: String,
}

impl Login {
    pub async fn connect(&self) -> Result<Database> {
        let db = db::connect(&self.host, &self.username, &self.password).await?;

        Ok(db)
    }
}

pub struct AuthState {
    db: Option<Database>,
    is_logged: bool,
}

impl AuthState {
    pub fn is_login(&self) -> bool {
        self.is_logged
    }

    pub fn login(&mut self, db: Database) {
        self.db = Some(db);
        self.is_logged = true;
    }

    pub fn logout(&mut self) -> bool {
        self.db = None;
        self.is_logged = false;

        true
    }

    pub fn get_db(&self) -> Result<Database> {
        if self.is_logged && self.db.is_some() {
            return Ok(self.db.clone().unwrap());
        }

        Err(anyhow!(ErrMsg::DBConnectYet))
    }
}

impl Default for AuthState {
    fn default() -> Self {
        Self {
            db: None,
            is_logged: false,
        }
    }
}
