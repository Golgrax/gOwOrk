
# Chapter 5: Functional and Non-Functional Requirements

## 5.1 Functional Requirements

### 5.1.1 Functional Requirement Description

To ensure a smooth operation for our users, the system must fulfill the following functions:

1.  **User Registration and Authentication:** The system shall allow users to create a profile via a unique username. It must support role-based login (Employee vs. Manager) and persist the session.
2.  **Attendance Tracking:** The system shall capture precise timestamps for "Clock In" and "Clock Out" actions. It must apply logical modifiers (Bonuses/Penalties) based on the time of action relative to the scheduled shift start (08:00 AM).
3.  **Gamification Engine:** The system must calculate and award Experience Points (XP) and Gold based on user actions. It must support a leveling system where accumulating XP increases the user Level and unlocks Skill Points.
4.  **Shop & Inventory Management:** The system shall provide a marketplace for users to exchange virtual Gold for cosmetic items (Avatar customization) and consumable items (HP restoration).
5.  **Admin Dashboard:** The system must provide a dedicated interface for Managers to view team analytics, export data to CSV, manage user bans, and trigger global event modifiers.

## 5.2 Non-Functional Requirements

### 5.2.1 System Audit
For accountability and troubleshooting, the system includes mechanisms to track key activities:
*   **Attendance Logging:** All clock-in/out events are immutable logs stored with a unique timestamp ID.
*   **Admin Actions:** Critical actions taken by managers (e.g., Banning a user, Editing a profile) should be logged (conceptually) to ensure accountability.

### 5.2.2 System Control
*   **Access Control:** The system enforces Role-Based Access Control (RBAC). Only users with the `role: 'manager'` property in their JSON object can access the Dashboard and Edit features.
*   **Data Validation:** The `GameService` validates all inputs (e.g., negative Gold values, future dates) before committing them to the LocalStorage state.

### 5.2.3 System Security
*   **Sanitization:** All user inputs (Quest titles, Usernames) are sanitized to prevent basic injection or formatting errors.
*   **Local Encryption:** While currently storing raw JSON, future iterations will implement Base64 encoding or encryption for LocalStorage to prevent casual tampering.

### 5.2.4 Backup and Disaster Recovery
*   **Data Persistence:** The system writes to `localStorage` on every state change (Clock in, Buy item) to prevent data loss on page refresh.
*   **Export Capability:** The "Export Data" feature allows the Manager to extract the entire database state to a CSV file, serving as a manual backup point.

### 5.2.5 Usability Requirements
To ensure a user-friendly environment:
*   **Simplicity:** The interface uses clear, large buttons ("Action Pad") and icons to accommodate fast-paced retail environments.
*   **Responsive Design:** The layout automatically adjusts from a 3-column desktop view to a single-column mobile view.
*   **Feedback:** Every action provides immediate feedback via Toast notifications (visual) and 8-bit Sound Effects (auditory).

### 5.2.6 System Performance
*   **Speed:** Application load time must be under 2 seconds on 4G networks.
*   **Rendering:** The Three.js scene must maintain 60 FPS on standard integrated graphics (e.g., Intel UHD). Low Performance Mode is available for older devices.
