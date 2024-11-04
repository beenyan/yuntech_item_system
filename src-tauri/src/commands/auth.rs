use crate::{
    models::login::{AuthState, Login},
    utils::my_result::{ErrMsg, MyResult},
};
use anyhow::anyhow;
use mongodb::bson::doc;
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub async fn login(auth: State<'_, Mutex<AuthState>>, login: Login) -> Result<MyResult<bool>, ()> {
    if let Ok(db) = login.connect().await {
        if let Ok(_) = db.list_collection_names(None).await {
            let mut state = auth.lock().unwrap();
            state.login(db);
            return Ok(Ok(true).into());
        }
    }

    Ok(Err(anyhow!(ErrMsg::DBConnectFailed)).into())
}

#[tauri::command]
pub async fn logout(auth: State<'_, Mutex<AuthState>>) -> Result<MyResult<bool>, ()> {
    Ok(Ok(auth.lock().unwrap().logout()).into())
}

#[tauri::command]
pub async fn is_login(auth: State<'_, Mutex<AuthState>>) -> Result<MyResult<bool>, ()> {
    Ok(Ok(auth.lock().unwrap().is_login()).into())
}
