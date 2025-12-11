
# Chapter 6

## 6. Software Model and Design

### 6.1 Software Development Model

**gOwOrk** utilizes an **Agile/Component-Based** development model. React's component architecture inherently supports iterative development. Features (like the Minigame or Security Monitor) were developed as isolated components and integrated into the main `App` layout, communicating with a unified Backend API.

### 6.2 Sequence Diagram

This sequence diagram illustrates the process flow when a user attempts to purchase an item from the shop via the API.

1.  **User** clicks "Buy Item" in the Shop UI.
2.  **Client (GameService)** sends a `POST /api/shop/buy` request to the Server.
3.  **Server** retrieves the User record from the SQLite Database.
4.  **Server** validates if `User.Gold >= Item.Cost`.
    *   If insufficient: Return 400 Bad Request.
    *   If sufficient: Deduct Gold, Add Item to Inventory, Save to DB.
5.  **Server** responds with the updated User object.
6.  **Client** updates the State and plays a "Coin" sound effect.

### 6.3 Entity Relationship Diagram (ERD)

The ERD represents the data structure stored in the SQLite database.

*   **Users:** The central entity. Attributes: `id`, `username`, `password_hash`, `role`, `gold`, `xp`, `hp`.
*   **Attendance_Logs:** Logs individual shifts. Linked to Users via `user_id`. Attributes: `time_in`, `time_out`, `status`.
*   **Audit_Logs:** Tracks system actions. Linked to Users via `user_id`.
*   **Active_Quests:** Stores available tasks.
*   **Completed_Quests:** Junction table linking Users and Quests with a status (`pending`, `approved`).

### 6.4 Database Schema

The system uses a relational SQLite database. Below are the actual table definitions used by the backend.

**Table: `users`**
*   `id` (TEXT PK): Unique Identifier.
*   `username` (TEXT): Login credential.
*   `password_hash` (TEXT): SHA-256 hashed password.
*   `role` (TEXT): 'employee', 'manager', 'moderator'.
*   `current_gold` (INTEGER): Virtual Currency.
*   `current_xp` (INTEGER): Experience Points.
*   `unlocked_skills` (TEXT JSON): List of unlocked Skill IDs.
*   `pet_json` (TEXT JSON): Pet stats (Name, Hunger, Happiness).

**Table: `attendance_logs`**
*   `id` (TEXT PK): Unique Identifier.
*   `user_id` (TEXT FK): Link to User.
*   `date` (TEXT): Date of shift.
*   `time_in` (TEXT): Clock In Timestamp.
*   `time_out` (TEXT): Clock Out Timestamp.
*   `status` (TEXT): 'ontime', 'late', 'early_bird'.

**Table: `audit_logs`**
*   `id` (TEXT PK): Unique Identifier.
*   `action_type` (TEXT): 'SHOP', 'ADMIN', 'SYSTEM'.
*   `details` (TEXT): Description of the action.

### 6.5 User Interface Design

#### 6.5.1 Rules and Guidelines for User Interface Designing

The following principles ensure a functional and engaging UI for gOwOrk:

1.  **Visual Language:**
    *   **Color Scheme:** Retro Gold (`#ff9900`) for rewards, Success Green (`#4ade80`) for actions, Danger Red (`#f87171`) for penalties.
    *   **Typography:** 'VT323' (Monospace Pixel Font) used universally.
2.  **Input Validation:**
    *   **Client-Side:** React state prevents submission of empty forms.
    *   **Server-Side:** API endpoints validate all payloads.
3.  **Feedback:**
    *   **Toast System:** Immediate pop-up notifications for success/error states.

#### 6.5.2 User Interfaces for Each Use Case

1.  **Login Screen:** A retro title screen with flashing text ("Press Start") and fields for Username/Password.
2.  **Main Dashboard:** Displays the 3D Avatar, Action Pad (Work/Break), and Quest Board.
3.  **Security Monitor:** A grid layout showing active camera feeds and audio visualizers.
4.  **Shop:** A card-based layout displaying items with prices and "Buy" buttons.
