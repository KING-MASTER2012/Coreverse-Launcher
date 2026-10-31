use serde::ser::{Serialize, SerializeStruct, Serializer};

/// Result type used across the core crate.
pub type Result<T> = std::result::Result<T, Error>;

/// Every error the core can produce.
///
/// The type implements [`Serialize`] so it can be returned straight from a Tauri command;
/// the frontend receives `{ code, message }`.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),

    #[error("i/o error: {0}")]
    Io(#[from] std::io::Error),

    #[error(
        "the database was created by a newer launcher (schema version {found}, this launcher supports up to {supported})"
    )]
    DatabaseTooNew { found: u32, supported: u32 },

    #[error("logging could not be initialised: {0}")]
    Logging(String),
}

impl Error {
    /// Stable machine-readable code for the frontend.
    #[must_use]
    pub fn code(&self) -> &'static str {
        match self {
            Self::Database(_) => "database",
            Self::Io(_) => "io",
            Self::DatabaseTooNew { .. } => "database_too_new",
            Self::Logging(_) => "logging",
        }
    }
}

impl Serialize for Error {
    fn serialize<S: Serializer>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error> {
        let mut state = serializer.serialize_struct("Error", 2)?;
        state.serialize_field("code", self.code())?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serializes_code_and_message() {
        let error = Error::DatabaseTooNew {
            found: 9,
            supported: 1,
        };
        let value = serde_json::to_value(&error).unwrap();
        assert_eq!(value["code"], "database_too_new");
        assert!(
            value["message"]
                .as_str()
                .unwrap()
                .contains("schema version 9")
        );
    }
}
