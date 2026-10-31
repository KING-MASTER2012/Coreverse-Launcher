mod commands;
mod events;
mod state;

use launcher_core::{Database, logging};
use tauri::Manager;

use crate::state::AppState;

/// Starts the Tauri application.
///
/// # Panics
///
/// Panics if the Tauri runtime cannot start.
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let log_guard = logging::init(&app.path().app_log_dir()?)?;

            let data_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let db = Database::open(&data_dir.join("launcher.db"))?;

            tracing::info!(
                version = env!("CARGO_PKG_VERSION"),
                "Coreverse Launcher started"
            );
            app.manage(AppState::new(db, log_guard));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app_info,
            commands::get_settings,
            commands::update_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Coreverse Launcher");
}
