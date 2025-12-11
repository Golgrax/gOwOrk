
# Chapter 5

## 5. Functional and Non-Functional Requirements

### 5.1 Functional Requirements

#### 5.1.1 Functional Requirement Description

To ensure a smooth and detailed operation for our users, we have outlined the essential functions that will be fulfilled in **gOwOrk**, which are as follows:

1.  **User Registration and Authentication:** The users should be able to properly create their own account so that they will be able to login securely. Authentication is handled server-side using SHA-256 password hashing.
2.  **Attendance Tracking:** The system shall capture precise timestamps for "Clock In" and "Clock Out" actions via the Server Time to prevent cheating.
3.  **Gamification Engine:** The backend must calculate and award Experience Points (XP) and Gold based on user actions. Leveling logic, Skill Trees, and currency management are enforced by the server.
4.  **Shop & Inventory Management:** The system shall provide a marketplace for users to exchange virtual Gold for items (Hats, Outfits, Pets). Transaction validation must occur on the server.
5.  **Admin Dashboard:** The system must provide a dedicated interface for Managers to view team analytics, export data to CSV, manage user bans, and trigger global event modifiers.
6.  **Security Monitoring:** The system shall provide a dashboard for Managers to visualize and manage local media streams (camera, microphone, and screen share) to simulate a security hub environment.

### 5.2 Non-Functional Requirements

#### 5.2.1 System Audit
For proper accountability and troubleshooting, our system must include the correct mechanisms to track and log the key activities in the system.
*   **Audit Trails:** Critical actions (Banning, Editing, Shop Purchases, Quest Approvals) are recorded in the `audit_logs` table with timestamps and user IDs.

#### 5.2.2 System Control
In order to maintain smooth, secure, and reliable operations of our system, we shall enforce strict measures and system control.
*   **Access Control:** The API enforces Role-Based Access Control (RBAC). Admin endpoints verify the user's role in the database before executing.
*   **Data Validation:** The Server validates all inputs to prevent logic errors (e.g., preventing negative Gold).

#### 5.2.3 System Security
To maximize data security, these functions will pave the way for our system's smooth and secure operational duties.
*   **Password Hashing:** User passwords are hashed (SHA-256) client-side before transmission and storage.
*   **Sanitization:** The use of Prepared Statements (`better-sqlite3`) prevents SQL Injection attacks.

#### 5.2.4 Backup and Disaster Recovery
System failures are common for systems, thus we will ensure that in case of emergencies, our system will provide a system recovery method and backup.
*   **Export/Import:** The system provides full database backup functionality via ZIP download (`/api/admin/export-db`) and restore capability via file upload (`/api/admin/import-db`).

#### 5.2.5 Usability Requirements
To ensure the user-friendly environment of our platform, here are some of the features that our system offers for better experience:
*   **Simplicity:** The interface uses clear, large buttons and pixel-art icons.
*   **Responsiveness:** The layout automatically adjusts from a 3-column desktop view to a single-column mobile view.
*   **Feedback:** Every action provides immediate feedback via Toast notifications and Sound Effects.

#### 5.2.6 System Performance
The system's performance is focused on better user experience.
*   **Speed:** API response times should generally be under 200ms.
*   **Rendering:** The Three.js scene must maintain 60 FPS on standard integrated graphics.
