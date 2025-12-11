
# Chapter 5: Functional and Non-Functional Requirements

## 5.1 Functional Requirements

### 5.1.1 Functional Requirement Description

To ensure a smooth operation for our users, the system must fulfill the following functions:

1.  **User Registration and Authentication:** The system shall allow users to create a profile via a unique username. Authentication is handled server-side, verifying credentials against the database before granting access.
2.  **Attendance Tracking:** The system shall capture precise timestamps for "Clock In" and "Clock Out" actions via the Server Time (not Client Time) to prevent cheating.
3.  **Gamification Engine:** The backend must calculate and award Experience Points (XP) and Gold based on user actions. Leveling logic and currency management are enforced by the server.
4.  **Shop & Inventory Management:** The system shall provide a marketplace for users to exchange virtual Gold for items. Transaction validation (checking gold balance) must occur on the server.
5.  **Admin Dashboard:** The system must provide a dedicated interface for Managers to view team analytics, export data to CSV, manage user bans, and trigger global event modifiers.
6.  **Security Monitoring:** The system shall provide a dashboard for Managers to visualize and manage local media streams (camera, microphone, and screen share) to simulate a security hub environment.

## 5.2 Non-Functional Requirements

### 5.2.1 System Audit
For accountability and troubleshooting, the system includes mechanisms to track key activities:
*   **Attendance Logging:** All clock-in/out events are immutable logs stored in the `attendance_logs` table.
*   **Audit Trails:** Critical actions (Banning, Editing, Shop Purchases) are recorded in the `audit_logs` table with timestamps and user IDs.

### 5.2.2 System Control
*   **Access Control:** The API enforces Role-Based Access Control (RBAC). Admin endpoints (e.g., `/api/admin/...`) verify the user's role in the database before executing.
*   **Data Validation:** The Server validates all inputs to prevent logic errors (e.g., preventing negative Gold, ensuring Quest expiry dates are valid).

### 5.2.3 System Security
*   **Password Hashing:** User passwords are hashed (SHA-256) client-side before transmission and storage to ensure basic security.
*   **Sanitization:** The use of Prepared Statements (`better-sqlite3`) prevents SQL Injection attacks.

### 5.2.4 Backup and Disaster Recovery
*   **Data Persistence:** Data is committed to the SQLite WAL (Write-Ahead Log) immediately upon transaction.
*   **Export/Import:** The system provides full database backup functionality via ZIP download (`/api/admin/export-db`) and restore capability via file upload (`/api/admin/import-db`).

### 5.2.5 Usability Requirements
To ensure a user-friendly environment:
*   **Simplicity:** The interface uses clear, large buttons ("Action Pad") and icons to accommodate fast-paced retail environments.
*   **Responsiveness:** The layout automatically adjusts from a 3-column desktop view to a single-column mobile view.
*   **Feedback:** Every action provides immediate feedback via Toast notifications and Sound Effects.

### 5.2.6 System Performance
*   **Speed:** API response times should generally be under 200ms.
*   **Rendering:** The Three.js scene must maintain 60 FPS on standard integrated graphics. Low Performance Mode is available for older devices.
