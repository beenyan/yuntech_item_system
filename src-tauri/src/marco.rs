#[macro_export]
macro_rules! doc_update {
    ( $( $key:expr => $value:expr ),* ) => {{
        let mut update = doc! {};
        $(
            if let Some(value) = $value {
                update.insert($key, value);
            }
        )*

        match update.is_empty() {
            true => Err(anyhow::Error::msg(crate::utils::my_result::ErrMsg::UpdateNoData.to_string())),
            false => {
                update.insert("updated_at", DateTime::now());
                Ok(doc! { "$set": update })
            },
        }
    }};
}
