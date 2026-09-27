# Asset Care - Mobile App

Asset Care is an **Offline-First** cross-platform mobile application designed to register, schedule, and track preventive and corrective maintenance for physical assets (vehicles, motorcycles, HVAC systems, and appliances) with dynamic schemas and metrics.

## 🚀 Tech Stack

- **Framework:** [Expo](https://expo.dev) SDK 52 (Expo Router, TypeScript strict)
- **UI Framework:** [React Native Paper](https://callstack.github.io/react-native-paper/) (MD3 Material Design)
- **Local Database:** [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (Offline-First architecture)
- **Package Manager:** `pnpm` exclusively
- **Internationalization (i18n):** `i18next` with react-i18next (English base default, Spanish fully translated)
- **Icons & Branding:** Vector icons (`@expo/vector-icons`), custom logo and palette (Deep Teal `#00636E`, Cyan Accent `#36D1DC`)

## 📱 Features

- **Offline-First Architecture:** 100% of read and write UI operations happen immediately on the local SQLite database.
- **Dynamic Asset Schemas:** Supports Vehicles, Motorcycles (displacement cc, transmission type, cooling), HVAC systems, and Appliances.
- **Local Health Engine:** Evaluates maintenance rules locally to categorize assets as `OK`, `DUE_SOON`, or `OVERDUE` with visual badges and progress bars.
- **Bi-directional Background Sync:** Pushes pending local changes and pulls updates from the FastAPI backend without blocking UI interactions.
- **Bilingual Support:** Full English and Spanish localization switchable on-the-fly from the Settings tab.

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Type Checking
```bash
pnpm typecheck
```

### 3. Start Development Server
```bash
pnpm start
```
From the interactive Metro terminal, press:
- `a` to open in Android emulator
- `i` to open in iOS simulator
- `w` to open in Web browser

## 🌐 API Synchronization
The sync service connects to the backend API via:
- Android Emulator: `http://10.0.2.2:8001/api/v1`
- iOS Simulator / Web / Host: `http://localhost:8001/api/v1`

Sync contracts strictly adhere to the OpenAPI specification defined by the Backend (`/api/v1/sync/pull` and `/api/v1/sync/push`).
