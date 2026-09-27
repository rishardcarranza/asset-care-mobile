# AGENTS.md - Mobile Frontend (Asset Care App)

## 1. Scope & System Role
- **Application:** Asset Care (Personal Asset Maintenance Manager - Mobile Client).
- **Platform:** Cross-platform mobile app (iOS & Android) built with React Native and Expo.
- **Contract Consumer:** All API data structures and endpoint communications are strictly bound to the `openapi.json` contract provided by the Backend. Never invent endpoints or payload shapes.

## 2. Technology Stack & Tooling
- **Framework:** React Native with Expo (Managed workflow preferred).
- **Navigation:** Expo Router (file-based routing under `app/`).
- **Language:** TypeScript with strict type checking. Never use `any`. Interfaces must match or derive from `openapi.json`.
- **UI Component Library:** `react-native-paper` for all visual elements (Cards, Buttons, TextInput, Modals, Dialogs, DataTables, Appbar).
  - Avoid raw `StyleSheet` styling unless strictly necessary for custom layout arrangement or responsive grids.
- **Package Manager:** `pnpm` exclusively (`package.json`, `pnpm-lock.yaml`). Never use `npm` or `yarn`.
- **Local Persistence:** `expo-sqlite` for local database storage.
- **Internationalization (i18n):** `i18next` + `react-i18next` combined with `expo-localization`.

## 3. Offline-First Architecture (CRITICAL MANDATE)
1. **Local-First Reads & Writes:**
   - The user interface reads and writes **exclusively** against the local SQLite database.
   - The app must remain 100% functional without an active internet connection (adding assets, logging maintenance, reading history).
2. **Non-Blocking Background Sync:**
   - Network interactions (`fetch` or `axios`) must run in a decoupled background service or synchronization worker.
   - The UI must **NEVER** block or show blocking full-screen loaders waiting on HTTP network calls.
   - Maintain a local sync/mutation queue (e.g., pending changes with timestamps and sync status flags).
3. **Conflict Resolution:**
   - Implement clear conflict resolution strategies (such as Last-Write-Wins or server-reconciliation logs).
   - Document any conflict resolution logic thoroughly with intent-driven docstrings explaining *why* a particular strategy was chosen.

## 4. Internationalization (i18n) Strategy
- **Supported Languages:** English (`en`, default/launch language) and Spanish (`es`).
- **No Hardcoded Strings:** Zero hardcoded user-facing text strings in JSX or alert dialogs. Every label, button text, placeholder, error message, and modal title must use translation keys via `t('key')`.
- **Translation Dictionaries:** Keep translation files organized under `locales/en.json` and `locales/es.json`.
- **Formatting:** Use localized formatting for numbers, dates, and units (e.g., odometers, dates of service) based on the active locale.
- **Enum Mapping:** Map language-neutral backend values (e.g., `oil_change`, `vehicle`) to localized labels using translation keys (e.g., `t('maintenance_types.oil_change')`).

## 5. UI Patterns & Dynamic Fields
- Since assets have dynamic schemas (e.g., odometer vs. time-based maintenance), dynamic form renderers must dynamically display the relevant fields according to asset type.
- Present maintenance alerts clearly using `react-native-paper` badges, status indicators, and cards.

## 6. Component Structure & Separation of Concerns
- **Functional Components:** Use functional components with React Hooks.
- **Custom Hooks:** Encapsulate database queries, synchronization triggers, and business logic into dedicated hooks (e.g., `useAssets`, `useMaintenanceSync`, `useAssetDetails`).
- Keep presentation components clean, reactive, and decoupled from raw SQL queries.

## 7. AI & Development Guidelines
- **Package Management:** Always use `pnpm add <package>` or `pnpm add -D <package>`. Verify `package.json` before adding packages to avoid duplicate or incompatible dependencies.
- **Docstrings of Intent:** Document complex synchronization, offline caching, and data mapping logic explaining the *why*, not just the *what*.
- **File Size Constraint:** Strictly split and refactor any file exceeding 200 lines into smaller sub-modules or hooks.
- **Language:** Code identifiers, comments, types, and commit messages must be in technical English.
