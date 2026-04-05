# 🧠 WordDash (AI-Trivia)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-purple?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.11.0-orange?logo=firebase)](https://firebase.google.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_AI-0.24.1-teal)]()

**WordDash** is a lightning-fast, real-time multiplayer trivia game built with modern React, synchronized seamlessly via Firebase Realtime Database, and powered by intelligent question generation using the Google Gemini AI.

## ✨ Features

- **🤖 AI-Generated Trivia:** Dynamic, difficulty-scaling (Easy, Medium, Hard) trivia generation powered by Gemini 2.5 Flash, ensuring questions are never repeated and always engaging.
- **⚡ Real-Time Multiplayer Sync:** Flawless lobby management, game-state syncing, and point tracking leveraging Firebase Realtime Database.
- **💬 Encrypted Live Chat:** In-game floating panel chat for players to communicate, obfuscated to protect casual spying. Features smart auto-open triggers and toast previews.
- **🎨 Premium UI & Micro-Interactions:** Modern chunky io-game aesthetic utilizing Mantine UI. Enjoy breathing avatars, SweetAlert2 animated modal dialogues, and responsive error shakes.
- **🎵 Zero-Footprint Audio Engine:** A custom-built programmatic Web Audio API synthesizer that provides sound effects (pops, buzzes) and an 8-bit generative background chiptune track—all without downloading bulky `.mp3` files.
- **🚀 Ultra Performant:** Employs rigorous React `<Suspense>` lazy-loading and dynamic imports to ensure clients only download Javascript vital for their current screen.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Firebase Project with Realtime Database enabled
- Google Generative AI (Gemini) API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/worddash.git
   cd worddash
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📂 Project Structure

```text
├── src/
│   ├── components/       # Lazy-loaded UI Screens (Lobby, GameLoop, Leaderboard)
│   ├── services/         # API integrators (e.g., gemini.ts)
│   ├── utils/            # Utilities (audio.ts synth engine, alerts.ts, crypto.ts)
│   ├── App.tsx           # Primary routing and Suspense bounds
│   ├── index.css         # Core global styles & keyframe micro-animations
│   └── firebase.ts       # Firebase initialization
```

## 🏷️ Version History

*   **v1.0.0** - Initial stable deployment. Complete game loop, live chat functionality, AI difficulty scaling, and comprehensive UI/UX micro-animations (SweetAlerts, CSS shakes, BGM integration).

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
