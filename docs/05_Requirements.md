
# Chapter 5: Functional and Non-Functional Requirements

## 5.1 Functional Requirements

### Core Modules
1.  **Authentication:**
    *   System shall allow users to login via a unique username.
    *   System shall restrict Admin features to users with 'manager' role.
    *   System shall prevent login for users marked as 'banned'.

2.  **Attendance:**
    *   System shall calculate 'Time In' bonuses based on server/client time.
    *   System shall record a log entry for every shift start and end.
    *   System shall apply penalties (HP loss) for lateness.

3.  **Economy & Progression:**
    *   System shall award XP and Gold for work actions, quests, and arcade games.
    *   System shall increase User Level when XP threshold is met.
    *   System shall unlock Skill Points upon leveling up.

4.  **Shop & Inventory:**
    *   System shall allow purchase of Items if Gold balance is sufficient.
    *   System shall update the 3D Avatar immediately upon equipping an item.
    *   System shall support consumable items that restore HP.

5.  **Administration:**
    *   System shall allow Admins to edit user profiles.
    *   System shall allow Admins to export attendance logs to CSV.
    *   System shall allow Admins to toggle Global Events (e.g., Double XP).

## 5.2 Non-Functional Requirements

1.  **System Audit:**
    *   The system shall persist all attendance logs indefinitely within the storage limits.
    *   Toast notifications shall provide immediate feedback for all state-changing actions.

2.  **System Control:**
    *   Role-Based Access Control (RBAC) must strictly hide Admin tabs from standard employees.

3.  **Usability:**
    *   The interface must utilize a Retro/Pixel-art aesthetic with the 'VT323' font.
    *   UI components must be touch-friendly for tablet usage.

4.  **Availability:**
    *   The system shall function offline (after initial load) due to local processing, though this is dependent on the host reliability.

5.  **Performance:**
    *   The 3D Game Scene shall optimize rendering by not re-instantiating the WebGL context on every React render.
    *   Calculations for attendance logic must execute in under 100ms.

6.  **Hardware Requirements:**
    *   **Client:** Device with WebGL support, 4GB RAM recommended (for 3D), Screen resolution min 360x640.
