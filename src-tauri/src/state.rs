use launcher_core::{Database, LogGuard};

/// Shared application state, registered with Tauri's `manage`.
pub struct AppState {
    pub db: Database,
    /// Kept only so file logging stays alive for as long as the app runs.
    _log_guard: LogGuard,
}

impl AppState {
    pub fn new(db: Database, log_guard: LogGuard) -> Self {
        Self {
            db,
            _log_guard: log_guard,
        }
    }
}
