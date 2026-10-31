# Coreverse Launcher

The official launcher of the Coreverse ecosystem.

## Stack

| Area      | Tools                                                                  |
| --------- | ---------------------------------------------------------------------- |
| Desktop   | Tauri 2, Rust (edition 2024), Cargo workspace                          |
| Frontend  | React, TypeScript, Vite, TailwindCSS, shadcn/ui, Radix UI              |
| Data      | SQLite (local storage), `@Coreverse-Game-Engine/db-client` (Supabase)  |
| Quality   | ESLint, Prettier, rustfmt, Clippy                                      |
| Packaging | pnpm                                                                   |

## Requirements

- Node.js 22 or newer and pnpm 10 or newer
- Rust (stable, installed through `rustup`; `rust-toolchain.toml` picks the components)
- The Tauri system prerequisites for your OS: <https://tauri.app/start/prerequisites/>

## Getting started

```sh
pnpm install
pnpm tauri dev
```

`pnpm dev` starts only the web UI in a browser (native features are disabled there).

## Scripts

| Script                                       | Purpose                                                     |
| -------------------------------------------- | ----------------------------------------------------------- |
| `pnpm tauri dev` / `pnpm tauri build`        | Run or package the desktop app                              |
| `pnpm lint` / `pnpm format`                  | ESLint / Prettier                                           |
| `pnpm typecheck`                             | TypeScript (compat) type check                              |
| `pnpm typecheck:native`                      | Same check with the native TypeScript 7 compiler            |
| `pnpm rust:fmt` / `pnpm rust:clippy`         | rustfmt / Clippy (`-D warnings`)                            |
| `pnpm rust:test`                             | Rust tests of the whole workspace                           |
| `pnpm verify`                                | Everything above, in CI order                               |

## Layout

```text
crates/launcher-core/   Tauri-independent Rust logic (testable with plain cargo test)
src-tauri/              Tauri shell: window, IPC commands, bundling
src/                    React UI (components, pages, i18n, theme)
```

## Data and logs

Settings live in a SQLite database (`launcher.db`, schema migrations in
`crates/launcher-core/migrations/`), logs in a daily rolling `launcher.log`. Both sit in
the OS-specific app data and app log folders of the identifier `com.coreverse.launcher`
(on Windows: `%APPDATA%` and `%LOCALAPPDATA%`). Set `RUST_LOG=debug` for more detail.

## License

GPL-3.0-only. See [LICENSE](LICENSE).
