
# Chapter 3: Proposed System Overview

## 3.1 Description of Proposed System
**gOwOrk** is designed as a Single Page Application (SPA) built using React. It operates on a **Service-Oriented Architecture** (SOA) within the client, where the UI interacts with a centralized `GameService` that manages business logic and state persistence.

*   **Front-End:** A responsive, retro-themed UI built with Tailwind CSS and Lucide Icons. It hosts a 3D view (Three.js) for the employee avatar.
*   **Logic Layer:** A TypeScript service layer (`GameService`, `AudioService`) that handles math (XP calculation), validation (Shift status), and audio synthesis.
*   **Data Layer:** A simulation of a database using the browser's `localStorage`, structured as JSON collections.

## 3.2 System User Profile

| User Role | Description | Key Interactions | Needs |
| :--- | :--- | :--- | :--- |
| **Employee** | The primary end-user. | Clock In/Out, Complete Quests, Shop, Play Minigames, Customize Avatar. | Fun, fast interactions, clear feedback on rewards, mobile compatibility. |
| **Manager (Admin)** | The administrator of the instance. | View Dashboard, Manage Users, Punish/Reward Staff, Create Quests, Export Data. | Data visibility, control over staff behavior, ability to correct errors. |

## 3.3 Use Case Diagram

```mermaid
usecaseDiagram
    actor "Employee" as E
    actor "Manager" as M

    package "gOwOrk System" {
        usecase "Login / Authentication" as UC1
        usecase "Clock In/Out" as UC2
        usecase "Perform Work Action" as UC3
        usecase "Purchase Items" as UC4
        usecase "Play Minigame" as UC5
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
