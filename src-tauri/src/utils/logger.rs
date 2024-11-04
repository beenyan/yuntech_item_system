use chrono::Local;
use std::fs;
use tauri::api::path::document_dir;

fn stream_file() -> String {
    let path = document_dir()
        .expect("Not Found Document Directory Path")
        .join("Health Item")
        .join("logs");
    fs::create_dir_all(&path).expect("could not create log directory");
    format!("{}/{}.log", path.display(), Local::now().format("%Y-%m-%d"))
}

pub fn init() -> Result<(), fern::InitError> {
    let level = if cfg!(debug_assertions) {
        log::LevelFilter::Trace
    } else {
        log::LevelFilter::Info
    };

    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "{}[{}][{}] {}",
                Local::now().format("[%Y-%m-%d][%H:%M:%S]"),
                record.target(),
                record.level(),
                message
            ))
        })
        .level(level)
        .filter(|metadata| metadata.target() != "tao::platform_impl::platform::event_loop::runner")
        .chain(std::io::stdout())
        .chain(fern::log_file(stream_file())?)
        .apply()?;

    Ok(())
}
