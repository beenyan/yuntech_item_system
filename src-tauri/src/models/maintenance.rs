use crate::models::lend::{LendItemId, LendItemView};
use crate::models::user::User;
use crate::utils::default::option_deserialize_bson_datetime_from_rfc3339_string;
use crate::{configs::db::Coll, doc_update, utils::my_result::ErrMsg};
use anyhow::{anyhow, Result};
use chrono::{NaiveDate, TimeZone, Utc};
use futures::TryStreamExt;
use mongodb::results::DeleteResult;
use mongodb::{
    bson::serde_helpers::deserialize_bson_datetime_from_rfc3339_string,
    bson::{doc, oid::ObjectId, DateTime, Document},
    options::FindOptions,
    results::{InsertOneResult, UpdateResult},
    Collection, Database,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MaintenanceUpdate {
    pub(crate) _id: ObjectId,
    pub(crate) item: Option<LendItemId>,
    pub(crate) manager: Option<ObjectId>,
    pub(crate) cost: Option<u32>,
    pub(crate) content: Option<String>,
    pub(crate) cause: Option<String>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub(crate) start_date: Option<DateTime>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub(crate) end_date: Option<DateTime>,
    pub(crate) remark: Option<String>,
}

impl MaintenanceUpdate {
    fn doc_query(&self) -> Document {
        doc! { "_id": &self._id }
    }

    fn doc_update(&self) -> Result<Document> {
        doc_update! {
            "item"=> &self.item,
            "manager"=> &self.manager,
            "cost"=> &self.cost,
            "content"=> &self.content,
            "cause"=> &self.cause,
            "start_date"=> &self.start_date,
            "end_date"=> &self.end_date,
            "remark"=> &self.remark
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Maintenance {
    #[serde(default)]
    pub _id: ObjectId,
    item: LendItemId,
    manager: ObjectId,
    cost: u32,
    content: String,
    cause: String,
    #[serde(deserialize_with = "deserialize_bson_datetime_from_rfc3339_string")]
    start_date: DateTime,
    #[serde(deserialize_with = "deserialize_bson_datetime_from_rfc3339_string")]
    end_date: DateTime,
    remark: String,
    #[serde(default = "DateTime::now")]
    created_at: DateTime,
    #[serde(default = "DateTime::now")]
    updated_at: DateTime,
}

impl Maintenance {
    fn get_collection(db: &Database) -> Collection<Self> {
        db.collection::<Self>(Coll::MAINTENANCE)
    }

    pub async fn insert_one(&self, db: &Database) -> Result<InsertOneResult> {
        let coll = Self::get_collection(db);
        let result = coll.insert_one(self, None).await?;
        Ok(result)
    }

    pub async fn insert_and_fetch(&self, db: &Database) -> Result<Self> {
        let coll = Self::get_collection(db);
        let result = coll.insert_one(self, None).await?;

        let filter = doc! { "_id": result.inserted_id };
        let record = coll
            .find_one(filter, None)
            .await?
            .ok_or_else(|| anyhow!(ErrMsg::FindDataFailed))?;

        Ok(record)
    }

    pub async fn update_by_id(
        db: &Database,
        update_data: MaintenanceUpdate,
    ) -> Result<UpdateResult> {
        let coll = Self::get_collection(db);
        let query = update_data.doc_query();
        let update = update_data.doc_update()?;
        let result = coll.update_one(query, update, None).await?;

        Ok(result)
    }

    pub async fn delete_by_id(db: &Database, _id: ObjectId) -> Result<DeleteResult> {
        let coll = Self::get_collection(db);
        let query = doc! { "_id": _id };
        let result = coll.delete_one(query, None).await?;

        Ok(result)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MaintenanceView {
    _id: ObjectId,
    item: LendItemView,
    manager: User,
    cost: u32,
    content: String,
    cause: String,
    start_date: DateTime,
    end_date: DateTime,
    remark: String,
    created_at: DateTime,
    updated_at: DateTime,
}

impl MaintenanceView {
    fn get_collection(db: &Database) -> Collection<Self> {
        db.collection::<Self>(Coll::VIEW_MAINTENANCE)
    }

    pub async fn find(
        db: &Database,
        filter: impl Into<Option<Document>>,
        options: impl Into<Option<FindOptions>>,
    ) -> Result<Vec<Self>> {
        let coll = Self::get_collection(db);
        let cursor = coll.find(filter, options).await?;
        let results = cursor.try_collect::<Vec<Self>>().await?;

        Ok(results)
    }

    pub async fn find_by_filter(db: &Database, filter: MaintenanceFilter) -> Result<Vec<Self>> {
        let coll = Self::get_collection(db);
        let mut query = doc! {};

        if let Some(item) = filter.item.filter(|s| !s.is_empty()) {
            query.insert(
                "$or",
                vec![
                    doc! { "item.name": { "$regex": &item, "$options": "i" } },
                    doc! { "item": { "$regex": &item, "$options": "i" } },
                ],
            );
        }

        if let Some(manager) = filter.manager.filter(|s| !s.is_empty()) {
            query.insert("manager.name", doc! { "$regex": manager, "$options": "i" });
        }

        if let Some(content) = filter.content.filter(|s| !s.is_empty()) {
            query.insert("content", doc! { "$regex": content, "$options": "i" });
        }

        if let Some(cause) = filter.cause.filter(|s| !s.is_empty()) {
            query.insert("cause", doc! { "$regex": cause, "$options": "i" });
        }

        if let (Some(start_date), Some(end_date)) = (filter.start_date, filter.end_date) {
            query.insert(
                "start_date",
                doc! {
                    "$gte": start_date,
                    "$lt": end_date,
                },
            );
        }

        if let Some(remark) = filter.remark.filter(|s| !s.is_empty()) {
            query.insert("remark", doc! { "$regex": remark, "$options": "i" });
        }

        let cursor = coll.find(query, None).await?;
        let results = cursor.try_collect().await?;

        Ok(results)
    }

    pub async fn history_find_by_year(db: &Database, year: i32) -> Result<Vec<Self>> {
        let start_date_time = DateTime::from_chrono(
            Utc.from_utc_datetime(
                &NaiveDate::from_yo_opt(year, 1)
                    .unwrap()
                    .and_hms_opt(0, 0, 0)
                    .unwrap(),
            ),
        );
        let end_date_time = DateTime::from_chrono(
            Utc.from_utc_datetime(
                &NaiveDate::from_yo_opt(year + 1, 1)
                    .unwrap()
                    .and_hms_opt(0, 0, 0)
                    .unwrap(),
            ),
        );

        let coll = Self::get_collection(db);
        let filter = doc! {
            "start_date": {
                "$gte": start_date_time,
                "$lt": end_date_time
            }
        };

        let cursor = coll.find(filter, None).await?;
        let results = cursor.try_collect::<Vec<Self>>().await?;

        Ok(results)
    }
}

#[derive(Debug, Deserialize)]
pub struct MaintenanceFilter {
    pub item: Option<String>,
    pub manager: Option<String>,
    pub content: Option<String>,
    pub cause: Option<String>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub start_date: Option<DateTime>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub end_date: Option<DateTime>,
    pub remark: Option<String>,
}
