use crate::{
    models::{
        lend::{Lend, LendUpdate, LendView, ReturnLendItem},
        login::AuthState,
    },
    utils::my_result::MyResult,
};
use mongodb::{
    bson::{doc, oid::ObjectId},
    results::{DeleteResult, UpdateResult},
};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub async fn lend_insert_one(
    auth: State<'_, Mutex<AuthState>>,
    mut lend: Lend,
) -> Result<MyResult<LendView>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(lend.insert_one(&db).await.into())
}

#[tauri::command]
pub async fn lend_update_one(
    auth: State<'_, Mutex<AuthState>>,
    update_data: LendUpdate,
) -> Result<MyResult<UpdateResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Lend::update_one(&db, update_data).await.into())
}

#[tauri::command]
pub async fn lend_find(auth: State<'_, Mutex<AuthState>>) -> Result<MyResult<Vec<LendView>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(LendView::find(&db, None, None).await.into())
}

#[tauri::command]
pub async fn return_lend_item(
    auth: State<'_, Mutex<AuthState>>,
    return_lend_item: ReturnLendItem,
) -> Result<MyResult<UpdateResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(return_lend_item.insert_one(&db).await.into())
}

#[tauri::command]
pub async fn lend_delete_one(
    auth: State<'_, Mutex<AuthState>>,
    _id: ObjectId,
) -> Result<MyResult<DeleteResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Lend::delete_one(&db, _id).await.into())
}
