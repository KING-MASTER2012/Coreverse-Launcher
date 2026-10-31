use std::{
    path::Path,
    sync::{Arc, Mutex, PoisonError},
    time::Duration,
};

use rusqlite::Connection;

use crate::{Result, migrations};

/// Cheap-to-clone handle to the launcher's SQLite database.
///
/// SQLite connections are not `Sync`, so the single connection sits behind a mutex. The
/// launcher's queries are tiny, so one connection is plenty; if that ever changes, this is
/// the one place to introduce a pool.
#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    /// Opens (and creates, if needed) the database file and migrates it to the latest schema.
    pub fn open(path: &Path) -> Result<Self> {
        let conn = Connection::open(path)?;
        conn.pragma_update(None, "journal_mode", "WAL")?;
        Self::init(conn)
    }

    /// Opens a throw-away in-memory database. Used by tests.
    pub fn open_in_memory() -> Result<Self> {
        Self::init(Connection::open_in_memory()?)
    }

    fn init(mut conn: Connection) -> Result<Self> {
        conn.busy_timeout(Duration::from_secs(5))?;
        conn.pragma_update(None, "foreign_keys", true)?;
        migrations::run(&mut conn)?;
        Ok(Self {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    /// Runs `f` with exclusive access to the connection.
    pub fn with_conn<T>(&self, f: impl FnOnce(&mut Connection) -> Result<T>) -> Result<T> {
        // A panic in another query must not brick the launcher, so poisoning is ignored.
        let mut guard = self.conn.lock().unwrap_or_else(PoisonError::into_inner);
        f(&mut guard)
    }
}
