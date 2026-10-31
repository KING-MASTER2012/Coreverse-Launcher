//! Tauri commands: the thin IPC layer over `launcher-core`.

use launcher_core::{AppInfo, Error, Settings, SettingsPatch, settings};
use tauri::{AppHandle, Emitter, State};

use crate::{events, state::AppState};

/// Returns basic application information to the frontend.
#[tauri::command]
pub fn app_info() -> AppInfo {
    AppInfo::new(env!("CARGO_PKG_VERSION"))
}

/// Returns all settings.
#[tauri::command(async)]
#[allow(clippy::needless_pass_by_value)]
pub fn get_settings(state: State<'_, AppState>) -> Result<Settings, Error> {
    settings::load(&state.db)
        .inspect_err(|error| tracing::error!(%error, "failed to load settings"))
}

/// Applies a partial settings update, then notifies the frontend.
#[tauri::command(async)]
#[allow(clippy::needless_pass_by_value)]
pub fn update_settings(
    app: AppHandle,
    state: State<'_, AppState>,
    patch: SettingsPatch,
) -> Result<Settings, Error> {
    let updated = settings::update(&state.db, patch)
        .inspect_err(|error| tracing::error!(%error, "failed to update settings"))?;
    if let Err(error) = app.emit(events::SETTINGS_CHANGED, updated) {
        tracing::warn!(%error, "failed to emit the settings-changed event");
    }
    Ok(updated)
}
