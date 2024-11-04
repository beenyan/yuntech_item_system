use crate::{configs::db::Coll, doc_update, utils::my_result::ErrMsg};
use anyhow::Result;
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId, Bson, DateTime, Document},
    options::FindOptions,
    results::{InsertOneResult, UpdateResult},
    Database,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum ItemType {
    Borrower,
    Mortgage,
}

impl Into<Bson> for ItemType {
    fn into(self) -> Bson {
        Bson::String(format!("{:?}", self))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ItemUpdate {
    pub(crate) _id: ObjectId,
    pub(crate) name: Option<String>,
    pub(crate) r#type: Option<ItemType>,
    pub(crate) is_lock: Option<bool>,
}

impl ItemUpdate {
    async fn is_name_repeat(&self, db: &Database) -> Result<bool> {
        let coll = db.collection::<Self>(Coll::ITEM);
        let filter = doc! { "name": &self.name, "type": &self.r#type, "_id": { "$ne": &self._id } };
        let result = coll.find_one(filter, None).await?;

        Ok(result.is_some())
    }

    fn doc_query(&self) -> Document {
        doc! { "_id": &self._id }
    }

    fn doc_update(&self) -> Result<Document> {
        doc_update! {
            "name" => &self.name,
            "type" => &self.r#type,
            "is_lock" => self.is_lock
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    #[serde(default)]
    _id: ObjectId,
    pub name: String,
    pub r#type: ItemType,
    is_lock: bool,
    #[serde(default = "DateTime::now")]
    created_at: DateTime,
    #[serde(default = "DateTime::now")]
    updated_at: DateTime,
}

/**
 *  Self
 */
impl Item {
    pub async fn is_exist(&self, db: &Database) -> Result<bool> {
        let coll = db.collection::<Self>(Coll::ITEM);
        let filter = doc! { "name": &self.name, "type": &self.r#type };
        let item = coll.find_one(filter, None).await?;

        Ok(item.is_some())
    }

    pub async fn insert_one(&self, db: &Database) -> Result<InsertOneResult> {
        let coll = db.collection::<Self>(Coll::ITEM);
        let result = coll.insert_one(self, None).await?;

        Ok(result)
    }
}

impl Item {
    pub async fn update_one(db: &Database, update_data: ItemUpdate) -> Result<UpdateResult> {
        if update_data.is_name_repeat(&db).await? {
            return Err(ErrMsg::DuplicateData.into());
        }

        let coll = db.collection::<Self>(Coll::ITEM);
        let query = update_data.doc_query();
        let update = update_data.doc_update()?;
        let result = coll.update_one(query, update, None).await?;

        Ok(result)
    }

    pub async fn find(
        db: &Database,
        filter: impl Into<Option<Document>>,
        options: impl Into<Option<FindOptions>>,
    ) -> Result<Vec<Item>> {
        let coll = db.collection::<Self>(Coll::ITEM);
        let items = coll.find(filter, options).await?;
        let items = items.try_collect::<Vec<Self>>().await?;

        Ok(items)
    }
}
