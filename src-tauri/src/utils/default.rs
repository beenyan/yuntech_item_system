use mongodb::bson::DateTime;
use serde::{de, Deserialize, Deserializer};

pub fn option_deserialize_bson_datetime_from_rfc3339_string<'de, D>(
    deserializer: D,
) -> Result<Option<DateTime>, D::Error>
where
    D: Deserializer<'de>,
{
    let iso: Option<String> = Option::deserialize(deserializer)?;
    match iso {
        Some(iso) => Ok(Some(
            DateTime::parse_rfc3339_str(&iso).map_err(de::Error::custom)?,
        )),
        None => Ok(None),
    }
}
