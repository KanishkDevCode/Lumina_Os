# 🌌 Lumina OS 

> ⚠️ **WORK IN PROGRESS:** This project is currently under active development. Features, animations, and database integrations are subject to change as the architecture is built out.

Lumina OS is a AAA-grade, high-fidelity web application built to simulate a next-generation gaming hub and intelligent assistant interface. Designed with heavy inspiration from modern video game UI/UX, Lumina OS features interactive 3D elements, dynamic contextual theming, and an immersive user experience.

---

## ✨ Features

- **🎮 3D Parallax Dashboard**
  - Features fully interactive 3D WebGL scenes using React Three Fiber.
  - Custom lighting, environmental reflections, and Arcball rotation controls.
  - Zero-load cinematic transitions when navigating between game contexts.

- **🎨 Dynamic Thematic Context System**
  - The entire OS automatically recolors and re-themes based on the active game.
  - **God of War:** Cyan accents, frost particles, falling Norse runes.
  - **Assassin's Creed:** White accents, digital Animus scan lines, falling memory fragments.
  - **Hogwarts Legacy:** Emerald glows, twinkling stars, and floating magic orbs.
  - **Red Dead Redemption:** Crimson red accents, tumbling poker playing cards.
  - **Hitman:** Silver/grey accents, security laser sweeps, and radar grids.

- **🤖 Interactive Assistant AI**
  - Features a contextual AI chat interface that shifts persona based on the active game (e.g., Mimir for GOW, Diana for Hitman).
  - Cinematic, full-screen "Uplink" splash animations trigger on game swap.
  - Streams text naturally to simulate live processing.

- **⚡ Fluid Navigation & Animations**
  - Features a custom cubic-bezier sliding navigation pill that dynamically wraps to exact text widths.
  - Ambient glowing layers and subtle, non-intrusive micro-animations across the entire UI.

---

## 🛠️ Tech Stack

- **Frontend Core:** React, Vite
- **3D Graphics:** Three.js, React Three Fiber (R3F), Drei
- **State Management:** Zustand (with Session Storage persistence)
- **Database / Backend:** Firebase Firestore (for dynamic game data)
- **Styling:** Custom CSS with dynamic CSS variables

---

## 🚀 Running Locally

To run this project on your local machine, follow these steps:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/lumina-project.git
   cd lumina-project/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local host address provided in the terminal (usually `http://localhost:5173`).

---

## 📝 Roadmap (Upcoming Features)
- [ ] Connect Assistant to live LLM APIs (OpenAI/Anthropic).
- [ ] Implement Draco compression for faster 3D `.glb` model loading.
- [ ] Finish UI structures for `GAMES`, `DOCUMENTATION`, `COMMUNITY`, and `SETTINGS` tabs.
- [ ] Add authentic logo image integration into the cinematic splash screens.

---
*Built by Lumina Studios.*
