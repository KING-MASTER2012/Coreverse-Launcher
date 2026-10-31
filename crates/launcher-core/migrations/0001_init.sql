-- Key/value settings of the launcher. Typed access lives in `settings.rs`.
CREATE TABLE settings (
                          key        TEXT PRIMARY KEY NOT NULL,
                          value      TEXT NOT NULL,
                          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
) STRICT;
