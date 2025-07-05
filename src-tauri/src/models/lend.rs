use super::item::Item;
use crate::models::user::User;
use crate::{
    configs::db::Coll,
    doc_update,
    utils::{default::option_deserialize_bson_datetime_from_rfc3339_string, my_result::ErrMsg},
};
use anyhow::{anyhow, Result};
use chrono::{NaiveDate, TimeZone, Utc};
use futures::TryStreamExt;
use mongodb::bson::Bson;
use mongodb::results::DeleteResult;
use mongodb::Collection;
use mongodb::{
    bson::{
        doc, oid::ObjectId, serde_helpers::deserialize_bson_datetime_from_rfc3339_string, DateTime,
        Document,
    },
    options::FindOptions,
    results::UpdateResult,
    Database,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum BorrowerUser {
    ObjectId(ObjectId),
    User(User),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LendUpdate {
    pub(crate) _id: ObjectId,
    pub(crate) lend_item: Option<LendItemId>,
    pub(crate) lend_item_amount: Option<u32>,
    pub(crate) mortgage_item: Option<ObjectId>,
    pub(crate) mortgage_item_amount: Option<u32>,
    pub(crate) mortgage_money: Option<u32>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub(crate) lend_date_time: Option<DateTime>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub(crate) due_date: Option<DateTime>,
    pub(crate) manager_user: Option<ObjectId>,
    pub(crate) remark: Option<String>,
}

impl LendUpdate {
    fn doc_query(&self) -> Document {
        doc! { "_id": &self._id }
    }

    fn doc_update(&self) -> Result<Document> {
        doc_update! {
            "lend_item" => &self.lend_item,
            "mortgage_item" => &self.mortgage_item,
            "lend_item_amount" => &self.lend_item_amount,
            "mortgage_money" => &self.mortgage_money,
            "mortgage_item_amount" => &self.mortgage_item_amount,
            "lend_date_time" => &self.lend_date_time,
            "due_date" => &self.due_date,
            "manager_user" => &self.manager_user,
            "remark" => &self.remark
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum LendItemId {
    ObjectId(ObjectId),
    String(String),
}

impl From<LendItemId> for Bson {
    fn from(id: LendItemId) -> Self {
        match id {
            LendItemId::ObjectId(oid) => Bson::ObjectId(oid),
            LendItemId::String(s) => Bson::String(s),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum LendItemView {
    Item(Item),
    String(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Lend {
    #[serde(default)]
    _id: ObjectId,
    borrower_user: BorrowerUser,
    lend_item: LendItemId,
    lend_item_amount: u32,
    mortgage_item: ObjectId,
    mortgage_item_amount: u32,
    mortgage_money: u32,
    #[serde(deserialize_with = "deserialize_bson_datetime_from_rfc3339_string")]
    lend_date_time: DateTime,
    #[serde(deserialize_with = "deserialize_bson_datetime_from_rfc3339_string")]
    due_date: DateTime,
    manager_user: ObjectId,
    remark: String,
    #[serde(default = "DateTime::now")]
    created_at: DateTime,
    #[serde(default = "DateTime::now")]
    updated_at: DateTime,
}

impl Lend {
    pub async fn insert_one(&mut self, db: &Database) -> Result<LendView> {
        // Insert
        if let BorrowerUser::User(user) = &self.borrower_user {
            self.borrower_user = BorrowerUser::ObjectId(user.find_or_insert(&db).await?._id);
        }

        let coll = db.collection::<Self>(Coll::LEND);
        let result = coll.insert_one(self, None).await?;

        // Find
        let lend = LendView::find_by_id(&db, &result.inserted_id).await?;

        Ok(lend)
    }
}

impl Lend {
    pub async fn delete_one(db: &Database, _id: ObjectId) -> Result<DeleteResult> {
        let coll = db.collection::<Self>(Coll::LEND);
        let query = doc! { "_id": _id };
        let result = coll.delete_one(query, None).await?;

        Ok(result)
    }

    pub async fn update_one(db: &Database, update_data: LendUpdate) -> Result<UpdateResult> {
        let coll = db.collection::<Self>(Coll::LEND);
        let query = update_data.doc_query();
        let update = update_data.doc_update()?;
        let result = coll.update_one(query, update, None).await?;

        Ok(result)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LendView {
    _id: ObjectId,
    borrower_user: User,
    lend_item: LendItemView,
    lend_item_amount: u32,
    mortgage_item: Item,
    mortgage_item_amount: u32,
    mortgage_money: u32,
    lend_date_time: DateTime,
    due_date: DateTime,
    manager_user: User,
    return_date: Option<DateTime>,
    return_user: Option<User>,
    remark: String,
    created_at: DateTime,
    updated_at: DateTime,
}

impl LendView {
    fn get_collection(db: &Database) -> Collection<Self> {
        db.collection::<Self>(Coll::VIEW_LEND)
    }

    pub async fn find_by_id(db: &Database, id: &Bson) -> Result<Self> {
        let coll = Self::get_collection(db);
        let filter = doc! { "_id": id };
        let lend = coll
            .find_one(filter, None)
            .await?
            .ok_or(anyhow!(ErrMsg::FindDataFailed))?;

        Ok(lend)
    }

    pub async fn find(
        db: &Database,
        filter: impl Into<Option<Document>>,
        options: impl Into<Option<FindOptions>>,
    ) -> Result<Vec<Self>> {
        let coll = Self::get_collection(db);
        let lends = coll.find(filter, options).await?;
        let lends = lends.try_collect::<Vec<Self>>().await?;

        Ok(lends)
    }

    pub async fn find_by_filter(db: &Database, filter: LendItemFilter) -> Result<Vec<Self>> {
        let coll = Self::get_collection(db);
        let mut query = Document::new();

        if let Some(lend_item) = filter.lend_item.filter(|s| !s.is_empty()) {
            query.insert(
                "$or",
                vec![
                    doc! { "lend_item.name": { "$regex": &lend_item, "$options": "i" } },
                    doc! { "lend_item": { "$regex": &lend_item, "$options": "i" } },
                ],
            );
        }

        if let Some(mortgage_item) = filter.mortgage_item.filter(|s| !s.is_empty()) {
            query.insert(
                "mortgage_item.name",
                doc! { "$regex": mortgage_item, "$options": "i" },
            );
        }

        if let Some(borrower_user) = filter.borrower_user.filter(|s| !s.is_empty()) {
            query.insert(
                "borrower_user.name",
                doc! { "$regex": borrower_user, "$options": "i" },
            );
        }

        if let Some(manager_user) = filter.manager_user.filter(|s| !s.is_empty()) {
            query.insert(
                "manager_user.name",
                doc! { "$regex": manager_user, "$options": "i" },
            );
        }

        if let (Some(start), Some(end)) = (filter.lend_start_date, filter.lend_end_date) {
            query.insert("lend_date_time", doc! { "$gte": start, "$lt": end });
        }

        if let Some(remark) = filter.remark.filter(|s| !s.is_empty()) {
            query.insert("remark", doc! { "$regex": remark, "$options": "i" });
        }

        let cursor = coll.find(query, None).await?;
        let results = cursor.try_collect().await?;

        Ok(results)
    }

    pub async fn lend_history_find_by_year(db: &Database, year: i32) -> Result<Vec<Self>> {
        let coll = Self::get_collection(db);
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

        let filter = doc! {
            "$or": [
                {
                    "lend_date_time": {
                        "$gte": start_date_time,
                        "$lt": end_date_time
                    }
                },
                {
                    "return_date": {
                        "$gte": start_date_time,
                        "$lt": end_date_time
                    }
                }
            ]
        };

        let lends = coll.find(filter, None).await?;
        let lends = lends.try_collect::<Vec<Self>>().await?;

        Ok(lends)
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReturnLendItem {
    _id: ObjectId,
    manager_user: ObjectId,
    #[serde(deserialize_with = "deserialize_bson_datetime_from_rfc3339_string")]
    return_date: DateTime,
}

impl ReturnLendItem {
    pub async fn insert_one(&self, db: &Database) -> Result<UpdateResult> {
        let user = User::find(
            &db,
            doc! { "_id": &self.manager_user, "type": &super::user::UserType::Manager },
            None,
        )
        .await?;

        if user.is_empty() {
            return Err(anyhow!(ErrMsg::UserNotFound));
        }

        let query = doc! { "_id": &self._id };
        let update =
            doc! { "$set": { "return_date": self.return_date, "return_user": self.manager_user} };
        let coll = db.collection::<Self>(Coll::LEND);
        let result = coll.update_one(query, update, None).await?;

        Ok(result)
    }
}

#[derive(Debug, Deserialize)]
pub struct LendItemFilter {
    pub lend_item: Option<String>,
    pub mortgage_item: Option<String>,
    pub borrower_user: Option<String>,
    pub manager_user: Option<String>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub lend_start_date: Option<DateTime>,
    #[serde(deserialize_with = "option_deserialize_bson_datetime_from_rfc3339_string")]
    pub lend_end_date: Option<DateTime>,
    pub remark: Option<String>,
}
