
import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist')));

// --- DATABASE SETUP ---
const db = new Database('gowork.db');
db.pragma('journal_mode = WAL');

// Migrations
const schema = `
  CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      password_hash TEXT,
      name TEXT,
      role TEXT,
      level INTEGER DEFAULT 1,
      current_xp INTEGER DEFAULT 0,
      current_gold INTEGER DEFAULT 0,
      current_hp INTEGER DEFAULT 100,
      total_hp INTEGER DEFAULT 100,
      streak INTEGER DEFAULT 0,
      last_login_date TEXT,
      last_spin_date TEXT,
      last_mystery_box_date TEXT,
      last_arcade_play_time INTEGER,
      skill_points INTEGER DEFAULT 0,
      kudos_received INTEGER DEFAULT 0,
      is_banned BOOLEAN DEFAULT 0,
      avatar_json TEXT,
      inventory TEXT,
      achievements TEXT,
      unlocked_skills TEXT,
      pet_json TEXT
  );

  CREATE TABLE IF NOT EXISTS attendance_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date TEXT,
      time_in TEXT,
      time_out TEXT,
      status TEXT,
      xp_earned INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action_type TEXT,
      details TEXT,
      timestamp INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS active_quests (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      reward_gold INTEGER,
      reward_xp INTEGER,
      type TEXT,
      expires_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS completed_quests (
      user_id TEXT,
      quest_id TEXT,
      status TEXT DEFAULT 'pending',
      PRIMARY KEY (user_id, quest_id),
      FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS game_globals (
      key TEXT PRIMARY KEY,
      value TEXT
  );
`;
db.exec(schema);

// --- SHARED CONSTANTS (Mirrored from Frontend) ---
const SKILL_TREE = [
    { id: 'skill_barista_mastery', effectType: 'gold_boost', effectValue: 0.2 },
    { id: 'skill_iron_lungs', effectType: 'max_hp_boost', effectValue: 20 },
    { id: 'skill_charisma', effectType: 'shop_discount', effectValue: 0.15 },
    { id: 'skill_fast_learner', effectType: 'xp_boost', effectValue: 0.1 },
];

const SHOP_ITEMS = [
    { id: 'item_cap_red', cost: 50, type: 'hat' },
    { id: 'item_cap_blue', cost: 50, type: 'hat' },
    { id: 'item_crown', cost: 500, type: 'hat' },
    { id: 'item_shades', cost: 100, type: 'eyes' },
    { id: 'item_monocle', cost: 250, type: 'eyes' },
    { id: 'item_apron_green', cost: 0, type: 'clothing' },
    { id: 'item_suit', cost: 1000, type: 'clothing' },
    { id: 'pet_dog', cost: 500, type: 'pet' },
    { id: 'cons_coffee', cost: 15, type: 'consumable', effectValue: 20 },
    { id: 'cons_donut', cost: 25, type: 'consumable', effectValue: 40 },
    { id: 'cons_energy', cost: 50, type: 'consumable', effectValue: 100 },
];

const INITIAL_BOSS = {
  name: "The Sunday Rush",
  currentHp: 1000,
  maxHp: 1000,
  isActive: true,
  description: "An endless horde of caffeine-deprived zombies."
};

// --- HELPER FUNCTIONS ---

function logAction(userId, type, details) {
    const id = crypto.randomUUID();
    const stmt = db.prepare('INSERT INTO audit_logs (id, user_id, action_type, details, timestamp) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, userId, type, details, Date.now());
}

function getUser(id) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!row) return null;
    return mapUser(row);
}

function mapUser(row) {
    return {
        ...row,
        avatar_json: JSON.parse(row.avatar_json || '{}'),
        inventory: JSON.parse(row.inventory || '[]'),
        achievements: JSON.parse(row.achievements || '[]'),
        unlocked_skills: JSON.parse(row.unlocked_skills || '[]'),
        pet: row.pet_json ? JSON.parse(row.pet_json) : undefined,
        isBanned: !!row.is_banned
    };
}

function saveUser(user) {
    const stmt = db.prepare(`
        UPDATE users SET 
        current_xp = ?, current_gold = ?, current_hp = ?, total_hp = ?, level = ?, streak = ?, 
        last_login_date = ?, last_spin_date = ?, last_mystery_box_date = ?, last_arcade_play_time = ?,
        skill_points = ?, kudos_received = ?, is_banned = ?, avatar_json = ?, inventory = ?,
        achievements = ?, unlocked_skills = ?, pet_json = ?
        WHERE id = ?
    `);
    stmt.run(
        user.current_xp, user.current_gold, user.current_hp, user.total_hp, user.level, user.streak,
        user.last_login_date, user.last_spin_date, user.last_mystery_box_date, user.last_arcade_play_time,
        user.skill_points, user.kudos_received, user.isBanned ? 1 : 0,
        JSON.stringify(user.avatar_json), JSON.stringify(user.inventory), JSON.stringify(user.achievements), JSON.stringify(user.unlocked_skills), JSON.stringify(user.pet || null),
        user.id
    );
}

function getSkillMultiplier(user, type) {
    let multiplier = 1;
    for (const skillId of user.unlocked_skills) {
        const skill = SKILL_TREE.find(s => s.id === skillId);
        if (skill && skill.effectType === type) {
            if (type === 'shop_discount') multiplier -= skill.effectValue;
            else multiplier += skill.effectValue;
        }
    }
    return multiplier;
}

function damageBoss(amt) {
    let boss = JSON.parse(db.prepare("SELECT value FROM game_globals WHERE key = 'boss'").get()?.value || JSON.stringify(INITIAL_BOSS));
    if (boss.isActive) {
        boss.currentHp = Math.max(0, boss.currentHp - amt);
        if (boss.currentHp === 0) boss.isActive = false;
        db.prepare("INSERT OR REPLACE INTO game_globals (key, value) VALUES ('boss', ?)").run(JSON.stringify(boss));
    }
}

// --- ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!row) return res.status(404).json({ error: "User not found" });
    if (row.is_banned) return res.status(403).json({ error: "Banned" });
    
    // In a real app, verify hash. For prototype, we assume logic handled client or simple equality if needed.
    // We'll trust the GameService sent password logic for now or implement simple check if needed.
    // For this migration, we send back the user.
    res.json(mapUser(row));
});

app.post('/api/auth/register', (req, res) => {
    const { id, username, password_hash, name, role, avatar_json } = req.body;
    try {
        const stmt = db.prepare(`
            INSERT INTO users (id, username, password_hash, name, role, avatar_json, inventory, achievements, unlocked_skills, level, current_gold, current_hp, total_hp)
            VALUES (?, ?, ?, ?, ?, ?, '["item_cap_red","item_apron_green"]', '[]', '[]', 1, 100, 100, 100)
        `);
        stmt.run(id, username, password_hash, name, role, JSON.stringify(avatar_json));
        logAction(id, 'SYSTEM', 'Registered');
        res.json(getUser(id));
    } catch (e) {
        res.status(400).json({ error: "Username taken" });
    }
});

app.get('/api/user/:id', (req, res) => {
    const u = getUser(req.params.id);
    u ? res.json(u) : res.status(404).send();
});

// Data Refresh
app.get('/api/data/refresh', (req, res) => {
    const users = db.prepare('SELECT * FROM users ORDER BY current_xp DESC').all().map(mapUser);
    const quests = db.prepare('SELECT * FROM active_quests').all();
    const bossRow = db.prepare("SELECT value FROM game_globals WHERE key = 'boss'").get();
    const boss = bossRow ? JSON.parse(bossRow.value) : INITIAL_BOSS;
    const weatherRow = db.prepare("SELECT value FROM game_globals WHERE key = 'weather'").get();
    const motdRow = db.prepare("SELECT value FROM game_globals WHERE key = 'motd'").get();
    const globalModsRow = db.prepare("SELECT value FROM game_globals WHERE key = 'modifiers'").get();
    
    res.json({
        leaderboard: users,
        activeQuests: quests,
        bossEvent: boss,
        weather: weatherRow ? weatherRow.value : 'Sunny',
        motd: motdRow ? motdRow.value : '',
        globalModifiers: globalModsRow ? JSON.parse(globalModsRow.value) : { xpMultiplier: 1, goldMultiplier: 1 }
    });
});

// Actions
app.post('/api/action/clock-in', (req, res) => {
    const { userId, date, isOverdrive } = req.body; // date is ISO string
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    const d = new Date(date);
    const todayStr = d.toISOString().split('T')[0];
    
    // Check existing
    const existing = db.prepare('SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?').get(userId, todayStr);
    if (existing) return res.json(existing);

    // Logic
    const hour = d.getHours();
    const minute = d.getMinutes();
    
    // Streak
    if (user.last_login_date !== todayStr) {
        const lastLogin = new Date(user.last_login_date || 0);
        const diffDays = Math.ceil(Math.abs(d.getTime() - lastLogin.getTime()) / (86400000));
        user.streak = (diffDays <= 1) ? user.streak + 1 : 1;
        user.last_login_date = todayStr;
    }

    let status = 'ontime';
    let xp = 10 + (user.streak * 5);
    let hpChange = 0;

    if (hour === 7 && minute >= 45) { status = 'early_bird'; xp += 20; if(!user.achievements.includes('ach_early_bird')) user.achievements.push('ach_early_bird'); }
    else if (hour === 8 && minute === 0) { status = 'critical_hit'; xp += 50; }
    else if (hour > 8 || (hour === 8 && minute > 15)) { status = 'late'; xp = 5; hpChange = -10; }

    if (isOverdrive) xp *= 2;
    const mods = JSON.parse(db.prepare("SELECT value FROM game_globals WHERE key = 'modifiers'").get()?.value || '{"xpMultiplier":1}');
    xp = Math.floor(xp * getSkillMultiplier(user, 'xp_boost') * mods.xpMultiplier);

    user.current_xp += xp;
    user.current_hp = Math.max(0, user.current_hp + hpChange);
    
    // Level Up Check
    if (user.current_xp >= user.level * 100) {
        user.current_xp -= user.level * 100;
        user.level++;
        user.skill_points++;
        user.total_hp += 10;
    }

    saveUser(user);

    const logId = Date.now().toString();
    db.prepare('INSERT INTO attendance_logs (id, user_id, date, time_in, status, xp_earned) VALUES (?, ?, ?, ?, ?, ?)')
      .run(logId, userId, todayStr, date, status, xp);

    res.json({ id: logId, user_id: userId, date: todayStr, time_in: date, status, xp_earned: xp });
});

app.post('/api/action/clock-out', (req, res) => {
    const { userId, date } = req.body;
    const todayStr = new Date(date).toISOString().split('T')[0];
    db.prepare('UPDATE attendance_logs SET time_out = ? WHERE user_id = ? AND date = ?')
      .run(date, userId, todayStr);
    const log = db.prepare('SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?').get(userId, todayStr);
    res.json(log);
});

app.post('/api/action/work', (req, res) => {
    const { userId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    const weather = db.prepare("SELECT value FROM game_globals WHERE key = 'weather'").get()?.value || 'Sunny';
    let cost = (weather === 'Snowy') ? 5 : 2;

    if (user.current_hp < cost) return res.status(400).json({ error: "Too tired" });

    user.current_hp -= cost;
    
    let gold = Math.floor(Math.random() * 3) + 1;
    let xp = 5;

    const mods = JSON.parse(db.prepare("SELECT value FROM game_globals WHERE key = 'modifiers'").get()?.value || '{"xpMultiplier":1, "goldMultiplier":1}');
    gold = Math.floor(gold * getSkillMultiplier(user, 'gold_boost') * mods.goldMultiplier);
    xp = Math.floor(xp * getSkillMultiplier(user, 'xp_boost') * mods.xpMultiplier);

    user.current_gold += gold;
    user.current_xp += xp;

    // Level Up Check
    if (user.current_xp >= user.level * 100) {
        user.current_xp -= user.level * 100;
        user.level++;
        user.skill_points++;
        user.total_hp += 10;
    }

    damageBoss(1);
    saveUser(user);
    res.json({ user, earned: `+${gold}G +${xp}XP` });
});

app.post('/api/shop/buy', (req, res) => {
    const { userId, itemId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    if (itemId === 'mystery_box') {
        const today = new Date().toISOString().split('T')[0];
        if (user.last_mystery_box_date === today) return res.status(400).json({error: "Cooldown"});
        if (user.current_gold < 100) return res.status(400).json({error: "Need 100G"});
        
        user.current_gold -= 100;
        const r = Math.random();
        let msg = "";
        if (r < 0.3) { user.current_gold += 200; msg = "Won 200G!"; }
        else if (r < 0.6) { user.current_xp += 100; msg = "Won 100XP!"; }
        else { user.current_hp = user.total_hp; msg = "Full Heal!"; }
        
        user.last_mystery_box_date = today;
        saveUser(user);
        logAction(userId, 'SHOP', `Mystery Box: ${msg}`);
        return res.json({ user, message: msg });
    }

    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return res.status(404).json({error: "Item not found"});

    const cost = Math.floor(item.cost * getSkillMultiplier(user, 'shop_discount'));
    if (user.current_gold < cost) return res.status(400).json({error: "Not enough Gold"});

    user.current_gold -= cost;
    if (item.type === 'consumable') user.current_hp = Math.min(user.total_hp, user.current_hp + (item.effectValue || 0));
    else if (item.type === 'pet') user.pet = { name: 'Doggo', hunger: 50, happiness: 100 };
    else user.inventory.push(itemId);

    saveUser(user);
    logAction(userId, 'SHOP', `Bought ${itemId}`);
    res.json({ user, message: `Bought ${itemId}` });
});

app.post('/api/admin/create-quest', (req, res) => {
    const { title, description, reward_gold, reward_xp, type, durationHours } = req.body;
    const expiresAt = Date.now() + (durationHours * 3600000);
    db.prepare('INSERT INTO active_quests (id, title, description, reward_gold, reward_xp, type, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(Date.now().toString(), title, description, reward_gold, reward_xp, type, expiresAt);
    res.json({ success: true });
});

app.get('/api/admin/pending-quests', (req, res) => {
    const rows = db.prepare(`
        SELECT c.user_id, u.name as user_name, c.quest_id, q.title as quest_title, q.reward_gold, q.reward_xp
        FROM completed_quests c
        JOIN users u ON c.user_id = u.id
        JOIN active_quests q ON c.quest_id = q.id
        WHERE c.status = 'pending'
    `).all();
    res.json(rows);
});

app.post('/api/admin/approve-quest', (req, res) => {
    const { userId, questId } = req.body;
    const qRow = db.prepare('SELECT * FROM active_quests WHERE id = ?').get(questId);
    if (qRow) {
        db.prepare("UPDATE completed_quests SET status = 'approved' WHERE user_id = ? AND quest_id = ?").run(userId, questId);
        db.prepare("UPDATE users SET current_gold = current_gold + ?, current_xp = current_xp + ? WHERE id = ?").run(qRow.reward_gold, qRow.reward_xp, userId);
        damageBoss(50);
        logAction(userId, 'ADMIN', `Approved Quest ${qRow.title}`);
    }
    res.json({ success: true });
});

// Fallback for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
