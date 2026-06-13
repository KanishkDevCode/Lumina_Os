<div align="center">
  
# 🌌 LUMINA OS

**An Agentic Gaming Platform & Next-Generation OS Interface**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/)

*Lumina OS is a AAA-grade, high-fidelity web application built to simulate a next-generation gaming hub and intelligent assistant interface. Designed with heavy inspiration from modern video game UI/UX, Lumina OS features interactive 3D elements, dynamic contextual theming, and a highly immersive user experience.*

---
</div>

> ⚠️ **WORK IN PROGRESS:** This project is currently under active development. Features, animations, and integrations are continuously evolving as the architecture is built out.

## ✨ Core Features

### 🎬 Cinematic Omni-Theme Boot Sequence
- A highly polished, physics-based loading sequence that dynamically cycles through the primary colors of the featured games.
- Features floating Norse runes, scanlines, SVG hex grids, and high-performance cubic-bezier animations.

### 🎨 Dynamic Thematic Context System
The entire OS automatically recolors and re-themes based on the active game, applying unique visual effects, colors, and animations seamlessly:
- **God of War:** Cyan accents, frost particles, falling Norse runes.
- **Assassin's Creed:** White accents, digital Animus scan lines, falling memory fragments.
- **Hogwarts Legacy:** Emerald glows, twinkling stars, and floating magic orbs.
- **Red Dead Redemption:** Crimson red accents, tumbling poker playing cards.
- **Hitman:** Silver/grey accents, security laser sweeps, and radar grids.

### 🤖 Interactive AI Assistant
- Contextual AI chat interface that dynamically shifts persona based on the active game (e.g., Mimir for GOW, Diana for Hitman).
- Intelligent data persistence and timestamp tracking.
- Fluid message streams simulating live processing and cinematic "Uplink" splash animations upon game transitions.

### 🎮 Game Data Hub & Persistence
- Browse detailed lore, weapon arsenals, and publishing roadmaps for integrated games.
- Highly optimized state management using `Zustand`, ensuring instantaneous load times when navigating between OS applications.
- Horizontal, cinematic asset sliders powered by smooth scroll animations.

---

## 🛠️ Tech Stack Architecture

| Category | Technologies |
|---|---|
| **Frontend Core** | React 19, Vite |
| **3D & Graphics** | Three.js, React Three Fiber (R3F), Drei, Post-Processing |
| **State Management** | Zustand (with Session Storage persistence) |
| **Database & Backend** | Firebase / Firestore |
| **Styling & Animation** | Vanilla CSS, Framer Motion, TailwindCSS, CSS Variables |

---

## 🚀 Quick Start (Local Setup)

To run Lumina OS on your local machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- Git installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KanishkDevCode/Lumina_Os.git
   cd Lumina_Os/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Launch the platform:**
   Open your browser and navigate to `http://localhost:5173`.

---

## 📝 Development Roadmap

- [ ] Complete UI architectures for the `COMMUNITY`, `DOCUMENTATION`, `SETTINGS`, and `CREATE` modules.
- [ ] Connect the internal Assistant UI directly to live LLM APIs (OpenAI/Gemini).
- [ ] Integrate a "Launch/Play Now" action CTA button in the main dashboard.
- [ ] Implement Draco compression for faster loading of heavy 3D `.glb` models.
- [ ] Add Vercel deployment configurations for a live public showcase.

---

<div align="center">
  <i>Crafted with passion by Kanishk | Lumina Studios.</i>
</div>
