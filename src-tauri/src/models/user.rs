use crate::{configs::db::Coll, doc_update, utils::my_result::ErrMsg};
use anyhow::{anyhow, Result};
use futures::TryStreamExt;
use mongodb::{
    bson::{doc, oid::ObjectId, Bson, DateTime, Document},
    options::FindOptions,
    results::{InsertOneResult, UpdateResult},
    Database,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, Copy)]
pub enum UserType {
    Borrower,
    Manager,
}

impl Into<Bson> for UserType {
    fn into(self) -> Bson {
        Bson::String(format!("{:?}", self))
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserUpdate {
    pub(crate) _id: ObjectId,
    pub(crate) r#type: UserType,
    pub(crate) id: Option<String>,
    pub(crate) name: Option<String>,
    pub(crate) phone: Option<String>,
    pub(crate) is_lock: Option<bool>,
}

impl UserUpdate {
    async fn is_id_repeat(&self, db: &Database) -> Result<bool> {
        let coll = db.collection::<Self>(Coll::USER);
        let filter = doc! { "id": &self.id, "type": &self.r#type, "_id": { "$ne": &self._id } };
        let result = coll.find_one(filter, None).await?;

        Ok(result.is_some())
    }

    fn doc_query(&self) -> Document {
        doc! { "_id": &self._id }
    }

    fn doc_update(&self) -> Result<Document> {
        doc_update! {
            "id" => &self.id,
            "name" => &self.name,
            "phone" => &self.phone,
            "is_lock" => self.is_lock
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(default)]
    pub _id: ObjectId,
    pub id: String,
    r#type: UserType,
    pub name: String,
    phone: Option<String>,
    #[serde(default)]
    is_lock: bool,
    #[serde(default = "DateTime::now")]
    created_at: DateTime,
    #[serde(default = "DateTime::now")]
    updated_at: DateTime,
}

/**
 *  Self
 */
impl User {
    pub async fn is_exist(&self, db: &Database) -> Result<bool> {
        let user = User::find_one(&db, &self.id, &self.r#type).await?;

        Ok(user.is_some())
    }

    pub async fn insert_one(&self, db: &Database) -> Result<InsertOneResult> {
        let coll = db.collection::<Self>(Coll::USER);
        let result = coll.insert_one(self, None).await?;

        Ok(result)
    }

    pub async fn insert_one_self(&self, db: &Database) -> Result<Self> {
        // Insert
        let coll = db.collection::<Self>(Coll::USER);
        let result = coll.insert_one(self, None).await?;

        // Find
        let filter = doc! { "_id": result.inserted_id };
        let user = coll
            .find_one(filter, None)
            .await?
            .ok_or(anyhow!(ErrMsg::FindDataFailed))?;

        Ok(user)
    }

    pub async fn find_or_insert(&self, db: &Database) -> Result<Self> {
        let user = User::find_one(&db, &self.id, &self.r#type).await?;

        let user = match user {
            Some(user) => user,
            None => self.insert_one_self(&db).await?,
        };

        Ok(user)
    }
}

impl User {
    pub async fn find_one(db: &Database, id: &str, r#type: &UserType) -> Result<Option<User>> {
        let coll = db.collection::<Self>(Coll::USER);
        let filter = doc! { "id": id, "type": r#type };
        let user = coll.find_one(filter, None).await?;

        Ok(user)
    }

    pub async fn update_one(db: &Database, update_data: UserUpdate) -> Result<UpdateResult> {
        if update_data.is_id_repeat(&db).await? {
            return Err(ErrMsg::DuplicateData.into());
        }

        let coll = db.collection::<Self>(Coll::USER);
        let query = update_data.doc_query();
        let update = update_data.doc_update()?;
        let result = coll.update_one(query, update, None).await?;

        Ok(result)
    }

    pub async fn find(
        db: &Database,
        filter: impl Into<Option<Document>>,
        options: impl Into<Option<FindOptions>>,
    ) -> Result<Vec<User>> {
        let coll = db.collection::<Self>(Coll::USER);
        let users = coll.find(filter, options).await?;
        let users = users.try_collect::<Vec<Self>>().await?;

        Ok(users)
    }
}
