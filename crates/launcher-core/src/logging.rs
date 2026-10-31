use std::path::Path;

use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::EnvFilter;

use crate::{Error, Result};

/// Used when the `RUST_LOG` environment variable is not set.
const DEFAULT_FILTER: &str = "info";

/// Keeps the background log writer alive. Dropping it flushes and stops file logging, so the
/// application state must hold on to it for the whole run.
#[must_use = "dropping the guard stops file logging"]
pub struct LogGuard {
    _worker: WorkerGuard,
}

/// Starts logging to a daily rolling file `launcher.log` inside `dir`.
///
/// Debug builds additionally log to stderr. The level comes from `RUST_LOG`, `info` by default.
pub fn init(dir: &Path) -> Result<LogGuard> {
    std::fs::create_dir_all(dir)?;

    let appender = tracing_appender::rolling::daily(dir, "launcher.log");
    let (writer, worker) = tracing_appender::non_blocking(appender);
    let filter =
        EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new(DEFAULT_FILTER));
    let builder = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_ansi(false);

    #[cfg(debug_assertions)]
    let result = {
        use tracing_subscriber::fmt::writer::MakeWriterExt;
        builder.with_writer(writer.and(std::io::stderr)).try_init()
    };
    #[cfg(not(debug_assertions))]
    let result = builder.with_writer(writer).try_init();

    result.map_err(|error| Error::Logging(error.to_string()))?;
    Ok(LogGuard { _worker: worker })
}
