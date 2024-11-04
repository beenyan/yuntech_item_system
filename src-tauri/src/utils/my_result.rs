use std::fmt::Display;

use anyhow::Result;
use log::warn;
use serde::{ser::SerializeMap, Serialize};

#[allow(dead_code)]
pub enum ErrMsg {
    DateFormatError,
    DataFormatError,
    DBConnectFailed,
    DBConnectYet,
    ObjectIdMissin,
    DuplicateData,
    FindDataFailed,
    UpdateNoData,
}

impl Display for ErrMsg {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let message: &'static str = match self {
            ErrMsg::DateFormatError => "Date Format Error",
            ErrMsg::DataFormatError => "Data Format Error",
            ErrMsg::DBConnectFailed => "DataBase Connection Failed",
            ErrMsg::DBConnectYet => "DataBase Connection Yet",
            ErrMsg::ObjectIdMissin => "ObjectId Missin",
            ErrMsg::DuplicateData => "Duplicate Data",
            ErrMsg::FindDataFailed => "Find Data Failed",
            ErrMsg::UpdateNoData => "Update No Data",
        };

        write!(f, "{}", message)
    }
}

impl Into<anyhow::Error> for ErrMsg {
    #[inline]
    fn into(self) -> anyhow::Error {
        anyhow::Error::msg(self.to_string())
    }
}

#[derive(Debug, Serialize)]
pub struct Success<T: Serialize> {
    data: T,
}

impl<T: Serialize> Success<T> {
    fn new(data: T) -> Self {
        Self { data }
    }
}

#[derive(Debug)]
pub enum MyResult<T: Serialize> {
    Success(Success<T>),
    Error(anyhow::Error),
}

impl<T: Serialize> Serialize for MyResult<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            MyResult::Success(success) => {
                let mut seq = serializer.serialize_map(Some(2))?;
                seq.serialize_entry("success", &true)?;
                seq.serialize_entry("data", &success.data)?;
                seq.end()
            }
            MyResult::Error(error) => {
                let mut seq = serializer.serialize_map(Some(2))?;
                seq.serialize_entry("success", &false)?;
                let error_message = error_to_string(error);

                warn!("msg: {:#?}", error_message);
                seq.serialize_entry("error", &error_message)?;
                seq.end()
            }
        }
    }
}

impl<T: Serialize> Into<MyResult<T>> for anyhow::Result<T> {
    fn into(self) -> MyResult<T> {
        match self {
            Ok(data) => MyResult::Success(Success::new(data)),
            Err(error) => MyResult::Error(error),
        }
    }
}

fn error_to_string(error: &anyhow::Error) -> String {
    if let Some(err) = error.downcast_ref::<mongodb::error::Error>() {
        return match *err.kind.clone() {
            mongodb::error::ErrorKind::ServerSelection { .. } => "資料庫無法連線".to_string(),
            _ => err.to_string(),
        };
    }

    error.to_string()
}
