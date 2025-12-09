
# gOwOrk 🛡️☕

**gOwOrk** is a Gamified Attendance and Employee Engagement System designed for shift-based workplaces. It turns the mundane task of "Clocking In" into an RPG adventure, featuring a 3D voxel avatar, economy system, skill trees, and arcade minigames.

## 🚀 Tech Stack

*   **Framework**: React 18 (TypeScript)
*   **Bundler**: Vite
*   **Styling**: Tailwind CSS
*   **3D Engine**: Three.js
*   **Icons**: Lucide React
*   **Effects**: Canvas Confetti
*   **Backend**: Node.js (Express)
*   **Database**: SQLite (better-sqlite3)

## 🛠️ Installation & Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Install Dependencies
Open your terminal in the project folder and run:

```bash
npm install
```

### 3. Run the App
Start the development server (runs both backend and frontend):

```bash
npm run dev
```
Open the link provided (usually `http://localhost:5173`) in your browser.

### 4. Build for Production
To create a production-ready build:

```bash
npm run build
npm start
```

## ☁️ Deployment (Render)

When deploying to Render.com, ensure you use the following settings:

*   **Build Command**: `npm install && npm run build`
*   **Start Command**: `npm start`

*Note: Data persistence on the free tier of Render is ephemeral. The SQLite database file will reset on every redeploy unless you attach a persistent disk and set `DB_PATH`.*

## 🎮 Gameplay Guide

### ⏰ Attendance Mechanics
*   **Clock In**: The core mechanic.
    *   **07:45 - 07:59**: Early Bird Bonus (+20 XP).
    *   **08:00 (Exact)**: Critical Hit (+50 XP + Screen Shake).
    *   **08:16+**: Late Penalty (-10 HP).
*   **Overdrive Mode**: Toggles automatically after 5:00 PM (or manually via the bottom right icon). Doubles XP gain but increases visual intensity.

### 💼 Working & Economy
*   **Action Pad**: Once clocked in, use the pad to:
    *   **Serve**: Spend HP to earn Gold/XP.
    *   **Break**: Restore HP (has a cooldown).
    *   **Play**: Launch the "Coffee Rush" arcade minigame (2-hour cooldown).
*   **Quests**: Check the Quest Board for daily tasks. Some are time-sensitive!
*   **Boss Event**: A community raid boss ("The Sunday Rush"). All actions deal damage to it. Defeating it grants global gold rewards.

### 🛍️ Shop & Inventory
*   **Gear**: Buy hats, glasses, and clothes to customize your 3D avatar.
*   **Snacks**: Buy Coffee or Donuts to instantly restore HP.
*   **Mystery Box**: A daily gacha mechanic. Costs 100g for a chance at XP, huge Gold, or a full heal.

### 🌟 Progression
*   **Level Up**: Earn XP to increase your Level.
*   **Skill Tree**: Every level grants **1 Skill Point (SP)**. Use SP in the "Skills" tab to unlock perks like "Shop Discount" or "Gold Boost".
*   **Streak**: Log in consecutively to build your fire streak and earn multipliers.

## 🤝 Social
*   **Leaderboard**: Compete with coworkers for the highest XP.
*   **Kudos**: Send a "High Five" to teammates on the leaderboard to give them a small XP boost.

## ⌨️ Developer Notes
*   **Persistence**: Uses SQLite for user data and logs.
*   **Mock Data**: The backend logic (`server.js`) simulates server calls with artificial delays.

---
*Built for the Modern Worker.*
