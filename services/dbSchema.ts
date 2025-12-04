// This file contains the requested SQL schema for reference.
// In this React SPA, we mimic this structure in local state/storage.

export const SQL_SCHEMA = `
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_json TEXT NOT NULL, -- JSON string
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    current_gold INTEGER DEFAULT 0,
    current_hp INTEGER DEFAULT 100,
    total_hp INTEGER DEFAULT 100
);

CREATE TABLE attendance_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time_in TEXT NOT NULL,
    time_out TEXT,
    status TEXT NOT NULL,
    xp_earned INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE quests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward_gold INTEGER NOT NULL,
    type TEXT NOT NULL
);

CREATE TABLE user_quests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(quest_id) REFERENCES quests(id)
);

CREATE TABLE shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    cost INTEGER NOT NULL,
    asset_url TEXT NOT NULL
);
`;