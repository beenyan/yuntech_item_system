use crate::{
    models::{
        login::AuthState,
        user::{User, UserUpdate},
    },
    utils::my_result::{ErrMsg, MyResult},
};
use anyhow::anyhow;
use mongodb::{
    bson::doc,
    results::{InsertOneResult, UpdateResult},
};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub async fn user_insert_one(
    auth: State<'_, Mutex<AuthState>>,
    user: User,
) -> Result<MyResult<InsertOneResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    if let Ok(is_exist) = user.is_exist(&db).await {
        if is_exist {
            return Ok(Err(anyhow!(ErrMsg::DuplicateData)).into());
        }
    }

    Ok(user.insert_one(&db).await.into())
}

#[tauri::command]
pub async fn user_update_one(
    auth: State<'_, Mutex<AuthState>>,
    update_data: UserUpdate,
) -> Result<MyResult<UpdateResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(User::update_one(&db, update_data).await.into())
}

#[tauri::command]
pub async fn user_find(auth: State<'_, Mutex<AuthState>>) -> Result<MyResult<Vec<User>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(User::find(&db, None, None).await.into())
}
