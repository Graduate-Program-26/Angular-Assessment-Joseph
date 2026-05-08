# DeeJay - Modern Music Experience

DeeJay is a premium music streaming application built with Angular and Taiga UI, powered by a Node.js Backend-for-Frontend (BFF) that proxies the Deezer API. It features a sleek, responsive design, real-time playback management, and seamless synchronization across devices.

![DeeJay Preview](image.png)

## 🚀 Key Features

- **Modern Discovery**: Explore trending charts, popular artists, and top albums.
- **Rich Detail Views**: Comprehensive artist profiles and album tracklists.
- **Smart Search**: Find any track, artist, or album with ease.
- **Advanced Player**: Full-featured audio player with shuffle, repeat, and queue management.
- **Personalized Playlists**: Create and manage your own music collections.
- **Auth & Sync**: Secure authentication with Firebase and cloud-synced playlists.
- **Local History**: Keep track of your recently played music with IndexedDB.

## 🛠️ Technology Stack

- **Frontend**:
  - [Angular](https://angular.dev/) (Signal-based state management)
  - [Taiga UI](https://taiga-ui.dev/) (Premium component library)
  - [Dexie.js](https://dexie.org/) (IndexedDB wrapper for local storage)
  - [NgRx Signals](https://ngrx.io/guide/signals) (Reactive state management)
- **Backend (BFF)**:
  - [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
  - [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) (Authentication & Firestore)
  - [Deezer API](https://developers.deezer.com/api) (Music data source)
- **Tooling**:
  - [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/)

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the root directory:

| Variable | Description |
| :--- | :--- |
| `FIREBASE_API_KEY` | Your Firebase project's Web API Key. |
| `FIREBASE_SERVICE_ACCOUNT` | A stringified JSON object of your Firebase Service Account key. |
| `FIREBASE_DATABASE_URL` | Your Firebase Realtime Database or Firestore URL. |
| `PORT` | (Optional) The port the BFF server will run on (Default: 3000). |
| `NODE_ENV` | `development` or `production`. |

## 🏗️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DeeJay
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root and add your Firebase credentials.

4. **Start the Development Servers**:
   Run both the Angular frontend and the Node.js BFF:
   ```bash
   # Run frontend (Vite)
   npm run start
   
   # Run backend (BFF)
   npm run server
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

## 📜 Architecture Note

The application uses a **Backend-for-Frontend (BFF)** pattern. All client-side requests for music data or sensitive authentication actions are routed through the local Node.js server. This protects API keys, handles session cookies securely, and overcomes CORS limitations when interacting with third-party APIs like Deezer.

---
