use crate::{
    models::{
        item::{Item, ItemUpdate},
        login::AuthState,
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
pub async fn item_insert_one(
    auth: State<'_, Mutex<AuthState>>,
    item: Item,
) -> Result<MyResult<InsertOneResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    if let Ok(is_exist) = item.is_exist(&db).await {
        if is_exist {
            return Ok(Err(anyhow!(ErrMsg::DuplicateData)).into());
        }
    }

    Ok(item.insert_one(&db).await.into())
}

#[tauri::command]
pub async fn item_update_one(
    auth: State<'_, Mutex<AuthState>>,
    update_data: ItemUpdate,
) -> Result<MyResult<UpdateResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Item::update_one(&db, update_data).await.into())
}

#[tauri::command]
pub async fn item_find(auth: State<'_, Mutex<AuthState>>) -> Result<MyResult<Vec<Item>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Item::find(&db, None, None).await.into())
}
