use rusqlite::{Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

use crate::{Database, Result};

const KEY_THEME: &str = "theme";
const KEY_LANGUAGE: &str = "language";

/// Colour theme of the launcher.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Light,
    Dark,
    #[default]
    System,
}

impl Theme {
    fn db_value(self) -> &'static str {
        match self {
            Self::Light => "light",
            Self::Dark => "dark",
            Self::System => "system",
        }
    }

    fn parse(value: &str) -> Option<Self> {
        match value {
            "light" => Some(Self::Light),
            "dark" => Some(Self::Dark),
            "system" => Some(Self::System),
            _ => None,
        }
    }
}

/// Interface language of the launcher.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Language {
    En,
    Tr,
}

impl Language {
    fn db_value(self) -> &'static str {
        match self {
            Self::En => "en",
            Self::Tr => "tr",
        }
    }

    fn parse(value: &str) -> Option<Self> {
        match value {
            "en" => Some(Self::En),
            "tr" => Some(Self::Tr),
            _ => None,
        }
    }
}

/// All user settings.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub theme: Theme,
    /// `None` until the user picks a language; the frontend then follows the system language.
    pub language: Option<Language>,
}

/// A partial update: only the fields that are `Some` are written.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsPatch {
    pub theme: Option<Theme>,
    pub language: Option<Language>,
}

/// Reads all settings. Missing or invalid stored values fall back to the defaults.
pub fn load(db: &Database) -> Result<Settings> {
    db.with_conn(|conn| {
        Ok(Settings {
            theme: read_parsed(conn, KEY_THEME, Theme::parse)?.unwrap_or_default(),
            language: read_parsed(conn, KEY_LANGUAGE, Language::parse)?,
        })
    })
}

/// Applies `patch` atomically and returns the resulting settings.
pub fn update(db: &Database, patch: SettingsPatch) -> Result<Settings> {
    db.with_conn(|conn| {
        let tx = conn.transaction()?;
        if let Some(theme) = patch.theme {
            write(&tx, KEY_THEME, theme.db_value())?;
        }
        if let Some(language) = patch.language {
            write(&tx, KEY_LANGUAGE, language.db_value())?;
        }
        tx.commit()?;
        Ok(())
    })?;
    load(db)
}

fn read_parsed<T>(
    conn: &Connection,
    key: &'static str,
    parse: fn(&str) -> Option<T>,
) -> Result<Option<T>> {
    let raw: Option<String> = conn
        .query_row("SELECT value FROM settings WHERE key = ?1", [key], |row| {
            row.get(0)
        })
        .optional()?;
    Ok(raw.and_then(|raw| {
        let parsed = parse(&raw);
        if parsed.is_none() {
            tracing::warn!(key, value = %raw, "ignoring invalid stored setting");
        }
        parsed
    }))
}

fn write(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET
             value = excluded.value,
             updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
        [key, value],
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fresh_database_returns_defaults() {
        let db = Database::open_in_memory().unwrap();
        let settings = load(&db).unwrap();
        assert_eq!(settings.theme, Theme::System);
        assert_eq!(settings.language, None);
    }

    #[test]
    fn update_persists_and_returns_new_settings() {
        let db = Database::open_in_memory().unwrap();
        let updated = update(
            &db,
            SettingsPatch {
                theme: Some(Theme::Dark),
                language: Some(Language::Tr),
            },
        )
        .unwrap();
        assert_eq!(updated.theme, Theme::Dark);
        assert_eq!(updated.language, Some(Language::Tr));
        assert_eq!(load(&db).unwrap(), updated);
    }

    #[test]
    fn partial_update_keeps_other_fields() {
        let db = Database::open_in_memory().unwrap();
        update(
            &db,
            SettingsPatch {
                theme: Some(Theme::Light),
                language: Some(Language::En),
            },
        )
        .unwrap();
        let updated = update(
            &db,
            SettingsPatch {
                theme: Some(Theme::Dark),
                language: None,
            },
        )
        .unwrap();
        assert_eq!(updated.theme, Theme::Dark);
        assert_eq!(updated.language, Some(Language::En));
    }

    #[test]
    fn invalid_stored_values_fall_back_to_defaults() {
        let db = Database::open_in_memory().unwrap();
        db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO settings (key, value) VALUES ('theme', 'purple'), ('language', 'xx')",
                [],
            )?;
            Ok(())
        })
        .unwrap();
        let settings = load(&db).unwrap();
        assert_eq!(settings.theme, Theme::System);
        assert_eq!(settings.language, None);
    }

    #[test]
    fn patch_deserializes_from_partial_json() {
        let patch: SettingsPatch = serde_json::from_str(r#"{"theme":"dark"}"#).unwrap();
        assert_eq!(patch.theme, Some(Theme::Dark));
        assert_eq!(patch.language, None);
    }
}
