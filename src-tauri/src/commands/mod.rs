use crate::{configs::db::Coll, models::login::AuthState, utils::my_result::MyResult};
use futures::TryStreamExt;
use mongodb::bson::{doc, Bson};
use std::sync::Mutex;
use tauri::State;

pub mod auth;
pub mod item;
pub mod lend;
pub mod maintenance;
pub mod user;

#[tauri::command]
pub async fn get_export_history_years(
    auth: State<'_, Mutex<AuthState>>,
) -> Result<MyResult<Vec<i32>>, ()> {
    let db = match auth.lock().unwrap().get_db() {
        Ok(db) => db,
        Err(err) => return Ok(Err(err).into()),
    };

    let coll = db.collection::<i32>(Coll::LEND);
    let pipeline = vec![
        doc! {
            "$project": {
                "year": { "$year": "$due_date" }
            }
        },
        doc! {
            "$unionWith": {
                "coll": "maintenances",
                "pipeline": [
                    { "$project": { "year": { "$year": "$start_date" } } }
                ]
            }
        },
        doc! {
            "$group": { "_id": "$year" }
        },
        doc! {
            "$sort": { "_id": 1 }
        },
    ];
    let mut cursor = coll.aggregate(pipeline, None).await.unwrap();
    let mut years = Vec::new();

    while let Some(doc) = cursor.try_next().await.unwrap() {
        if let Some(Bson::Int32(year)) = doc.get("_id") {
            years.push(*year);
        }
    }

    Ok(MyResult::from(years))
}
