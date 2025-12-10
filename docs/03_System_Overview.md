
# Chapter 3: Proposed System Overview

## 3.1 Description of the Proposed System
**gOwOrk** is a Full-Stack Web Application built using React for the frontend and Node.js/Express for the backend. The system is designed to digitize and gamify the shift management process, serving a dual purpose: providing a utility for precise time-tracking and creating an engagement layer that rewards positive employee behavior.

The system is conceptually divided into three main layers:

1.  **Front-End (View Layer):** A responsive, retro-themed SPA (Single Page Application) built with React and Tailwind CSS. It hosts a 3D view using Three.js to render the employee’s Voxel Avatar and communicates with the backend via REST API calls.
2.  **Logic Layer (Controller Layer):** An Express.js server (`server.js`) that handles authentication, business logic (XP calculations, quest generation), validation, and data routing.
3.  **Data Layer (Persistence Layer):** A Server-Side SQLite database (`better-sqlite3`). This relational database ensures robust data persistence, supports multiple users accessing data simultaneously, and allows for complex querying (e.g., Leaderboards, Analytics).

## 3.2 System User Profile

The system interacts with two main user groups, each with distinct roles, needs, and key interactions:

| User Profile | Role/Description | User Needs | Key System Interactions |
| :--- | :--- | :--- | :--- |
| **Employee (Hero)** | The primary end-user or staff member performing shift duties. | 1. A fun, non-intrusive way to log attendance.<br>2. Visual feedback for achievements.<br>3. Customization options for their avatar.<br>4. Mobile compatibility for on-the-go access. | • Clock In/Out<br>• Complete Daily Quests<br>• Purchase Shop Items<br>• Play Minigames<br>• Feed Pet/Companion |
| **Manager (Admin)** | The administrator or store manager responsible for oversight. | 1. Accurate data for payroll processing.<br>2. Tools to correct attendance errors.<br>3. Ability to incentivize staff (Bonuses).<br>4. Overview of team morale (Health/XP). | • View Team Analytics<br>• Manage Users (Edit/Ban)<br>• Export CSV Data<br>• Trigger Global Events<br>• Backup/Restore Database |

## 3.3 Use Case Diagram

The Use Case Diagram visually defines the **functional requirements** and **scope** of the system by illustrating the key interactions between the primary actors and the system's functionalities.

*   **Employee Use Cases:** Login, Clock In/Out, Perform Work Action, Purchase Items & Customize, Play Minigame (Arcade).
*   **Manager Use Cases:** Login, Manage Staff (Ban/Edit), View Analytics, Create Quests, Export Payroll CSV, Backup Database.

```mermaid
flowchart LR
    E["Employee"]
    M["Manager"]

    subgraph System
        direction TB
        UC1(["Login / Authentication"])
        UC2(["Clock In/Out"])
        UC3(["Perform Work Action"])
        UC4(["Purchase Items & Customize"])
        UC5(["Play Minigame (Arcade)"])
        UC6(["Manage Staff (Ban/Edit)"])
        UC7(["View Analytics"])
        UC8(["Create Quests"])
        UC9(["Export Payroll CSV / Backup DB"])
    end

    E --> UC1
    E --> UC2
    E --> UC3
    E --> UC4
    E --> UC5

    M --> UC1
    M --> UC6
    M --> UC7
    M --> UC8
    M --> UC9
    M --> UC2
```

## 3.4 Data Flow Diagram (DFD) Level 1

The DFD depicts the flow of information across the system components, highlighting the interaction between the User Interface, the API Service, and the Server Database.

```mermaid
flowchart TD
    User[User / Admin]
    UI[User Interface - React]
    API[Client API Service]
    Server[Node.js Server]
    DB[(SQLite Database)]

    User -- "Interacts (Clicks/Inputs)" --> UI
    UI -- "Calls Method" --> API
    API -- "HTTP Request (JSON)" --> Server
    Server -- "Validates & Processes Logic" --> Server
    Server -- "SQL Query" --> DB
    DB -- "Result Set" --> Server
    Server -- "HTTP Response (JSON)" --> API
    API -- "Returns Data" --> UI
    UI -- "Updates View / Toasts" --> User
```
