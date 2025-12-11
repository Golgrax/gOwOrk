
# Chapter 3

## 3. Proposed System Overview

### 3.1 Description of the Proposed System

**gOwOrk** is a Full-Stack Web Application built using React for the frontend and Node.js/Express for the backend. The system is designed to digitize and gamify the shift management process, serving a dual purpose: providing a utility for precise time-tracking and creating an engagement layer that rewards positive employee behavior.

The system is conceptually divided into three main layers:

1.  **Front-End (View Layer):** A responsive, retro-themed SPA (Single Page Application) built with React and Tailwind CSS. It hosts a 3D view using Three.js to render the employee’s Voxel Avatar and communicates with the backend via REST API calls.
2.  **Logic Layer (Controller Layer):** An Express.js server that handles authentication, business logic (XP calculations, quest generation), validation, and data routing.
3.  **Data Layer (Persistence Layer):** A Server-Side SQLite database (`better-sqlite3`). This relational database ensures robust data persistence, supports multiple users accessing data simultaneously, and allows for complex querying (e.g., Leaderboards, Analytics).

### 3.2 System User Profile

In order to create a fully functional space for the workplace, we first need to understand the different kinds of roles, and responsibilities of the wide range of users that this system will accommodate.

**1. Employee (Hero)**
These are the primary end-users or staff members performing shift duties.
*   **User Needs:**
    1.  A fun, non-intrusive way to log attendance.
    2.  Visual feedback for achievements and progress.
    3.  Customization options for their avatar.
*   **User Actions:**
    *   Clock In/Out.
    *   Complete Daily Quests.
    *   Purchase Shop Items.
    *   Play Minigames (Arcade).
    *   Feed Pet/Companion.

**2. Manager (Admin)**
The administrator or store manager responsible for oversight.
*   **User Needs:**
    1.  Accurate data for payroll processing.
    2.  Tools to correct attendance errors.
    3.  Ability to incentivize staff (Bonuses).
    4.  Overview of team morale (Health/XP).
*   **User Actions:**
    *   View Team Analytics.
    *   Manage Users (Edit/Ban).
    *   Export CSV Data / Backup Database.
    *   Trigger Global Events.
    *   Monitor Security Feeds.

### 3.3 Use Case Diagram

The diagram below illustrates the platform involving two primary user roles: Employee and Manager. First, the Employees will have to log in to access relevant resources, clock in, and purchase items. The Manager manages the platform overall, handles support requests (bans/edits), and ensures the data is backed up.

*(Note: In a real paper, a visual diagram would be inserted here. For this Markdown representation, we describe the flow)*

*   **Employee:** Login -> Clock In -> Work Action -> Shop -> Logout.
*   **Manager:** Login -> Dashboard -> Export Data -> Security Monitor -> Logout.

### 3.4 Data Flow Diagram (DFD)

The proposed system’s data flow diagram (DFD) shows how the users and the core components of our platform interact. To start, the users must first go through the login process where their data can be verified against the SQLite database. Once authenticated, they access the Game Scene. Actions like "Clock In" send requests to the Node.js server, which validates the timestamp, updates the `attendance_logs` table, and returns the result to the UI. The UI then updates the 3D Avatar and XP bars accordingly.
