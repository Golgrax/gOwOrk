
import { User, Quest, AttendanceLog, ShopItem, UserRole, AvatarConfig, BossEvent, Achievement, WeatherType, Skill, TeamStats, GlobalModifiers, AuditLog, QuestSubmission } from '../types';
import { sqliteService } from './sqliteService';

// --- MOCK CONSTANTS (Static Data) ---
const SHOP_ITEMS: ShopItem[] = [
  { id: 'item_cap_red', name: 'Red Cap', type: 'hat', asset_id: 'cap_red', cost: 50, description: 'Classic pizza delivery vibes.' },
  { id: 'item_cap_blue', name: 'Blue Cap', type: 'hat', asset_id: 'cap_blue', cost: 50, description: 'Cool and collected.' },
  { id: 'item_crown', name: 'Golden Crown', type: 'hat', asset_id: 'crown_gold', cost: 500, description: 'For the shift manager.' },
  { id: 'item_shades', name: 'Cool Shades', type: 'eyes', asset_id: 'sunglasses', cost: 100, description: 'Block out the haters.' },
  { id: 'item_monocle', name: 'Monocle', type: 'eyes', asset_id: 'monocle', cost: 250, description: 'Quite fancy.' },
  { id: 'item_apron_green', name: 'Green Apron', type: 'clothing', asset_id: 'apron_green', cost: 0, description: 'Standard issue.' },
  { id: 'item_suit', name: 'Tuxedo', type: 'clothing', asset_id: 'suit_black', cost: 1000, description: 'Dressed to impress.' },
  { id: 'pet_dog', name: 'Office Dog', type: 'pet', asset_id: 'dog_voxel', cost: 500, description: 'Adopts a loyal companion.' },
  { id: 'cons_coffee', name: 'Black Coffee', type: 'consumable', asset_id: 'coffee', cost: 15, description: 'Instantly restore 20 HP.', effectValue: 20 },
  { id: 'cons_donut', name: 'Glazed Donut', type: 'consumable', asset_id: 'donut', cost: 25, description: 'Instantly restore 40 HP.', effectValue: 40 },
  { id: 'cons_energy', name: 'Rocket Fuel', type: 'consumable', asset_id: 'energy_drink', cost: 50, description: 'Restore 100 HP. Max energy!', effectValue: 100 },
];

const SKILL_TREE: Skill[] = [
    { id: 'skill_barista_mastery', name: 'Barista Mastery', description: 'Earn 20% more Gold from serving customers.', cost: 1, effectType: 'gold_boost', effectValue: 0.2, requiredLevel: 2, icon: '☕' },
    { id: 'skill_iron_lungs', name: 'Iron Lungs', description: '+20 Max HP. Work harder, longer.', cost: 1, effectType: 'max_hp_boost', effectValue: 20, requiredLevel: 3, icon: '🫁' },
    { id: 'skill_charisma', name: 'Charisma', description: 'Shop items cost 15% less.', cost: 2, effectType: 'shop_discount', effectValue: 0.15, requiredLevel: 5, icon: '😎' },
    { id: 'skill_fast_learner', name: 'Fast Learner', description: 'Gain 10% more XP from all sources.', cost: 3, effectType: 'xp_boost', effectValue: 0.1, requiredLevel: 8, icon: '🧠' },
];

const ACHIEVEMENT_LIST: Achievement[] = [
  { id: 'ach_early_bird', name: 'Early Bird', description: 'Clock in before 8:00 AM', icon: '🌅' },
  { id: 'ach_streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'ach_rich', name: 'Capitalist', description: 'Hold 1000 Gold', icon: '💎' },
  { id: 'ach_boss_killer', name: 'Boss Slayer', description: 'Deal final blow to a boss', icon: '⚔️' },
  { id: 'ach_hard_worker', name: 'Workaholic', description: 'Manually serve 50 customers', icon: '💪' },
];

const QUEST_TEMPLATES = [
  { title: 'Morning Brew', desc: 'Serve 50 coffees before 10 AM', gold: 25, xp: 10, type: 'Daily' },
  { title: 'Clean Up Crew', desc: 'Ensure the lobby is spotless', gold: 15, xp: 5, type: 'Party' },
  { title: 'RUSH HOUR', desc: 'Survive the lunch rush without errors', gold: 100, xp: 50, type: 'Urgent' },
  { title: 'Restock Milk', desc: 'Check inventory and restock fridge', gold: 20, xp: 10, type: 'Daily' },
  { title: 'Fix Wifi', desc: 'Turn the router off and on again', gold: 50, xp: 20, type: 'Urgent' },
];

const INITIAL_BOSS: BossEvent = {
  name: "The Sunday Rush",
  currentHp: 1000,
  maxHp: 1000,
  isActive: true,
  description: "An endless horde of caffeine-deprived zombies."
};

// Wheel Prizes Configuration
export interface WheelPrize {
    id: string;
    label: string;
    type: 'gold' | 'xp' | 'hp';
    value: number;
    weight: number; // Higher = more likely
    color: string;
}

export const WHEEL_PRIZES: WheelPrize[] = [
    { id: 'p1', label: '50 Gold', type: 'gold', value: 50, weight: 30, color: '#FFD700' }, // Gold
    { id: 'p2', label: '50 XP', type: 'xp', value: 50, weight: 30, color: '#3B82F6' },    // Blue
    { id: 'p3', label: '10 Gold', type: 'gold', value: 10, weight: 10, color: '#EF4444' }, // Red (Bad)
    { id: 'p4', label: 'Full Heal', type: 'hp', value: 100, weight: 10, color: '#10B981' }, // Green
    { id: 'p5', label: '100 Gold', type: 'gold', value: 100, weight: 10, color: '#FFD700' }, // Gold
    { id: 'p6', label: '100 XP', type: 'xp', value: 100, weight: 10, color: '#3B82F6' },    // Blue
    { id: 'p7', label: '10 XP', type: 'xp', value: 10, weight: 10, color: '#EF4444' },    // Red (Bad)
    { id: 'p8', label: 'JACKPOT', type: 'gold', value: 500, weight: 1, color: '#A855F7' },  // Purple
];

class GameService {
  private user: User | null = null;
  private bossEvent: BossEvent = { ...INITIAL_BOSS };
  private weather: WeatherType = 'Sunny';
  private motd: string = "Welcome to gOwOrk! Login to start.";
  private globalModifiers: GlobalModifiers = { xpMultiplier: 1, goldMultiplier: 1 };

  constructor() {
    this.init();
  }

  private async init() {
      await sqliteService.init();
      this.loadGlobals();
  }

  // --- LOGGING HELPER ---
  private logAction(userId: string, type: 'SPIN' | 'SHOP' | 'QUEST' | 'ADMIN' | 'ARCADE' | 'SYSTEM', details: string) {
      sqliteService.run(
          `INSERT INTO audit_logs (id, user_id, action_type, details, timestamp) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), userId, type, details, Date.now()]
      );
  }

  async getAuditLogs(): Promise<AuditLog[]> {
      const rows = sqliteService.getAllObjects(`
          SELECT a.*, u.username as user_name 
          FROM audit_logs a 
          LEFT JOIN users u ON a.user_id = u.id 
          ORDER BY timestamp DESC LIMIT 100
      `);
      return rows.map(r => ({
          id: r.id,
          user_id: r.user_id,
          user_name: r.user_name || 'Unknown',
          action_type: r.action_type,
          details: r.details,
          timestamp: r.timestamp
      }));
  }

  // --- AUTHENTICATION (SQLITE) ---

  async hashPassword(password: string): Promise<string> {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async login(username: string, password?: string): Promise<User> {
      await sqliteService.init();
      
      const row = sqliteService.getAsObject(`SELECT * FROM users WHERE username = ?`, [username]);
      
      if (!row) throw new Error("User not found. Please Register.");
      if (row.is_banned) throw new Error("ACCOUNT SUSPENDED. Contact Admin.");

      // Check Password
      if (password) {
          const hash = await this.hashPassword(password);
          if (row.password_hash !== hash) throw new Error("Invalid Password");
      }

      // SELF-HEALING: If 'admin' user is not manager, fix it.
      if (username.toLowerCase() === 'admin' && row.role !== 'manager') {
          sqliteService.run(`UPDATE users SET role = 'manager' WHERE id = ?`, [row.id]);
          row.role = 'manager';
      }

      this.user = this.mapRowToUser(row);
      return this.user!;
  }

  async register(username: string, password?: string): Promise<User> {
      await sqliteService.init();
      
      const existing = sqliteService.getAsObject(`SELECT id FROM users WHERE username = ?`, [username]);
      if (existing) throw new Error("Username already taken.");

      const passwordHash = password ? await this.hashPassword(password) : '';
      
      // Auto-assign manager role for "admin" username
      const role: UserRole = username.toLowerCase() === 'admin' ? 'manager' : 'employee';

      const newUser: User = {
          id: crypto.randomUUID(),
          username,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          role: role, 
          avatar_json: { hat: 'cap_red', eyes: 'normal', mouth: 'smile', clothing: 'apron_green' },
          level: 1,
          current_xp: 0,
          current_gold: 100,
          current_hp: 100,
          total_hp: 100,
          inventory: ['item_cap_red', 'item_apron_green'],
          streak: 0,
          last_login_date: '',
          achievements: [],
          last_spin_date: '',
          skill_points: 0,
          unlocked_skills: [],
          kudos_received: 0,
          last_mystery_box_date: '',
          last_arcade_play_time: 0,
          isBanned: false
      };

      sqliteService.run(
          `INSERT INTO users (id, username, password_hash, name, role, level, current_xp, current_gold, current_hp, total_hp, streak, last_login_date, skill_points, kudos_received, is_banned, avatar_json, inventory, achievements, unlocked_skills, pet_json) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              newUser.id, newUser.username, passwordHash, newUser.name, newUser.role, newUser.level, newUser.current_xp, newUser.current_gold, newUser.current_hp, newUser.total_hp, newUser.streak, newUser.last_login_date, newUser.skill_points, newUser.kudos_received, newUser.isBanned ? 1 : 0,
              JSON.stringify(newUser.avatar_json), JSON.stringify(newUser.inventory), JSON.stringify(newUser.achievements), JSON.stringify(newUser.unlocked_skills), JSON.stringify(newUser.pet || null)
          ]
      );
      
      this.logAction(newUser.id, 'SYSTEM', 'User registered');

      this.user = newUser;
      return newUser;
  }

  logout() {
    this.user = null;
  }

  async getUserProfile(): Promise<User | null> {
    if (!this.user) return null;
    // Refresh from DB
    const row = sqliteService.getAsObject(`SELECT * FROM users WHERE id = ?`, [this.user.id]);
    if (row) {
        this.user = this.mapRowToUser(row);
        return { ...this.user };
    }
    return null;
  }

  // --- DATA MAPPING ---

  private mapRowToUser(row: any): User {
      return {
          id: row.id,
          username: row.username,
          name: row.name,
          role: row.role as UserRole,
          level: row.level,
          current_xp: row.current_xp,
          current_gold: row.current_gold,
          current_hp: row.current_hp,
          total_hp: row.total_hp,
          streak: row.streak,
          last_login_date: row.last_login_date,
          last_spin_date: row.last_spin_date,
          last_mystery_box_date: row.last_mystery_box_date,
          last_arcade_play_time: row.last_arcade_play_time,
          skill_points: row.skill_points,
          kudos_received: row.kudos_received,
          isBanned: !!row.is_banned,
          avatar_json: JSON.parse(row.avatar_json || '{}'),
          inventory: JSON.parse(row.inventory || '[]'),
          achievements: JSON.parse(row.achievements || '[]'),
          unlocked_skills: JSON.parse(row.unlocked_skills || '[]'),
          pet: row.pet_json ? JSON.parse(row.pet_json) : undefined
      };
  }

  private saveUserToDb() {
      if (!this.user) return;
      const u = this.user;
      sqliteService.run(
          `UPDATE users SET 
            current_xp = ?, current_gold = ?, current_hp = ?, total_hp = ?, level = ?, streak = ?, 
            last_login_date = ?, last_spin_date = ?, last_mystery_box_date = ?, last_arcade_play_time = ?,
            skill_points = ?, kudos_received = ?, is_banned = ?, avatar_json = ?, inventory = ?,
            achievements = ?, unlocked_skills = ?, pet_json = ?
           WHERE id = ?`,
          [
              u.current_xp, u.current_gold, u.current_hp, u.total_hp, u.level, u.streak,
              u.last_login_date, u.last_spin_date, u.last_mystery_box_date, u.last_arcade_play_time,
              u.skill_points, u.kudos_received, u.isBanned ? 1 : 0,
              JSON.stringify(u.avatar_json), JSON.stringify(u.inventory), JSON.stringify(u.achievements), JSON.stringify(u.unlocked_skills), JSON.stringify(u.pet || null),
              u.id
          ]
      );
  }

  // --- QUESTS (SQLITE) ---

  async getQuests(): Promise<{ active: Quest[], userStatus: Record<string, string>, nextRefresh: number }> {
      await sqliteService.init();
      
      const now = Date.now();
      
      // Cleanup expired
      sqliteService.run(`DELETE FROM active_quests WHERE expires_at < ?`, [now]);

      // Check if we need to generate new quests
      const count = sqliteService.getAsObject(`SELECT COUNT(*) as c FROM active_quests`)?.c || 0;
      
      if (count < 3) {
         for(let i=0; i<3; i++) {
            const t = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
            const qId = `q_${now}_${i}`;
            sqliteService.run(
                `INSERT INTO active_quests (id, title, description, reward_gold, reward_xp, type, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [qId, t.title, t.desc, t.gold, t.xp, t.type, now + (12 * 60 * 60 * 1000)]
            );
         }
      }

      const activeRows = sqliteService.getAllObjects(`SELECT * FROM active_quests`);
      const activeQuests: Quest[] = activeRows.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          reward_gold: r.reward_gold,
          reward_xp: r.reward_xp,
          type: r.type,
          expiresAt: r.expires_at
      }));

      const userStatus: Record<string, string> = {};
      if (this.user) {
          const compRows = sqliteService.getAllObjects(`SELECT quest_id, status FROM completed_quests WHERE user_id = ?`, [this.user.id]);
          compRows.forEach(r => {
             userStatus[r.quest_id] = r.status || 'approved'; // Default approved for old schema
          });
      }

      // We just use a static refresh time for UI since DB handles dynamic generation
      return { active: activeQuests, userStatus, nextRefresh: now + 3600000 };
  }

  async createQuest(quest: Omit<Quest, 'id' | 'expiresAt'>, durationHours: number) {
      const expiresAt = Date.now() + (durationHours * 3600000);
      sqliteService.run(
          `INSERT INTO active_quests (id, title, description, reward_gold, reward_xp, type, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [Date.now().toString(), quest.title, quest.description, quest.reward_gold, quest.reward_xp, quest.type, expiresAt]
      );
      if (this.user) this.logAction(this.user.id, 'ADMIN', `Created quest: ${quest.title}`);
  }

  // REPLACED completeQuest with submitQuest
  async submitQuest(questId: string): Promise<{ user: User, status: string }> {
      if (!this.user) throw new Error("Not logged in");
      
      const qRow = sqliteService.getAsObject(`SELECT * FROM active_quests WHERE id = ?`, [questId]);
      if (!qRow) throw new Error("Quest not found or expired");

      // Mark as pending
      sqliteService.run(`INSERT OR REPLACE INTO completed_quests (user_id, quest_id, status) VALUES (?, ?, 'pending')`, [this.user.id, questId]);

      this.logAction(this.user.id, 'QUEST', `Submitted Quest: ${qRow.title} (Pending)`);

      return { user: this.user, status: 'pending' };
  }

  // --- MANAGER APPROVALS ---

  async getPendingSubmissions(): Promise<QuestSubmission[]> {
     const rows = sqliteService.getAllObjects(`
         SELECT c.user_id, u.name as user_name, c.quest_id, q.title as quest_title, q.reward_gold, q.reward_xp
         FROM completed_quests c
         JOIN users u ON c.user_id = u.id
         JOIN active_quests q ON c.quest_id = q.id
         WHERE c.status = 'pending'
     `);
     return rows.map(r => ({
         user_id: r.user_id,
         user_name: r.user_name,
         quest_id: r.quest_id,
         quest_title: r.quest_title,
         reward_gold: r.reward_gold,
         reward_xp: r.reward_xp,
         status: 'pending'
     }));
  }

  async approveQuest(userId: string, questId: string) {
      const qRow = sqliteService.getAsObject(`SELECT * FROM active_quests WHERE id = ?`, [questId]);
      if (!qRow) throw new Error("Quest not found");

      // Mark approved
      sqliteService.run(`UPDATE completed_quests SET status = 'approved' WHERE user_id = ? AND quest_id = ?`, [userId, questId]);

      // Grant Rewards directly to the target user
      sqliteService.run(
          `UPDATE users SET current_gold = current_gold + ?, current_xp = current_xp + ? WHERE id = ?`,
          [qRow.reward_gold, qRow.reward_xp, userId]
      );

      this.damageBoss(50);
      
      if(this.user) this.logAction(this.user.id, 'ADMIN', `Approved Quest '${qRow.title}' for user ${userId}`);
  }

  async rejectQuest(userId: string, questId: string) {
      // Deleting the row allows them to try again
      sqliteService.run(`DELETE FROM completed_quests WHERE user_id = ? AND quest_id = ?`, [userId, questId]);
      if(this.user) this.logAction(this.user.id, 'ADMIN', `Rejected Quest for user ${userId}`);
  }

  // --- ATTENDANCE (SQLITE) ---

  async getTodayLog(dateOverride?: Date): Promise<AttendanceLog | undefined> {
      if (!this.user) return undefined;
      const d = dateOverride || new Date();
      const todayStr = d.toISOString().split('T')[0];
      const row = sqliteService.getAsObject(`SELECT * FROM attendance_logs WHERE user_id = ? AND date = ?`, [this.user.id, todayStr]);
      
      if (row) return row as AttendanceLog;
      return undefined;
  }

  async clockIn(date: Date, isOverdrive: boolean): Promise<AttendanceLog> {
      if (!this.user) throw new Error("Not logged in");
      const todayStr = date.toISOString().split('T')[0];
      
      // Check Existing
      const existing = await this.getTodayLog(date);
      if (existing) return existing;

      // Logic
      const hour = date.getHours();
      const minute = date.getMinutes();
      
      // Streak Update logic could go here, but handled simply:
      if (this.user.last_login_date !== todayStr) {
          const lastLogin = new Date(this.user.last_login_date || 0);
          const diffDays = Math.ceil(Math.abs(date.getTime() - lastLogin.getTime()) / (86400000));
          if (diffDays === 1) this.user.streak++;
          else this.user.streak = 1;
          this.user.last_login_date = todayStr;
      }

      let status = 'ontime';
      let xp = 10 + (this.user.streak * 5);
      let hpChange = 0;

      if (hour === 7 && minute >= 45) { status = 'early_bird'; xp += 20; this.unlockAchievement('ach_early_bird'); }
      else if (hour === 8 && minute === 0) { status = 'critical_hit'; xp += 50; }
      else if (hour > 8 || (hour === 8 && minute > 15)) { status = 'late'; xp = 5; hpChange = -10; }

      // Modifiers
      if (isOverdrive) xp *= 2;
      xp = Math.floor(xp * this.getSkillMultiplier('xp_boost') * this.globalModifiers.xpMultiplier);

      this.user.current_xp += xp;
      this.user.current_hp = Math.max(0, this.user.current_hp + hpChange);
      this.checkLevelUp();
      this.saveUserToDb();

      const logId = Date.now().toString();
      sqliteService.run(
          `INSERT INTO attendance_logs (id, user_id, date, time_in, status, xp_earned) VALUES (?, ?, ?, ?, ?, ?)`,
          [logId, this.user.id, todayStr, date.toISOString(), status, xp]
      );

      return { id: logId, user_id: this.user.id, date: todayStr, time_in: date.toISOString(), status: status as any, xp_earned: xp };
  }

  async clockOut(date: Date): Promise<AttendanceLog> {
      if (!this.user) throw new Error("Not logged in");
      const todayStr = date.toISOString().split('T')[0];
      sqliteService.run(
          `UPDATE attendance_logs SET time_out = ? WHERE user_id = ? AND date = ?`,
          [date.toISOString(), this.user.id, todayStr]
      );
      return this.getTodayLog(date) as any;
  }

  // --- GAMEPLAY HELPERS ---

  private getSkillMultiplier(type: 'gold_boost' | 'xp_boost' | 'shop_discount'): number {
      if (!this.user) return 1;
      let multiplier = 1;
      for (const skillId of this.user.unlocked_skills) {
          const skill = SKILL_TREE.find(s => s.id === skillId);
          if (skill && skill.effectType === type) {
              if (type === 'shop_discount') multiplier -= skill.effectValue;
              else multiplier += skill.effectValue;
          }
      }
      return multiplier;
  }

  async performWorkAction(): Promise<{user: User, earned: string}> {
      if (!this.user) throw new Error("No user");
      
      const log = await this.getTodayLog();
      if (!log || log.time_out) throw new Error("Must be clocked in!");

      let cost = 2;
      if (this.weather === 'Snowy') cost = 5;
      
      if (this.user.current_hp < cost) throw new Error("Too tired!");
      
      this.user.current_hp -= cost;
      let gold = Math.floor(Math.random() * 3) + 1;
      let xp = 5;
      
      gold = Math.floor(gold * this.getSkillMultiplier('gold_boost') * this.globalModifiers.goldMultiplier);
      xp = Math.floor(xp * this.getSkillMultiplier('xp_boost') * this.globalModifiers.xpMultiplier);

      this.user.current_gold += gold;
      this.user.current_xp += xp;
      this.checkLevelUp();
      this.damageBoss(1);
      this.saveUserToDb();

      return { user: this.user, earned: `+${gold}G +${xp}XP` };
  }
  
  async takeBreak(): Promise<{user: User, recovered: number}> {
      if (!this.user) throw new Error("No user");
      const oldHp = this.user.current_hp;
      this.user.current_hp = Math.min(this.user.total_hp, this.user.current_hp + 15);
      this.saveUserToDb();
      return { user: this.user, recovered: this.user.current_hp - oldHp };
  }

  // --- SHOP & ITEMS ---
  
  async buyItem(itemId: string): Promise<{ user: User, message: string }> {
      if (!this.user) throw new Error("User not found");
      if (itemId === 'mystery_box') return this.buyMysteryBox();
      
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) throw new Error("Item Not Found");

      const cost = Math.floor(item.cost * this.getSkillMultiplier('shop_discount'));
      if (this.user.current_gold < cost) throw new Error("Not enough Gold");

      if (item.type !== 'consumable' && item.type !== 'pet' && this.user.inventory.includes(itemId)) {
          throw new Error("Already Owned");
      }

      this.user.current_gold -= cost;
      if (item.type === 'consumable') {
          this.user.current_hp = Math.min(this.user.total_hp, this.user.current_hp + (item.effectValue || 0));
      } else if (item.type === 'pet') {
          this.user.pet = { name: 'Doggo', hunger: 50, happiness: 100 };
      } else {
          this.user.inventory.push(itemId);
      }
      this.saveUserToDb();
      this.logAction(this.user.id, 'SHOP', `Bought ${item.name} for ${cost}G`);
      return { user: this.user, message: `Bought ${item.name}` };
  }

  async buyMysteryBox(): Promise<{ user: User, message: string }> {
      if (!this.user) throw new Error("User not found");
      const today = new Date().toISOString().split('T')[0];
      if (this.user.last_mystery_box_date === today) throw new Error("Cooldown active");
      if (this.user.current_gold < 100) throw new Error("Need 100G");

      this.user.current_gold -= 100;
      const r = Math.random();
      let msg = "";
      if (r < 0.3) { this.user.current_gold += 200; msg = "Won 200G!"; }
      else if (r < 0.6) { this.user.current_xp += 100; msg = "Won 100XP!"; }
      else { this.user.current_hp = this.user.total_hp; msg = "Full Heal!"; }

      this.user.last_mystery_box_date = today;
      this.checkLevelUp();
      this.saveUserToDb();
      this.logAction(this.user.id, 'SHOP', `Mystery Box: ${msg}`);
      return { user: this.user, message: msg };
  }

  async equipItem(type: keyof AvatarConfig, assetId: string) {
      if (!this.user) return;
      this.user.avatar_json = { ...this.user.avatar_json, [type]: assetId };
      this.saveUserToDb();
      return this.user;
  }
  
  // --- ADMIN / TEAM ---

  async getLeaderboard() {
      // Direct SQL
      const rows = sqliteService.getAllObjects(`SELECT * FROM users ORDER BY current_xp DESC`);
      return rows.map(this.mapRowToUser);
  }

  async getTeamData(): Promise<TeamStats> {
      const allUsers = await this.getLeaderboard();
      // Calculate Active Shifts
      const todayStr = new Date().toISOString().split('T')[0];
      const activeLogs = sqliteService.getAllObjects(`SELECT user_id FROM attendance_logs WHERE date = ? AND time_out IS NULL`, [todayStr]);
      const activeIds = activeLogs.map(r => r.user_id);

      return {
          totalUsers: allUsers.length,
          activeShifts: activeIds.length,
          totalGoldInCirculation: allUsers.reduce((s, u) => s + u.current_gold, 0),
          totalXpGenerated: allUsers.reduce((s, u) => s + u.current_xp, 0),
          avgHappiness: Math.floor(allUsers.reduce((s, u) => s + u.current_hp, 0) / allUsers.length) || 0,
          users: allUsers,
          topEarner: [...allUsers].sort((a,b) => b.current_gold - a.current_gold)[0],
          highestLevel: [...allUsers].sort((a,b) => b.level - a.level)[0],
          mostKudos: [...allUsers].sort((a,b) => b.kudos_received - a.kudos_received)[0],
      };
  }

  // --- MISC ---

  spinWheel() {
      if (!this.user) throw new Error("No User");
      
      // Weighted Random Selection
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

      if (selectedPrize.type === 'gold') this.user.current_gold += selectedPrize.value;
      if (selectedPrize.type === 'xp') this.user.current_xp += selectedPrize.value;
      if (selectedPrize.type === 'hp') this.user.current_hp = this.user.total_hp; // Full heal usually
      
      this.user.last_spin_date = new Date().toISOString().split('T')[0];
      this.checkLevelUp();
      this.saveUserToDb();
      
      this.logAction(this.user.id, 'SPIN', `Wheel Prize: ${selectedPrize.label}`);

      return { 
          reward: `+${selectedPrize.value} ${selectedPrize.type === 'hp' ? 'HP' : (selectedPrize.type === 'gold' ? 'Gold' : 'XP')}`, 
          value: selectedPrize.value, 
          type: selectedPrize.type,
          prizeId: selectedPrize.id 
      };
  }

  canSpin() {
      if (!this.user) return false;
      return this.user.last_spin_date !== new Date().toISOString().split('T')[0];
  }

  // --- GLOBALS STORAGE ---
  private loadGlobals() {
      const g = sqliteService.getAsObject(`SELECT value FROM game_globals WHERE key = 'modifiers'`);
      if (g) this.globalModifiers = JSON.parse(g.value);
      
      const m = sqliteService.getAsObject(`SELECT value FROM game_globals WHERE key = 'motd'`);
      if (m) this.motd = m.value;

      const w = sqliteService.getAsObject(`SELECT value FROM game_globals WHERE key = 'weather'`);
      if (w) this.weather = w.value as any;
      
      const b = sqliteService.getAsObject(`SELECT value FROM game_globals WHERE key = 'boss'`);
      if (b) this.bossEvent = JSON.parse(b.value);
  }

  private saveGlobals() {
      sqliteService.run(`INSERT OR REPLACE INTO game_globals (key, value) VALUES ('modifiers', ?)`, [JSON.stringify(this.globalModifiers)]);
      sqliteService.run(`INSERT OR REPLACE INTO game_globals (key, value) VALUES ('motd', ?)`, [this.motd]);
      sqliteService.run(`INSERT OR REPLACE INTO game_globals (key, value) VALUES ('weather', ?)`, [this.weather]);
      sqliteService.run(`INSERT OR REPLACE INTO game_globals (key, value) VALUES ('boss', ?)`, [JSON.stringify(this.bossEvent)]);
  }

  // --- SETTERS ---
  setWeather(w: WeatherType) { this.weather = w; this.saveGlobals(); }
  setMotd(m: string) { this.motd = m; this.saveGlobals(); }
  setGlobalEvent(type: string) {
      if (type === 'double_xp') this.globalModifiers = { xpMultiplier: 2, goldMultiplier: 1, activeEventName: "Double XP" };
      else if (type === 'happy_hour') this.globalModifiers = { xpMultiplier: 1, goldMultiplier: 2, activeEventName: "Happy Hour" };
      else this.globalModifiers = { xpMultiplier: 1, goldMultiplier: 1 };
      this.saveGlobals();
      return this.globalModifiers;
  }
  
  // Getters
  getShopItems() { return SHOP_ITEMS; }
  getAllAchievements() { return ACHIEVEMENT_LIST; }
  getSkills() { return SKILL_TREE; }
  getBossEvent() { return this.bossEvent; }
  getWeather() { return this.weather; }
  getMotd() { return this.motd; }
  getGlobalModifiers() { return this.globalModifiers; }

  // Utils
  private checkLevelUp() {
      if (!this.user) return;
      if (this.user.current_xp >= this.user.level * 100) {
          this.user.current_xp -= this.user.level * 100;
          this.user.level++;
          this.user.skill_points++;
          this.user.total_hp += 10;
          this.user.current_hp = this.user.total_hp;
      }
  }

  private unlockAchievement(id: string) {
      if (!this.user) return;
      if (!this.user.achievements.includes(id)) this.user.achievements.push(id);
  }

  private damageBoss(amt: number) {
      if (!this.bossEvent.isActive) return;
      this.bossEvent.currentHp = Math.max(0, this.bossEvent.currentHp - amt);
      if (this.bossEvent.currentHp === 0) {
          this.bossEvent.isActive = false;
          // Respawn timer handled in UI interval or next load
      }
      this.saveGlobals();
  }

  // Admin
  async adminPunish(uid: string, type: 'hp'|'gold'|'xp', amt: number) {
      const u = sqliteService.getAsObject(`SELECT * FROM users WHERE id = ?`, [uid]);
      if (!u) return;
      const user = this.mapRowToUser(u);
      if (type === 'hp') user.current_hp = Math.max(0, user.current_hp - amt);
      if (type === 'gold') user.current_gold = Math.max(0, user.current_gold - amt);
      if (type === 'xp') user.current_xp = Math.max(0, user.current_xp - amt);
      
      // Save directly
      // Hacky reuse of saveUserToDb but need to set this.user momentarily or write raw update
      sqliteService.run(
          `UPDATE users SET current_hp=?, current_gold=?, current_xp=? WHERE id=?`, 
          [user.current_hp, user.current_gold, user.current_xp, uid]
      );
      if (this.user) this.logAction(this.user.id, 'ADMIN', `Punished user ${uid}: -${amt} ${type}`);
  }

  async toggleBan(uid: string) {
      const u = sqliteService.getAsObject(`SELECT is_banned FROM users WHERE id=?`, [uid]);
      if (u) {
          const newVal = u.is_banned ? 0 : 1;
          sqliteService.run(`UPDATE users SET is_banned=? WHERE id=?`, [newVal, uid]);
          if (this.user) this.logAction(this.user.id, 'ADMIN', `Toggled ban for user ${uid}`);
      }
  }

  async giveBonus(uid: string, amt: number) {
      sqliteService.run(`UPDATE users SET current_gold = current_gold + ? WHERE id = ?`, [amt, uid]);
      if (this.user && this.user.id === uid) this.user.current_gold += amt;
      if (this.user) this.logAction(this.user.id, 'ADMIN', `Sent ${amt}G bonus to ${uid}`);
  }
  
  async unlockSkill(sid: string): Promise<User> {
      if (!this.user) throw new Error("No User");
      const skill = SKILL_TREE.find(s => s.id === sid);
      if (!skill) throw new Error("Skill Not Found");
      if (this.user.skill_points < skill.cost) throw new Error("Not enough SP");
      
      this.user.skill_points -= skill.cost;
      this.user.unlocked_skills.push(sid);
      if (skill.effectType === 'max_hp_boost') {
          this.user.total_hp += skill.effectValue;
          this.user.current_hp += skill.effectValue;
      }
      this.saveUserToDb();
      return this.user;
  }
  
  async sendKudos(targetId: string): Promise<string> {
      sqliteService.run(`UPDATE users SET kudos_received = kudos_received + 1, current_xp = current_xp + 10 WHERE id = ?`, [targetId]);
      return "Kudos sent!";
  }

  async feedPet() {
     if (!this.user || !this.user.pet) throw new Error("No Pet");
     if (this.user.current_gold < 10) throw new Error("Need 10G");
     this.user.current_gold -= 10;
     this.user.pet.hunger = Math.min(100, this.user.pet.hunger + 20);
     this.saveUserToDb();
     return { user: this.user, msg: "Fed Pet!" };
  }

  async updateUser(uid: string, data: Partial<User>) {
      // Simplistic
      if (data.name) sqliteService.run(`UPDATE users SET name = ? WHERE id = ?`, [data.name, uid]);
      if (data.role) sqliteService.run(`UPDATE users SET role = ? WHERE id = ?`, [data.role, uid]);
  }
  
  async recordArcadePlay() {
      if(this.user) {
          this.user.last_arcade_play_time = Date.now();
          this.saveUserToDb();
          this.logAction(this.user.id, 'ARCADE', 'Played Coffee Rush');
      }
      return this.user!;
  }
  
  async exportAttendanceCSV() {
      const logs = sqliteService.getAllObjects(`SELECT * FROM attendance_logs`);
      const headers = "Log ID,User ID,Date,Time In,Time Out,Status,XP Earned\n";
      const rows = logs.map(l => 
          `${l.id},${l.user_id},${l.date},${l.time_in},${l.time_out || 'Active'},${l.status},${l.xp_earned}`
      ).join("\n");
      return headers + rows;
  }

  resetGameData() {
      localStorage.removeItem('gowork_sqlite_db');
      window.location.reload();
  }
}

export const gameService = new GameService();
