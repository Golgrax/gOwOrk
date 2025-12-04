
# Chapter 6: Software Model and Design

## 6.1 Software Development Model
**gOwOrk** utilizes an **Agile/Component-Based** development model.
*   **Justification:** React's component architecture inherently supports iterative development. Features (like the "Pet Widget" or "Minigame") were developed as isolated components and integrated into the main `App` layout, allowing for rapid prototyping and testing without breaking the core system.

## 6.2 Sequence Diagram (Purchase Item)

This diagram illustrates the process flow when a user attempts to purchase an item from the shop.

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Shop Component
    participant S as GameService
    participant DB as LocalStorage

    U->>UI: Click "Buy Item"
    UI->>S: buyItem(itemId)
    S->>S: Validate Gold Balance >= Cost
    alt Insufficient Funds
        S-->>UI: Throw Error
        UI-->>U: Toast "Not Enough Gold"
    else Sufficient Funds
        S->>S: Deduct Gold
        S->>S: Add Item to Inventory
        S->>DB: persist() (Save User State)
        DB-->>S: Success
        S-->>UI: Return Updated User
        UI-->>U: Toast "Item Purchased"
        UI->>U: Play Sound (Coin)
    end
```

## 6.3 Entity Relationship Diagram (ERD)

The ERD below represents the data structure for user interaction, attendance, and progression.

```mermaid
erDiagram
    USER ||--o{ ATTENDANCE_LOG : "generates"
    USER ||--o{ USER_QUEST : "has"
    USER ||--o{ ACHIEVEMENT : "unlocks"
    USER ||--|| AVATAR_CONFIG : "configures"
    QUEST ||--o{ USER_QUEST : "defines"
    
    USER {
        string id PK
        string username
        string role
        int level
        int current_gold
        int current_xp
        json inventory
        json unlocked_skills
    }

    ATTENDANCE_LOG {
        string id PK
        string user_id FK
        datetime time_in
        datetime time_out
        string status
    }

    QUEST {
        string id PK
        string title
        int reward_gold
        int reward_xp
        datetime expiresAt
    }
```

## 6.4 Database Schema (JSON Structure)

Although utilizing NoSQL-style JSON storage, the strict typing enforces a schema:

**Table: Users**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique Identifier |
| `username` | String | Login credential |
| `role` | Enum | 'employee' or 'manager' |
| `avatar_json` | JSON Object | Stores Hat, Eyes, Clothing IDs |
| `inventory` | Array<String> | List of owned Item IDs |
| `pet` | Object | Stores Pet Name, Hunger, Happiness |

**Table: AttendanceLogs**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | String (Timestamp) | Unique Identifier |
| `user_id` | String | Foreign Key to User |
| `date` | String (ISO) | Date of shift |
| `time_in` | String (ISO) | Clock In Timestamp |
| `status` | Enum | 'ontime', 'late', 'early_bird', 'critical_hit' |

## 6.5 User Interface Design

### 6.5.1 Rules and Guidelines for User Interface Designing

The following principles ensure a functional and engaging UI for gOwOrk:

1.  **Input Validation:**
    *   **Client-Side:** React state prevents submission of empty forms (e.g., Quest Creation). Buttons are disabled when criteria are not met (e.g., "Buy" button grayed out if insufficient Gold).
    *   **Feedback:** Visual cues (red borders, shake animations) indicate invalid actions.

2.  **Error Messages & Warnings:**
    *   **Toast System:** All errors display as top-right toast notifications in red.
    *   **Confirmation:** Critical actions (like "Reset Game Data") require a browser confirmation dialog (`window.confirm`) to prevent accidental data loss.

3.  **Visual Language:**
    *   **Color Palette:** Retro Gold (`#ff9900`) for rewards, Success Green (`#4ade80`) for actions, Danger Red (`#f87171`) for penalties/errors.
    *   **Typography:** 'VT323' (Monospace Pixel Font) used universally to maintain the arcade aesthetic.
    *   **Responsiveness:** Elements like the `ActionPad` scale from a 3-column grid on desktop to larger, touch-friendly buttons on mobile.
