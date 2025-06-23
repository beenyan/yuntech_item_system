// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod configs;
mod marco;
mod models;
mod utils;

use anyhow::Result;
use commands::*;
use log::info;
use models::login::AuthState;
use std::sync::Mutex;

#[tokio::main]
async fn main() -> Result<()> {
    dotenvy::dotenv().unwrap_or_default();
    utils::logger::init()?;
    info!("System is starting...");

    tauri::Builder::default()
        .manage(Mutex::new(AuthState::default()))
        .invoke_handler(tauri::generate_handler![
            get_export_history_years,
            auth::is_login,
            auth::login,
            auth::logout,
            user::user_insert_one,
            user::user_find,
            user::user_update_one,
            item::item_insert_one,
            item::item_find,
            item::item_update_one,
            lend::lend_insert_one,
            lend::lend_find,
            lend::lend_update_one,
            lend::return_lend_item,
            lend::lend_delete_one,
            lend::lend_history_find_by_year,
            maintenance::maintenance_find,
            maintenance::maintenance_insert_one,
            maintenance::maintenance_update_by_id,
            maintenance::maintenance_delete_by_id,
            maintenance::maintenance_history_find_by_year
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
