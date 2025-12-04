
# Chapter 4: Architectural Design

## 4.1 High-Level Components & Interfaces

### Components (Tech Stack)
*   **Core Framework:** **React (v18)** with TypeScript for type-safe component logic.
*   **Build Tool:** **Vite** for rapid development and optimized production bundling.
*   **Styling:** **Tailwind CSS** for utility-first styling, ensuring a consistent design system.
*   **3D Engine:** **Three.js** for rendering the Voxel Avatar and environmental effects.
*   **Audio Engine:** **Web Audio API** (Custom `AudioService`) for generating procedural sound effects and chiptune music without external assets.
*   **Icons:** **Lucide React** for consistent iconography.

### Interfaces
*   **Game Context API:** A React Context provider that exposes the state and methods of the `GameService` to the entire component tree.
*   **LocalStorage Interface:** A JSON-based interface for persisting `Users`, `Logs`, `Quests`, and `Settings`.
*   **Canvas API:** Used for the "Coffee Rush" minigame and Confetti effects.

## 4.2 Physical Arrangement (Network Topology)
Since gOwOrk is a client-side application, the topology is simplified.

*   **Client Layer:** The user's device (PC, Tablet, Smartphone) executes the entire application code.
*   **Application Layer (Delivery):** A Content Delivery Network (CDN) or Static Host (e.g., Vercel, GitHub Pages) serves the static HTML/JS/CSS bundles.
*   **Data Layer:** Resides physically on the Client Layer (Browser Storage).

## 4.3 User Flow Diagram (The Clock-In Process)

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
