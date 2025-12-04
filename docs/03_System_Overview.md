
# Chapter 3: Proposed System Overview

## 3.1 Description of Proposed System
**gOwOrk** is designed as a Single Page Application (SPA) built using React. It operates on a **Service-Oriented Architecture** (SOA) within the client, where the UI interacts with a centralized `GameService` that manages business logic and state persistence.

The system serves a dual purpose:
1.  **Utility:** Precise time-tracking for shift work.
2.  **Engagement:** A gamification layer that rewards positive employee behavior.

*   **Front-End:** A responsive, retro-themed UI built with Tailwind CSS and Lucide Icons. It hosts a 3D view (Three.js) for the employee avatar.
*   **Logic Layer:** A TypeScript service layer (`GameService`, `AudioService`) that handles math (XP calculation), validation (Shift status), and audio synthesis.
*   **Data Layer:** A simulation of a database using the browser's `localStorage`, structured as JSON collections.

## 3.2 System User Profile

The system interacts with two main user groups, each with distinct roles and key interactions:

| User Profile | Role/Description | User Needs | Key System Interactions |
| :--- | :--- | :--- | :--- |
| **Employee (Hero)** | The primary end-user/staff member performing shift duties. | 1. A fun, non-intrusive way to log attendance.<br>2. Visual feedback for achievements.<br>3. Customization options for their avatar.<br>4. Mobile compatibility for on-the-go access. | • Clock In/Out<br>• Complete Daily Quests<br>• Purchase Shop Items<br>• Play Minigames<br>• Feed Pet/Companion |
| **Manager (Admin)** | The administrator or store manager responsible for oversight. | 1. Accurate data for payroll processing.<br>2. Tools to correct attendance errors.<br>3. Ability to incentivize staff (Bonuses).<br>4. Overview of team morale (Health/XP). | • View Team Analytics<br>• Manage Users (Edit/Ban)<br>• Export CSV Data<br>• Trigger Global Events<br>• Distribute Gold Bonuses |

## 3.3 Use Case Diagram

The diagram below visually defines the functional scope of the system.

```mermaid
usecaseDiagram
    actor "Employee" as E
    actor "Manager" as M

    package "gOwOrk System" {
        usecase "Login / Authentication" as UC1
        usecase "Clock In/Out" as UC2
        usecase "Perform Work Action" as UC3
        usecase "Purchase Items & Customize" as UC4
        usecase "Play Minigame (Arcade)" as UC5
        usecase "Manage Staff (Ban/Edit)" as UC6
        usecase "View Analytics" as UC7
        usecase "Create Quests" as UC8
        usecase "Export Payroll CSV" as UC9
    }

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
    M --> UC2 : (Can also participate)
```

## 3.4 Data Flow Diagram (DFD) Level 1

The DFD depicts the flow of information across the system components.

```mermaid
flowchart LR
    User[User / Admin]
    UI[User Interface (React)]
    Service[GameService Logic]
    Audio[AudioService]
    Storage[(Local Storage DB)]

    User -- "Interacts (Clicks/Inputs)" --> UI
    UI -- "Triggers Actions (Clock In/Buy)" --> Service
    UI -- "Requests Sound" --> Audio
    Service -- "Validates & Processes" --> Service
    Service -- "Reads/Writes State" --> Storage
    Storage -- "Returns JSON Data" --> Service
    Service -- "Returns Updated State" --> UI
    UI -- "Displays Visual Feedback" --> User
```
