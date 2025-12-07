
# Chapter 4: Architectural Design

## 4.1 High Level Components and Interfaces

The software architecture of the **gOwOrk** system is designed using a modern, component-based approach to ensure scalability and maintainability. This section identifies the high-level software modules, libraries, and frameworks that constitute the system's core structure.

### 4.1.1 Components

The system utilizes a Component-Based Architecture built on the React library to ensure maintainability and modularity. This approach separates the core business functions into smaller, reusable components while maintaining a clean separation between the view layer and the logic layer.

| Component | Description | Usage in gOwOrk |
| :--- | :--- | :--- |
| **React (v18)** | A JavaScript library for building user interfaces based on components. | Serves as the core framework for the Single Page Application (SPA), managing the View layer, state changes, and component lifecycle. |
| **Vite** | A build tool that aims to provide a faster and leaner development experience. | Handles hot module replacement (HMR) during development and bundles assets for production deployment. |
| **Three.js** | A cross-browser JavaScript library and application programming interface used to create and display animated 3D computer graphics. | Renders the Voxel Avatar, lighting effects, and weather particles in the GameScene component to enhance visual engagement. |
| **Tailwind CSS** | A utility-first CSS framework. | Handles all styling, responsiveness, and retro-themed color palettes (e.g., vt323 font, pixel borders). |
| **AudioService** | Custom TypeScript module wrapping the Web Audio API. | Generates procedural chiptune music and sound effects (coins, blips) dynamically without requiring external MP3 assets. |
| **GameService** | TypeScript Singleton Class. | Acts as the "Backend" logic layer. Handles XP calculations, quest generation, validation, and LocalStorage/SQLite persistence. |

### 4.1.2 Interfaces

The system’s components interact and communicate using the following interfaces and protocols:

1.  **Game Context API (Type: Internal State Management):**
    *   **Components Involved:** All UI Components, GameService.
    *   **Purpose:** A React Context provider that exposes the state and methods of the GameService to the entire component tree, ensuring consistent data access across the application.
2.  **LocalStorage/SQLite Interface (Type: Data Persistence):**
    *   **Components Involved:** GameService, Browser Storage.
    *   **Purpose:** A JSON/SQL-based interface for persisting Users, Logs, Quests, and Settings. This serves as the system's database, ensuring data remains available after page refreshes.
3.  **Canvas API (Type: Graphics Rendering):**
    *   **Components Involved:** Minigame Components, Confetti Overlay.
    *   **Purpose:** Used for rendering high-performance 2D graphics for the "Coffee Rush" minigame and visual feedback effects.

## 4.2 Physical Arrangement of Devices in a Typical Network

Since **gOwOrk** is designed as a portable, client-side application, the topology differs from traditional 3-tier architectures. The system utilizes a static hosting environment (Distribution Layer) to deliver the application to the Client Layer, where all processing occurs.

*   **Client Layer (Devices):** The user's device (PC, Tablet, Smartphone) executes the entire application code. This layer handles the Logic, UI rendering, and Database management within the browser.
*   **Distribution Layer (CDN/Host):** A Content Delivery Network (e.g., Vercel, Netlify, or GitHub Pages) serves the static build files (HTML/JS/CSS). Once these files are loaded, the app requires no further network connection for core logic.
*   **Data Layer:** Resides physically on the Client Layer within the Browser's LocalStorage.

## 4.3 User Flow Diagram

The **Clock-In Process Flow** is the most critical path in the system, directly impacting the key performance indicators (KPIs) regarding punctuality and user rewards.

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckLogin{Is Logged In?}
    CheckLogin -- No --> LoginScreen[Login Screen]
    LoginScreen --> InputCreds[Input Username]
    InputCreds --> Validate[Validate vs Mock DB]
    Validate -->|Success| Dashboard
    
    CheckLogin -- Yes --> Dashboard[Main Dashboard]
    
    Dashboard --> Action[Click Clock In]
    Action --> TimeCheck{Check Time}
    
    TimeCheck -- "07:45-08:00" --> EarlyBird[Apply Early Bird Bonus]
    TimeCheck -- "08:00-08:01" --> CritHit[Apply Critical Hit Bonus]
    TimeCheck -- "08:16+" --> Late[Apply Late Penalty]
    TimeCheck -- "Normal" --> Normal[Standard XP]
    
    EarlyBird --> UpdateState[Update User XP/Gold]
    CritHit --> UpdateState
    Late --> UpdateState
    Normal --> UpdateState
    
    UpdateState --> SaveDB[(Save to Storage)]
    SaveDB --> Feedback[Show Animation/Toast]
    Feedback --> End([Shift Active])
```

## 4.4 Context Diagram

The diagram below defines the boundary of the entire system, represented as a single process labeled "**gOwOrk Application**."

```mermaid
contextDiagram
    direction TB
    actor Employee
    actor Manager
    system "gOwOrk Application" as Sys
    database "Browser LocalStorage" as DB

    Employee --> Sys : Clocks In, Plays, Buys
    Manager --> Sys : Administers, Exports Data
    Sys --> DB : Persists State
    DB --> Sys : Loads State
```
