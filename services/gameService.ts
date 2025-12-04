
import { User, Quest, AttendanceLog, ShopItem, UserRole, AvatarConfig, BossEvent, Achievement, WeatherType, Skill, TeamStats, GlobalModifiers } from '../types';

// --- MOCK DATA ---

const SHOP_ITEMS: ShopItem[] = [
  // Cosmetics
  { id: 'item_cap_red', name: 'Red Cap', type: 'hat', asset_id: 'cap_red', cost: 50, description: 'Classic pizza delivery vibes.' },
  { id: 'item_cap_blue', name: 'Blue Cap', type: 'hat', asset_id: 'cap_blue', cost: 50, description: 'Cool and collected.' },
  { id: 'item_crown', name: 'Golden Crown', type: 'hat', asset_id: 'crown_gold', cost: 500, description: 'For the shift manager.' },
  { id: 'item_shades', name: 'Cool Shades', type: 'eyes', asset_id: 'sunglasses', cost: 100, description: 'Block out the haters.' },
  { id: 'item_monocle', name: 'Monocle', type: 'eyes', asset_id: 'monocle', cost: 250, description: 'Quite fancy.' },
  { id: 'item_apron_green', name: 'Green Apron', type: 'clothing', asset_id: 'apron_green', cost: 0, description: 'Standard issue.' },
  { id: 'item_suit', name: 'Tuxedo', type: 'clothing', asset_id: 'suit_black', cost: 1000, description: 'Dressed to impress.' },
  // Pet
  { id: 'pet_dog', name: 'Office Dog', type: 'pet', asset_id: 'dog_voxel', cost: 500, description: 'Adopts a loyal companion. Grants passive XP bonus when fed.' },
  // Consumables
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
  { title: 'Smile Service', desc: 'Get 5 positive customer reviews', gold: 30, xp: 15, type: 'Party' },
  { title: 'Trash Duty', desc: 'Empty all bins (The glamorous life)', gold: 40, xp: 20, type: 'Daily' },
  { title: 'Inventory Count', desc: 'Count all the beans. Yes, all of them.', gold: 60, xp: 30, type: 'Urgent' },
];

const INITIAL_BOSS: BossEvent = {
  name: "The Sunday Rush",
  currentHp: 1000,
  maxHp: 1000,
  isActive: true,
  description: "An endless horde of caffeine-deprived zombies."
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class GameService {
  private user: User | null = null;
  private logs: AttendanceLog[] = [];
  private quests: Quest[] = [];
  private completedQuestIds: Set<string> = new Set();
  private bossEvent: BossEvent = { ...INITIAL_BOSS };
  private lastQuestRefresh: number = 0;
  private weather: WeatherType = 'Sunny';
  private motd: string = "Welcome to gOwOrk! Don't forget to clock in on time!";
  private globalModifiers: GlobalModifiers = { xpMultiplier: 1, goldMultiplier: 1 };
  
  private mockUsers: User[] = [
      { id: 'u2', username: 'jane_doe', name: 'Jane', role: 'employee', avatar_json: { hat: 'cap_blue', eyes: 'normal', mouth: 'smile', clothing: 'apron_green' }, level: 4, current_xp: 350, current_gold: 120, current_hp: 80, total_hp: 100, inventory: [], streak: 5, last_login_date: '', achievements: [], skill_points: 0, unlocked_skills: [], kudos_received: 12 },
      { id: 'u3', username: 'alex_boss', name: 'Alex', role: 'manager', avatar_json: { hat: 'crown_gold', eyes: 'sunglasses', mouth: 'smile', clothing: 'suit_black' }, level: 12, current_xp: 8000, current_gold: 5000, current_hp: 120, total_hp: 120, inventory: [], streak: 50, last_login_date: '', achievements: [], skill_points: 0, unlocked_skills: [], kudos_received: 45 },
      { id: 'u4', username: 'mike_new', name: 'Mike', role: 'employee', avatar_json: { hat: 'cap_red', eyes: 'monocle', mouth: 'smile', clothing: 'apron_green' }, level: 1, current_xp: 50, current_gold: 10, current_hp: 100, total_hp: 100, inventory: [], streak: 1, last_login_date: '', achievements: [], skill_points: 0, unlocked_skills: [], kudos_received: 0 },
      { id: 'u5', username: 'sarah_pro', name: 'Sarah', role: 'employee', avatar_json: { hat: 'cap_blue', eyes: 'sunglasses', mouth: 'smile', clothing: 'suit_black' }, level: 8, current_xp: 2100, current_gold: 800, current_hp: 45, total_hp: 100, inventory: [], streak: 12, last_login_date: '', achievements: [], skill_points: 0, unlocked_skills: [], kudos_received: 22 },
  ];

  constructor() {
    const storedUser = localStorage.getItem('gowork_user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
    
    // Load persisted mock users database
    const storedUsersDb = localStorage.getItem('gowork_users_db');
    if (storedUsersDb) {
        this.mockUsers = JSON.parse(storedUsersDb);
    }

    const storedBoss = localStorage.getItem('gowork_boss');
    if (storedBoss) {
      this.bossEvent = JSON.parse(storedBoss);
    }

    const storedQuests = localStorage.getItem('gowork_quests');
    if (storedQuests) {
        const data = JSON.parse(storedQuests);
        this.quests = data.quests;
        this.lastQuestRefresh = data.lastRefresh;
    }
    
    const storedLogs = localStorage.getItem('gowork_logs');
    if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
    }

    const storedMotd = localStorage.getItem('gowork_motd');
    if (storedMotd) {
        this.motd = storedMotd;
    }

    const storedMods = localStorage.getItem('gowork_global_modifiers');
    if (storedMods) {
        this.globalModifiers = JSON.parse(storedMods);
    }

    const storedWeather = localStorage.getItem('gowork_weather');
    if (storedWeather) {
        this.weather = storedWeather as WeatherType;
    } else {
        this.weather = 'Sunny'; // Default
    }
  }

  private persist() {
    if (this.user) localStorage.setItem('gowork_user', JSON.stringify(this.user));
    // Persist the full user database
    localStorage.setItem('gowork_users_db', JSON.stringify(this.mockUsers));
    
    localStorage.setItem('gowork_boss', JSON.stringify(this.bossEvent));
    localStorage.setItem('gowork_quests', JSON.stringify({
        quests: this.quests,
        lastRefresh: this.lastQuestRefresh
    }));
    localStorage.setItem('gowork_logs', JSON.stringify(this.logs));
    localStorage.setItem('gowork_motd', this.motd);
    localStorage.setItem('gowork_global_modifiers', JSON.stringify(this.globalModifiers));
    localStorage.setItem('gowork_weather', this.weather);
  }

  // --- QUEST SYSTEM ---

  private generateQuests() {
     const newQuests: Quest[] = [];
     for(let i=0; i<3; i++) {
        const t = QUEST_TEMPLATES[Math.floor(Math.random() * QUEST_TEMPLATES.length)];
        newQuests.push({
            id: `q_${Date.now()}_${i}`,
            title: t.title,
            description: t.desc,
            reward_gold: t.gold,
            reward_xp: t.xp,
            type: t.type as any,
            expiresAt: Date.now() + (12 * 60 * 60 * 1000) 
        });
     }
     this.quests = newQuests;
     this.lastQuestRefresh = Date.now();
     this.completedQuestIds.clear(); 
     this.persist();
  }

  async getQuests(): Promise<{ active: Quest[], completedIds: string[], nextRefresh: number }> {
    await delay(300);
    // Refresh if stale
    if (Date.now() - this.lastQuestRefresh > 43200000) {
        this.generateQuests();
    }
    
    // Filter expired quests
    const now = Date.now();
    this.quests = this.quests.filter(q => q.expiresAt > now);
    
    return {
      active: this.quests,
      completedIds: Array.from(this.completedQuestIds),
      nextRefresh: this.lastQuestRefresh + 43200000
    };
  }

  async createQuest(quest: Omit<Quest, 'id' | 'expiresAt'>, durationHours: number) {
      // Admin Feature
      const newQuest = { 
          ...quest, 
          id: Date.now().toString(),
          expiresAt: Date.now() + (durationHours * 60 * 60 * 1000) 
      };
      this.quests.push(newQuest);
      this.persist();
      return newQuest;
  }

  // --- AUTH ---

  async login(username: string): Promise<User> {
    await delay(500);

    // Check Mock Users First (Simulating Database)
    const existingMock = this.mockUsers.find(u => u.username === username);
    if (existingMock && existingMock.isBanned) {
        throw new Error("ACCOUNT SUSPENDED. Contact Admin.");
    }

    if (!this.user || this.user.username !== username) {
        if (existingMock) {
            this.user = { ...existingMock };
        } else {
            // Create New
            const newUser: User = {
                id: Date.now().toString(),
                username,
                name: username.charAt(0).toUpperCase() + username.slice(1),
                role: username === 'boss' ? 'manager' : 'employee',
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
            this.user = newUser;
            this.mockUsers.push(newUser); // Add new user to "db"
        }
    }
    
    if (this.user?.isBanned) {
        this.user = null;
        throw new Error("ACCOUNT SUSPENDED. Contact Admin.");
    }

    this.persist();
    return this.user!;
  }

  logout() {
    this.user = null;
    localStorage.removeItem('gowork_user');
  }

  async getUserProfile(): Promise<User | null> {
    return this.user ? { ...this.user } : null;
  }

  // --- GAMEPLAY ---
  
  // Helper to check for active shift
  private isShiftActive(todayStr: string): boolean {
      if (!this.user) return false;
      const log = this.logs.find(l => l.user_id === this.user!.id && l.date === todayStr);
      return !!(log && !log.time_out);
  }

  // Helper to get perk multiplier
  private getSkillMultiplier(type: 'gold_boost' | 'xp_boost' | 'shop_discount'): number {
      if (!this.user) return 1;
      let multiplier = 1;
      for (const skillId of this.user.unlocked_skills) {
          const skill = SKILL_TREE.find(s => s.id === skillId);
          if (skill && skill.effectType === type) {
              if (type === 'shop_discount') multiplier -= skill.effectValue; // Discount reduces cost
              else multiplier += skill.effectValue; // Boost increases gain
          }
      }
      return multiplier;
  }

  async getTodayLog(dateOverride?: Date): Promise<AttendanceLog | undefined> {
      if (!this.user) return undefined;
      const d = dateOverride || new Date();
      const todayStr = d.toISOString().split('T')[0];
      return this.logs.find(l => l.user_id === this.user!.id && l.date === todayStr);
  }

  async clockIn(date: Date, isOverdrive: boolean): Promise<AttendanceLog> {
    if (!this.user) throw new Error("Not logged in");
    await delay(500);

    const todayStr = date.toISOString().split('T')[0];
    const existingLog = this.logs.find(l => l.user_id === this.user!.id && l.date === todayStr);
    if (existingLog) return existingLog;

    const hour = date.getHours();
    const minute = date.getMinutes();

    // Streak Logic
    if (this.user.last_login_date !== todayStr) {
        const lastLogin = new Date(this.user.last_login_date || 0);
        const diffTime = Math.abs(date.getTime() - lastLogin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            this.user.streak += 1;
        } else if (diffDays > 1) {
            this.user.streak = 1; 
        } else {
            this.user.streak = 1;
        }
        this.user.last_login_date = todayStr;
    }

    let status: AttendanceLog['status'] = 'ontime';
    let xpChange = 10 + (this.user.streak * 5); 
    let hpChange = 0;

    if (hour === 7 && minute >= 45) {
      status = 'early_bird';
      xpChange += 20;
      this.unlockAchievement('ach_early_bird');
    } else if (hour === 8 && minute === 0) {
      status = 'critical_hit';
      xpChange += 50;
    } else if (hour > 8 || (hour === 8 && minute > 15)) {
      status = 'late';
      xpChange = 5;
      hpChange = -10;
    }

    if (isOverdrive) xpChange *= 2;
    if (this.weather === 'Rainy') xpChange = Math.floor(xpChange * 1.1);
    
    // Apply Skill Multiplier
    xpChange = Math.floor(xpChange * this.getSkillMultiplier('xp_boost'));
    
    // Apply Global Multiplier
    xpChange = Math.floor(xpChange * this.globalModifiers.xpMultiplier);

    this.user.current_xp += xpChange;
    this.user.current_hp = Math.max(0, this.user.current_hp + hpChange);
    
    this.damageBoss(10);
    this.checkLevelUp();
    this.checkAchievements();
    this.syncUserToDb(); // Save progress to DB

    const newLog: AttendanceLog = {
      id: Date.now().toString(),
      user_id: this.user.id,
      date: todayStr,
      time_in: date.toISOString(),
      status,
      xp_earned: xpChange
    };

    this.logs.push(newLog);
    this.persist();
    return newLog;
  }

  async clockOut(date: Date): Promise<AttendanceLog> {
      if (!this.user) throw new Error("Not logged in");
      await delay(500);

      const todayStr = date.toISOString().split('T')[0];
      const logIndex = this.logs.findIndex(l => l.user_id === this.user!.id && l.date === todayStr);

      if (logIndex === -1) throw new Error("No active shift found");
      
      this.logs[logIndex].time_out = date.toISOString();
      this.persist();
      return this.logs[logIndex];
  }

  async performWorkAction(): Promise<{user: User, earned: string}> {
      if (!this.user) throw new Error("No user");
      
      const todayStr = new Date().toISOString().split('T')[0];
      if (!this.isShiftActive(todayStr)) throw new Error("You must be clocked in to work!");

      let cost = 2;
      if (this.weather === 'Snowy') cost = 5;
      if (this.weather === 'Heatwave') cost = 4;

      if (this.user.current_hp < cost) throw new Error("Too tired!");

      this.user.current_hp -= cost;
      
      let goldEarned = Math.floor(Math.random() * 3) + 1;
      let xpEarned = 5;

      // Skills
      goldEarned = Math.floor(goldEarned * this.getSkillMultiplier('gold_boost'));
      xpEarned = Math.floor(xpEarned * this.getSkillMultiplier('xp_boost'));

      // Global Multipliers
      goldEarned = Math.floor(goldEarned * this.globalModifiers.goldMultiplier);
      xpEarned = Math.floor(xpEarned * this.globalModifiers.xpMultiplier);

      // Pet Bonus (if owned and fed)
      if (this.user.pet) {
          if (this.user.pet.hunger > 20) {
              xpEarned += 2; // Passive bonus for happy dog
          }
          // Decay Pet Hunger
          this.user.pet.hunger = Math.max(0, this.user.pet.hunger - 1);
      }

      this.user.current_gold += goldEarned;
      this.user.current_xp += xpEarned;

      this.damageBoss(1);
      this.checkLevelUp();
      this.syncUserToDb();
      this.persist();
      
      return { user: {...this.user}, earned: `+${goldEarned}G +${xpEarned}XP` };
  }

  async takeBreak(): Promise<{user: User, recovered: number}> {
      if (!this.user) throw new Error("No user");

      const todayStr = new Date().toISOString().split('T')[0];
      if (!this.isShiftActive(todayStr)) throw new Error("You must be clocked in to take a break!");

      const recover = 15;
      const oldHp = this.user.current_hp;
      this.user.current_hp = Math.min(this.user.total_hp, this.user.current_hp + recover);
      this.syncUserToDb();
      this.persist();
      return { user: {...this.user}, recovered: this.user.current_hp - oldHp };
  }

  async completeQuest(questId: string): Promise<{ user: User, reward: number }> {
    if (!this.user) throw new Error("Not logged in");
    await delay(400);
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (!this.isShiftActive(todayStr)) throw new Error("Clock in to complete quests!");
    
    const quest = this.quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found");

    if (Date.now() > quest.expiresAt) throw new Error("Quest has expired!");

    this.completedQuestIds.add(questId);
    
    let goldReward = Math.floor(quest.reward_gold * this.getSkillMultiplier('gold_boost'));
    let xpReward = Math.floor(quest.reward_xp * this.getSkillMultiplier('xp_boost'));

    // Global Multipliers
    goldReward = Math.floor(goldReward * this.globalModifiers.goldMultiplier);
    xpReward = Math.floor(xpReward * this.globalModifiers.xpMultiplier);

    this.user.current_gold += goldReward;
    this.user.current_xp += xpReward;
    
    this.damageBoss(50);
    this.checkLevelUp();
    this.checkAchievements();
    this.syncUserToDb();

    this.persist();
    return { user: { ...this.user }, reward: goldReward };
  }

  // --- BOSS LOGIC ---
  private damageBoss(amount: number) {
      if (!this.bossEvent.isActive) return;
      this.bossEvent.currentHp = Math.max(0, this.bossEvent.currentHp - amount);
      if (this.bossEvent.currentHp === 0) {
          this.bossEvent.isActive = false;
          if (this.user) {
              this.user.current_gold += 500; 
              this.unlockAchievement('ach_boss_killer');
              this.syncUserToDb();
          }
          setTimeout(() => {
              this.bossEvent.currentHp = this.bossEvent.maxHp;
              this.bossEvent.isActive = true;
              this.persist();
          }, 10000);
      }
      this.persist();
  }

  getBossEvent() {
      return this.bossEvent;
  }

  async buyItem(itemId: string): Promise<{ user: User, message: string }> {
      if (!this.user) throw new Error("User not found");
      
      if (itemId === 'mystery_box') {
          return this.buyMysteryBox();
      }

      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) throw new Error("Item not found");

      const finalCost = Math.floor(item.cost * this.getSkillMultiplier('shop_discount'));

      if (this.user.current_gold >= finalCost) {
          if (item.type !== 'consumable' && item.type !== 'pet' && this.user.inventory.includes(itemId)) {
             throw new Error("Already owned");
          }

          if (item.type === 'pet' && this.user.pet) {
              throw new Error("You already have a pet!");
          }

          this.user.current_gold -= finalCost;
          
          if (item.type === 'consumable') {
              const heal = item.effectValue || 0;
              this.user.current_hp = Math.min(this.user.total_hp, this.user.current_hp + heal);
          } else if (item.type === 'pet') {
              this.user.pet = {
                  name: 'Doggo',
                  hunger: 50,
                  happiness: 100
              };
          } else {
              this.user.inventory.push(itemId);
          }
          this.syncUserToDb();
          this.persist();
          return { user: this.user, message: `Bought ${item.name} for ${finalCost}G` };
      }
      throw new Error("Not enough Gold!");
  }

  async buyMysteryBox(): Promise<{ user: User, message: string }> {
      if (!this.user) throw new Error("User not found");
      const today = new Date().toISOString().split('T')[0];
      
      if (this.user.last_mystery_box_date === today) {
        throw new Error("Come back tomorrow!");
      }

      const cost = 100;
      if (this.user.current_gold < cost) throw new Error("Need 100G for Mystery Box");

      this.user.current_gold -= cost;
      const rand = Math.random();
      let msg = "";

      if (rand < 0.3) {
          // Gold Reward
          const amount = Math.floor(Math.random() * 200) + 50;
          this.user.current_gold += amount;
          msg = `Mystery Box: Found ${amount} Gold!`;
      } else if (rand < 0.6) {
          // XP Reward
          const amount = Math.floor(Math.random() * 100) + 50;
          this.user.current_xp += amount;
          this.checkLevelUp();
          msg = `Mystery Box: Learned something new! +${amount} XP`;
      } else if (rand < 0.8) {
          // HP Reward
          this.user.current_hp = this.user.total_hp;
          msg = `Mystery Box: Full Health Restore!`;
      } else {
          // Rare Item Check
          const jackpot = 500;
          this.user.current_gold += jackpot;
          msg = `JACKPOT! Found a Rare Gem worth ${jackpot} Gold!`;
      }
      
      this.user.last_mystery_box_date = today;
      this.syncUserToDb();
      this.persist();
      return { user: this.user, message: msg };
  }

  async recordArcadePlay(): Promise<User> {
    if (!this.user) throw new Error("User not found");
    this.user.last_arcade_play_time = Date.now();
    this.syncUserToDb();
    this.persist();
    return this.user;
  }

  async equipItem(type: keyof AvatarConfig, assetId: string) {
      if (!this.user) return;
      this.user.avatar_json = {
          ...this.user.avatar_json,
          [type]: assetId
      };
      this.syncUserToDb();
      this.persist();
      return this.user;
  }

  spinWheel() {
      if (!this.user) throw new Error("No user");

      const todayStr = new Date().toISOString().split('T')[0];
      if (!this.isShiftActive(todayStr)) throw new Error("Clock in to spin!");
      
      const rewards = [
          { type: 'gold', value: 50, label: '50 Gold' },
          { type: 'gold', value: 100, label: '100 Gold' },
          { type: 'xp', value: 50, label: '50 XP' },
          { type: 'hp', value: 100, label: 'Full HP' },
          { type: 'gold', value: 10, label: '10 Gold' }
      ];

      const outcome = rewards[Math.floor(Math.random() * rewards.length)];
      
      if (outcome.type === 'gold') this.user.current_gold += outcome.value;
      if (outcome.type === 'xp') {
          this.user.current_xp += outcome.value;
          this.checkLevelUp();
      }
      if (outcome.type === 'hp') this.user.current_hp = this.user.total_hp;

      this.user.last_spin_date = new Date().toISOString().split('T')[0];
      this.syncUserToDb();
      this.persist();

      return { reward: outcome.label, value: outcome.value, type: outcome.type as any };
  }

  canSpin(): boolean {
      if (!this.user) return false;
      const today = new Date().toISOString().split('T')[0];
      return this.user.last_spin_date !== today;
  }

  getShopItems() { return SHOP_ITEMS; }
  getAllAchievements() { return ACHIEVEMENT_LIST; }
  getSkills() { return SKILL_TREE; }

  async getLeaderboard() {
      // Return fresh copy of DB
      return [...this.mockUsers].sort((a, b) => b.current_xp - a.current_xp);
  }

  async getTeamData(): Promise<TeamStats> {
      // Ensure we are working with the latest persisted data
      const allUsers = [...this.mockUsers];
      
      if (this.user) {
          // Ensure current user session is synced to list if recently updated
          const exists = allUsers.findIndex(u => u.id === this.user!.id);
          if (exists >= 0) allUsers[exists] = this.user;
          else allUsers.push(this.user);
      }

      // Aggregate Stats
      const totalGold = allUsers.reduce((sum, u) => sum + u.current_gold, 0);
      const totalXp = allUsers.reduce((sum, u) => sum + u.current_xp, 0);
      const avgHp = allUsers.reduce((sum, u) => sum + u.current_hp, 0) / allUsers.length;
      
      const activeShifts = allUsers.filter(u => {
          if (u.id === this.user?.id) return this.isShiftActive(new Date().toISOString().split('T')[0]);
          return Math.random() > 0.5; // Randomly assign active status to mock users
      }).length;

      // Superlatives
      const sortedByGold = [...allUsers].sort((a,b) => b.current_gold - a.current_gold);
      const sortedByLvl = [...allUsers].sort((a,b) => b.level - a.level);
      const sortedByKudos = [...allUsers].sort((a,b) => b.kudos_received - a.kudos_received);

      return {
          totalUsers: allUsers.length,
          activeShifts,
          totalGoldInCirculation: totalGold,
          totalXpGenerated: totalXp,
          avgHappiness: Math.floor(avgHp),
          users: allUsers,
          topEarner: sortedByGold[0],
          highestLevel: sortedByLvl[0],
          mostKudos: sortedByKudos[0]
      };
  }

  // --- ADMIN ACTIONS ---

  async giveBonus(userId: string, amount: number) {
      if (this.user?.role !== 'manager') throw new Error("Only Managers can give bonuses");
      
      const targetMock = this.mockUsers.find(u => u.id === userId);
      if (targetMock) {
          targetMock.current_gold += amount;
      }
      if (this.user && this.user.id === userId) {
          this.user.current_gold += amount;
      }
      this.persist();
  }

  async adminPunish(userId: string, type: 'gold' | 'xp' | 'hp', amount: number) {
    if (this.user?.role !== 'manager') throw new Error("Access Denied");

    const target = this.mockUsers.find(u => u.id === userId);
    if (target) {
        if (type === 'gold') target.current_gold = Math.max(0, target.current_gold - amount);
        if (type === 'xp') target.current_xp = Math.max(0, target.current_xp - amount);
        if (type === 'hp') target.current_hp = Math.max(0, target.current_hp - amount);
    }
    this.persist();
  }

  async toggleBan(userId: string) {
    if (this.user?.role !== 'manager') throw new Error("Access Denied");
    const target = this.mockUsers.find(u => u.id === userId);
    if (target) {
        target.isBanned = !target.isBanned;
    }
    this.persist();
  }

  async updateUser(userId: string, data: Partial<User>) {
      if (this.user?.role !== 'manager') throw new Error("Access Denied");
      const targetIndex = this.mockUsers.findIndex(u => u.id === userId);
      if (targetIndex >= 0) {
          this.mockUsers[targetIndex] = { ...this.mockUsers[targetIndex], ...data };
      }
      this.persist();
  }

  async exportAttendanceCSV(): Promise<string> {
      // Basic CSV export logic
      const headers = "Log ID,User ID,Date,Time In,Time Out,Status,XP Earned\n";
      const rows = this.logs.map(l => 
          `${l.id},${l.user_id},${l.date},${l.time_in},${l.time_out || 'Active'},${l.status},${l.xp_earned}`
      ).join("\n");
      return headers + rows;
  }

  async sendKudos(targetUserId: string): Promise<string> {
      if (!this.user) throw new Error("Not logged in");
      if (targetUserId === this.user.id) throw new Error("You can't high five yourself!");
      
      const target = this.mockUsers.find(u => u.id === targetUserId);
      if (target) {
          target.kudos_received = (target.kudos_received || 0) + 1;
          target.current_xp += 10; // Bonus for receiver
          this.persist();
      }
      return "Kudos sent! They gained +10 XP.";
  }

  async unlockSkill(skillId: string): Promise<User> {
      if (!this.user) throw new Error("User not found");
      const skill = SKILL_TREE.find(s => s.id === skillId);
      if (!skill) throw new Error("Skill not found");
      
      if (this.user.unlocked_skills.includes(skillId)) throw new Error("Skill already unlocked");
      if (this.user.skill_points < skill.cost) throw new Error("Not enough Skill Points");
      if (this.user.level < skill.requiredLevel) throw new Error("Level too low");

      this.user.skill_points -= skill.cost;
      this.user.unlocked_skills.push(skillId);
      
      // Apply immediate effects if any (like max hp)
      if (skill.effectType === 'max_hp_boost') {
          this.user.total_hp += skill.effectValue;
          this.user.current_hp += skill.effectValue;
      }
      
      this.syncUserToDb();
      this.persist();
      return this.user;
  }

  // Weather System
  getWeather(): WeatherType {
    return this.weather;
  }
  
  setWeather(w: WeatherType) {
    this.weather = w;
    this.persist();
  }

  getMotd(): string {
      return this.motd;
  }

  setMotd(msg: string) {
      this.motd = msg;
      this.persist();
  }

  getGlobalModifiers(): GlobalModifiers {
      return this.globalModifiers;
  }

  setGlobalEvent(type: 'none' | 'double_xp' | 'happy_hour') {
      if (type === 'double_xp') {
          this.globalModifiers = { xpMultiplier: 2, goldMultiplier: 1, activeEventName: 'Training Day (2x XP)' };
      } else if (type === 'happy_hour') {
          this.globalModifiers = { xpMultiplier: 1, goldMultiplier: 2, activeEventName: 'Happy Hour (2x Gold)' };
      } else {
          this.globalModifiers = { xpMultiplier: 1, goldMultiplier: 1, activeEventName: undefined };
      }
      this.persist();
      return this.globalModifiers;
  }

  feedPet(): { user: User, msg: string } {
      if (!this.user || !this.user.pet) throw new Error("You don't have a pet!");
      if (this.user.current_gold < 10) throw new Error("Dog food costs 10 Gold!");
      if (this.user.pet.hunger >= 100) throw new Error("He is already full!");

      this.user.current_gold -= 10;
      this.user.pet.hunger = Math.min(100, this.user.pet.hunger + 20);
      this.user.current_xp += 5; // Reward
      
      this.syncUserToDb();
      this.persist();
      return { user: this.user, msg: "Yum! Dog is happy. +5 XP" };
  }

  resetGameData() {
      localStorage.clear();
      window.location.reload();
  }

  private checkLevelUp() {
    if (!this.user) return;
    if (this.user.current_xp >= this.user.level * 100) {
      this.user.current_xp -= this.user.level * 100;
      this.user.level += 1;
      this.user.skill_points += 1; // Gain 1 SP per level
      this.user.total_hp += 10;
      this.user.current_hp = this.user.total_hp;
    }
  }

  private checkAchievements() {
      if (!this.user) return;
      if (this.user.streak >= 3) this.unlockAchievement('ach_streak_3');
      if (this.user.current_gold >= 1000) this.unlockAchievement('ach_rich');
  }

  private unlockAchievement(achId: string) {
      if (!this.user) return;
      if (!this.user.achievements.includes(achId)) {
          this.user.achievements.push(achId);
      }
  }
  
  // Helper to ensure current user is synced back to mockUsers db so persistence works for leaderboards etc
  private syncUserToDb() {
      if (!this.user) return;
      const idx = this.mockUsers.findIndex(u => u.id === this.user!.id);
      if (idx >= 0) {
          this.mockUsers[idx] = this.user;
      } else {
          this.mockUsers.push(this.user);
      }
  }
}

export const gameService = new GameService();
