
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

// --- SHARED CONSTANTS ---
const SKILL_TREE = [
    { id: 'skill_barista_mastery', name: 'Barista Mastery', cost: 1, requiredLevel: 2, effectType: 'gold_boost', effectValue: 0.2 },
    { id: 'skill_iron_lungs', name: 'Iron Lungs', cost: 1, requiredLevel: 3, effectType: 'max_hp_boost', effectValue: 20 },
    { id: 'skill_charisma', name: 'Charisma', cost: 2, requiredLevel: 5, effectType: 'shop_discount', effectValue: 0.15 },
    { id: 'skill_fast_learner', name: 'Fast Learner', cost: 3, requiredLevel: 8, effectType: 'xp_boost', effectValue: 0.1 },
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

const WHEEL_PRIZES = [
    { id: 'p1', label: '50 Gold', type: 'gold', value: 50, weight: 30 },
    { id: 'p2', label: '50 XP', type: 'xp', value: 50, weight: 30 },
    { id: 'p3', label: '10 Gold', type: 'gold', value: 10, weight: 10 },
    { id: 'p4', label: 'Full Heal', type: 'hp', value: 100, weight: 10 },
    { id: 'p5', label: '100 Gold', type: 'gold', value: 100, weight: 10 },
    { id: 'p6', label: '100 XP', type: 'xp', value: 100, weight: 10 },
    { id: 'p7', label: '10 XP', type: 'xp', value: 10, weight: 10 },
    { id: 'p8', label: 'JACKPOT', type: 'gold', value: 500, weight: 1 },
];

const INITIAL_BOSS = {
  name: "The Sunday Rush",
  currentHp: 1000,
  maxHp: 1000,
  isActive: true,
  description: "An endless horde of caffeine-deprived zombies."
};

const DEFAULT_QUESTS = [
    {
        baseId: 'daily_attendance',
        title: 'Perfect Attendance',
        description: 'Clock In for your shift today.',
        reward_gold: 50,
        reward_xp: 100,
        type: 'Daily'
    },
    {
        baseId: 'daily_tasks',
        title: 'Busy Bee',
        description: 'Complete 10 work actions.',
        reward_gold: 75,
        reward_xp: 50,
        type: 'Daily'
    }
];

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

function checkLevelUp(user) {
    if (user.current_xp >= user.level * 100) {
        user.current_xp -= user.level * 100;
        user.level++;
        user.skill_points++;
        user.total_hp += 10;
        return true;
    }
    return false;
}

function damageBoss(amt) {
    let boss = JSON.parse(db.prepare("SELECT value FROM game_globals WHERE key = 'boss'").get()?.value || JSON.stringify(INITIAL_BOSS));
    if (boss.isActive) {
        boss.currentHp = Math.max(0, boss.currentHp - amt);
        if (boss.currentHp === 0) boss.isActive = false;
        db.prepare("INSERT OR REPLACE INTO game_globals (key, value) VALUES ('boss', ?)").run(JSON.stringify(boss));
    }
}

function runMaintenance() {
    const now = Date.now();
    
    // 1. Delete Expired Quests
    db.prepare('DELETE FROM active_quests WHERE expires_at < ?').run(now);

    // 2. Ensure Daily Quests exist for today
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    // Set expiration to end of today
    const expiration = new Date(today);
    expiration.setHours(23, 59, 59, 999);
    const expiresAt = expiration.getTime();
    
    for (const q of DEFAULT_QUESTS) {
        const id = `${q.baseId}_${dateStr}`;
        const existing = db.prepare('SELECT id FROM active_quests WHERE id = ?').get(id);
        if (!existing) {
             db.prepare(`
                INSERT INTO active_quests (id, title, description, reward_gold, reward_xp, type, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(id, q.title, q.description, q.reward_gold, q.reward_xp, q.type, expiresAt);
        }
    }
}

// --- ROUTES ---

// Auth
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!row) return res.status(404).json({ error: "User not found" });
    if (row.is_banned) return res.status(403).json({ error: "Banned" });
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
    runMaintenance();
    const userId = req.query.userId;
    const users = db.prepare('SELECT * FROM users ORDER BY current_xp DESC').all().map(mapUser);
    const quests = db.prepare('SELECT * FROM active_quests').all();
    const bossRow = db.prepare("SELECT value FROM game_globals WHERE key = 'boss'").get();
    const boss = bossRow ? JSON.parse(bossRow.value) : INITIAL_BOSS;
    const weatherRow = db.prepare("SELECT value FROM game_globals WHERE key = 'weather'").get();
    const motdRow = db.prepare("SELECT value FROM game_globals WHERE key = 'motd'").get();
    const globalModsRow = db.prepare("SELECT value FROM game_globals WHERE key = 'modifiers'").get();
    
    // Fetch user specific quest status
    let userQuestStatus = {};
    if (userId) {
        const submissions = db.prepare('SELECT quest_id, status FROM completed_quests WHERE user_id = ?').all(userId);
        submissions.forEach(s => userQuestStatus[s.quest_id] = s.status);
    }

    res.json({
        leaderboard: users,
        activeQuests: quests,
        userQuestStatus, // Send this back
        bossEvent: boss,
        weather: weatherRow ? weatherRow.value : 'Sunny',
        motd: motdRow ? motdRow.value : '',
        globalModifiers: globalModsRow ? JSON.parse(globalModsRow.value) : { xpMultiplier: 1, goldMultiplier: 1 }
    });
});

// Actions
app.post('/api/action/clock-in', (req, res) => {
    const { userId, date, isOverdrive } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    const d = new Date(date);
    const todayStr = d.toISOString().split('T')[0];
    
    const existing = db.prepare('SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?').get(userId, todayStr);
    if (existing) return res.json(existing);

    const hour = d.getHours();
    const minute = d.getMinutes();
    
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
    
    checkLevelUp(user);
    saveUser(user);

    const logId = Date.now().toString();
    db.prepare('INSERT INTO attendance_logs (id, user_id, date, time_in, status, xp_earned) VALUES (?, ?, ?, ?, ?, ?)')
      .run(logId, userId, todayStr, date, status, xp);

    logAction(userId, 'SYSTEM', `Clocked In (${status})`);
    res.json({ id: logId, user_id: userId, date: todayStr, time_in: date, status, xp_earned: xp });
});

app.post('/api/action/clock-out', (req, res) => {
    const { userId, date } = req.body;
    const todayStr = new Date(date).toISOString().split('T')[0];
    db.prepare('UPDATE attendance_logs SET time_out = ? WHERE user_id = ? AND date = ?')
      .run(date, userId, todayStr);
    const log = db.prepare('SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?').get(userId, todayStr);
    logAction(userId, 'SYSTEM', 'Clocked Out');
    res.json(log);
});

app.post('/api/action/work', (req, res) => {
    const { userId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    const weather = db.prepare("SELECT value FROM game_globals WHERE key = 'weather'").get()?.value || 'Sunny';
    let cost = (weather === 'Snowy') ? 5 : 2;

    if (user.current_hp < cost) return res.status(400).json({ error: "You are too tired! Take a break." });

    user.current_hp -= cost;
    
    let gold = Math.floor(Math.random() * 3) + 1;
    let xp = 5;

    const mods = JSON.parse(db.prepare("SELECT value FROM game_globals WHERE key = 'modifiers'").get()?.value || '{"xpMultiplier":1, "goldMultiplier":1}');
    gold = Math.floor(gold * getSkillMultiplier(user, 'gold_boost') * mods.goldMultiplier);
    xp = Math.floor(xp * getSkillMultiplier(user, 'xp_boost') * mods.xpMultiplier);

    user.current_gold += gold;
    user.current_xp += xp;

    checkLevelUp(user);
    damageBoss(1);
    saveUser(user);
    // Work is frequent, maybe don't log every click to audit logs to avoid spam, 
    // or log only significant milestones.
    res.json({ user, earned: `+${gold}G +${xp}XP` });
});

app.post('/api/action/submit-quest', (req, res) => {
    const { userId, questId } = req.body;
    const existing = db.prepare('SELECT * FROM completed_quests WHERE user_id = ? AND quest_id = ?').get(userId, questId);
    if (existing) return res.status(400).json({ error: "Already submitted" });

    db.prepare('INSERT INTO completed_quests (user_id, quest_id, status) VALUES (?, ?, ?)')
      .run(userId, questId, 'pending');
    
    const quest = db.prepare('SELECT title FROM active_quests WHERE id = ?').get(questId);
    logAction(userId, 'QUEST', `Submitted: ${quest ? quest.title : questId}`);
    res.json({ success: true });
});

app.post('/api/action/spin', (req, res) => {
    const { userId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    const todayStr = new Date().toISOString().split('T')[0];
    if (user.last_spin_date === todayStr) {
        return res.status(400).json({ error: "You already spun today!" });
    }

    const totalWeight = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let r = Math.random() * totalWeight;
    let selectedPrize = WHEEL_PRIZES[0];

    for (const prize of WHEEL_PRIZES) {
        if (r < prize.weight) {
            selectedPrize = prize;
            break;
        }
        r -= prize.weight;
    }

    if (selectedPrize.type === 'gold') user.current_gold += selectedPrize.value;
    if (selectedPrize.type === 'xp') user.current_xp += selectedPrize.value;
    if (selectedPrize.type === 'hp') user.current_hp = user.total_hp;

    user.last_spin_date = todayStr;
    checkLevelUp(user);
    saveUser(user);
    logAction(userId, 'SPIN', `Won ${selectedPrize.label}`);

    res.json({ 
        user, 
        prize: selectedPrize
    });
});

app.post('/api/action/arcade', (req, res) => {
    const { userId, score } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    // Check Cooldown
    const COOLDOWN_MS = 2 * 60 * 60 * 1000;
    const now = Date.now();
    if (user.last_arcade_play_time && (now - user.last_arcade_play_time < COOLDOWN_MS)) {
        return res.status(400).json({ error: "Arcade is cooling down!" });
    }

    const goldEarned = Math.floor(score / 10);
    const xpEarned = Math.floor(score / 5);

    user.current_gold += goldEarned;
    user.current_xp += xpEarned;
    user.last_arcade_play_time = now;

    checkLevelUp(user);
    saveUser(user);
    logAction(userId, 'ARCADE', `Score: ${score} (+${goldEarned}G)`);

    res.json({ user, goldEarned, xpEarned });
});

app.post('/api/action/equip', (req, res) => {
    const { userId, type, assetId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();

    user.avatar_json[type] = assetId;
    saveUser(user);
    res.json(user);
});

app.post('/api/action/unlock-skill', (req, res) => {
    const { userId, skillId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();
    
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if(!skill) return res.status(400).json({error: "Skill not found"});

    if (user.unlocked_skills.includes(skillId)) return res.status(400).json({error: "Already unlocked"});
    if (user.skill_points < skill.cost) return res.status(400).json({error: "Not enough SP"});
    if (user.level < skill.requiredLevel) return res.status(400).json({error: "Level too low"});

    user.skill_points -= skill.cost;
    user.unlocked_skills.push(skillId);
    
    saveUser(user);
    logAction(userId, 'SKILL', `Unlocked ${skill.name}`);
    res.json(user);
});

app.post('/api/action/feed-pet', (req, res) => {
    const { userId } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();
    if (!user.pet) return res.status(400).json({error: "No pet"});

    if (user.current_gold < 10) return res.status(400).json({error: "Not enough gold"});
    user.current_gold -= 10;
    user.pet.hunger = Math.min(100, user.pet.hunger + 20);
    user.pet.happiness = Math.min(100, user.pet.happiness + 10);

    saveUser(user);
    res.json({ user, msg: "Yum!" });
});

app.post('/api/action/kudos', (req, res) => {
    const { fromId, toId } = req.body;
    const sender = getUser(fromId);
    const receiver = getUser(toId);
    
    if (!sender || !receiver) return res.status(404).send();
    if (fromId === toId) return res.status(400).json({error: "Can't kudos yourself"});

    receiver.kudos_received += 1;
    receiver.current_xp += 10; // Small bonus
    saveUser(receiver);
    
    res.json({ message: "Kudos sent!" });
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

// --- NEW ADMIN ENDPOINTS ---

app.get('/api/admin/audit-logs', (req, res) => {
    const logs = db.prepare(`
        SELECT a.*, u.name as user_name 
        FROM audit_logs a 
        LEFT JOIN users u ON a.user_id = u.id 
        ORDER BY timestamp DESC 
        LIMIT 100
    `).all();
    res.json(logs);
});

app.post('/api/admin/update-user', (req, res) => {
    const { userId, name, role } = req.body;
    // In a real app, verify request comes from an admin
    db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?').run(name, role, userId);
    logAction(userId, 'ADMIN', `Updated profile Role: ${role}`);
    res.json({ success: true });
});

app.post('/api/admin/toggle-ban', (req, res) => {
    const { userId } = req.body;
    const user = getUser(userId);
    if (user) {
        const newStatus = !user.isBanned;
        db.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(newStatus ? 1 : 0, userId);
        logAction(userId, 'ADMIN', `${newStatus ? 'Banned' : 'Unbanned'} user`);
        res.json({ success: true, isBanned: newStatus });
    } else {
        res.status(404).send();
    }
});

app.post('/api/admin/punish', (req, res) => {
    const { userId, type, amount } = req.body;
    const user = getUser(userId);
    if (!user) return res.status(404).send();
    
    if (type === 'hp') user.current_hp = Math.max(0, user.current_hp - amount);
    if (type === 'gold') user.current_gold = Math.max(0, user.current_gold - amount);
    if (type === 'xp') user.current_xp = Math.max(0, user.current_xp - amount);
    
    saveUser(user);
    logAction(userId, 'ADMIN', `Punished: -${amount} ${type}`);
    res.json({ success: true });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
