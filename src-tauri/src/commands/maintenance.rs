use crate::{
    models::{
        login::AuthState,
        maintenance::{Maintenance, MaintenanceUpdate, MaintenanceView},
    },
    utils::my_result::MyResult,
};
use mongodb::{
    bson::{doc, oid::ObjectId},
    options::FindOptions,
    results::{DeleteResult, InsertOneResult, UpdateResult},
};
use std::sync::Mutex;
use tauri::State;

#[tauri::command]
pub async fn maintenance_insert_one(
    auth: State<'_, Mutex<AuthState>>,
    data: Maintenance,
) -> Result<MyResult<InsertOneResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(data.insert_one(&db).await.into())
}

#[tauri::command]
pub async fn maintenance_update_by_id(
    auth: State<'_, Mutex<AuthState>>,
    update_data: MaintenanceUpdate,
) -> Result<MyResult<UpdateResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Maintenance::update_by_id(&db, update_data).await.into())
}

#[tauri::command]
pub async fn maintenance_delete_by_id(
    auth: State<'_, Mutex<AuthState>>,
    _id: ObjectId,
) -> Result<MyResult<DeleteResult>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(Maintenance::delete_by_id(&db, _id).await.into())
}

#[tauri::command]
pub async fn maintenance_find(
    auth: State<'_, Mutex<AuthState>>,
) -> Result<MyResult<Vec<MaintenanceView>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    let options = FindOptions::builder()
        .sort(doc! { "start_date": -1 })
        .limit(200)
        .build();
    Ok(MaintenanceView::find(&db, None, options).await.into())
}

#[tauri::command]
pub async fn maintenance_history_find_by_year(
    auth: State<'_, Mutex<AuthState>>,
    year: i32,
) -> Result<MyResult<Vec<MaintenanceView>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    Ok(MaintenanceView::history_find_by_year(&db, year)
        .await
        .into())
}
