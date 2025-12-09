
import { User, Quest, AttendanceLog, ShopItem, UserRole, AvatarConfig, BossEvent, Achievement, WeatherType, Skill, TeamStats, GlobalModifiers, AuditLog, QuestSubmission, GameSettings, WheelPrize } from '../types';

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

const INITIAL_BOSS: BossEvent = {
  name: "The Sunday Rush",
  currentHp: 1000,
  maxHp: 1000,
  isActive: true,
  description: "An endless horde of caffeine-deprived zombies."
};

export const WHEEL_PRIZES: WheelPrize[] = [
    { id: 'p1', label: '50 Gold', type: 'gold', value: 50, weight: 30, color: '#FFD700' },
    { id: 'p2', label: '50 XP', type: 'xp', value: 50, weight: 30, color: '#3B82F6' }, 
    { id: 'p3', label: '10 Gold', type: 'gold', value: 10, weight: 10, color: '#EF4444' },
    { id: 'p4', label: 'Full Heal', type: 'hp', value: 100, weight: 10, color: '#10B981' },
    { id: 'p5', label: '100 Gold', type: 'gold', value: 100, weight: 10, color: '#FFD700' },
    { id: 'p6', label: '100 XP', type: 'xp', value: 100, weight: 10, color: '#3B82F6' },
    { id: 'p7', label: '10 XP', type: 'xp', value: 10, weight: 10, color: '#EF4444' },
    { id: 'p8', label: 'JACKPOT', type: 'gold', value: 500, weight: 1, color: '#A855F7' },
];

class GameService {
  private user: User | null = null;
  private bossEvent: BossEvent = { ...INITIAL_BOSS };
  private weather: WeatherType = 'Sunny';
  private motd: string = "";
  private globalModifiers: GlobalModifiers = { xpMultiplier: 1, goldMultiplier: 1 };
  private settings: GameSettings = { musicVolume: 0.5, sfxVolume: 0.8, isMusicMuted: true, isSfxMuted: false, lowPerformanceMode: false };

  constructor() {}

  private async apiCall(endpoint: string, method: string = 'GET', body?: any) {
      const headers = { 'Content-Type': 'application/json' };
      try {
          const res = await fetch(`/api${endpoint}`, {
              method,
              headers,
              body: body ? JSON.stringify(body) : undefined
          });

          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
              return data;
          } else {
              throw new Error("Server Unreachable. Please ensure the backend (node server.js) is running.");
          }
      } catch (e: any) {
          console.error("API Call Failed", e);
          throw new Error(e.message || "Network Error");
      }
  }

  // --- AUTH ---
  async login(username: string, password?: string): Promise<User> {
      const user = await this.apiCall('/auth/login', 'POST', { username, password });
      this.user = user;
      return user;
  }

  async register(username: string, password?: string): Promise<User> {
      const hash = password ? await this.hashPassword(password) : '';
      const user = await this.apiCall('/auth/register', 'POST', { 
          id: crypto.randomUUID(),
          username, 
          password_hash: hash, 
          name: username, 
          role: username === 'admin' ? 'manager' : 'employee',
          avatar_json: { hat: 'cap_red', eyes: 'normal', mouth: 'smile', clothing: 'apron_green' }
      });
      this.user = user;
      return user;
  }

  async hashPassword(password: string): Promise<string> {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  logout() {
      this.user = null;
  }

  async getUserProfile(): Promise<User | null> {
      if (!this.user) return null;
      try {
          const u = await this.apiCall(`/user/${this.user.id}`);
          this.user = u;
          return u;
      } catch(e) { return null; }
  }

  async refreshData() {
      const data = await this.apiCall('/data/refresh');
      this.bossEvent = data.bossEvent;
      this.weather = data.weather;
      this.motd = data.motd;
      this.globalModifiers = data.globalModifiers;
      return data;
  }

  async clockIn(date: Date, isOverdrive: boolean): Promise<AttendanceLog> {
      if (!this.user) throw new Error("No User");
      const log = await this.apiCall('/action/clock-in', 'POST', {
          userId: this.user.id,
          date: date.toISOString(),
          isOverdrive
      });
      await this.getUserProfile();
      return log;
  }

  async clockOut(date: Date): Promise<AttendanceLog> {
      if (!this.user) throw new Error("No User");
      const log = await this.apiCall('/action/clock-out', 'POST', {
          userId: this.user.id,
          date: date.toISOString()
      });
      return log;
  }

  async getTodayLog(dateOverride?: Date): Promise<AttendanceLog | undefined> {
      return undefined; 
  }

  async performWorkAction() {
      if (!this.user) throw new Error("No User");
      const res = await this.apiCall('/action/work', 'POST', { userId: this.user.id });
      this.user = res.user;
      return { user: this.user!, earned: res.earned };
  }

  async takeBreak() {
      if (!this.user) throw new Error("No User");
      this.user.current_hp = Math.min(this.user.total_hp, this.user.current_hp + 15);
      return { user: this.user, recovered: 15 };
  }

  async buyItem(itemId: string) {
      if (!this.user) throw new Error("No User");
      const res = await this.apiCall('/shop/buy', 'POST', { userId: this.user.id, itemId });
      this.user = res.user;
      return res;
  }

  async getQuests() {
      const data = await this.refreshData();
      return { active: data.activeQuests, userStatus: {}, nextRefresh: Date.now() + 3600000 };
  }

  async createQuest(quest: any, durationHours: number) {
      await this.apiCall('/admin/create-quest', 'POST', { ...quest, durationHours });
  }

  async submitQuest(questId: string) {
      if (!this.user) throw new Error("No User");
      await this.apiCall('/action/submit-quest', 'POST', { userId: this.user.id, questId });
      return { user: this.user, status: 'pending' };
  }

  async getPendingSubmissions(): Promise<QuestSubmission[]> {
      return await this.apiCall('/admin/pending-quests');
  }

  async approveQuest(userId: string, questId: string) {
      await this.apiCall('/admin/approve-quest', 'POST', { userId, questId });
  }

  async rejectQuest(userId: string, questId: string) {
      // Stub
  }

  // --- MINIGAMES ---
  
  async spinWheel(): Promise<{ prize: WheelPrize }> {
      if (!this.user) throw new Error("No User");
      const res = await this.apiCall('/action/spin', 'POST', { userId: this.user.id });
      this.user = res.user;
      return { prize: res.prize };
  }
  
  canSpin() {
      if (!this.user) return false;
      return this.user.last_spin_date !== new Date().toISOString().split('T')[0];
  }

  async recordArcadePlay(score: number) {
      if (!this.user) return this.user;
      const res = await this.apiCall('/action/arcade', 'POST', { userId: this.user.id, score });
      this.user = res.user;
      return this.user;
  }

  async equipItem(type: keyof AvatarConfig, assetId: string) {
      if (!this.user) return null;
      const u = await this.apiCall('/action/equip', 'POST', { userId: this.user.id, type, assetId });
      this.user = u;
      return u;
  }

  async unlockSkill(skillId: string) {
      if (!this.user) throw new Error("No User");
      const u = await this.apiCall('/action/unlock-skill', 'POST', { userId: this.user.id, skillId });
      this.user = u;
      return u;
  }

  async sendKudos(targetUserId: string) {
      if (!this.user) throw new Error("No User");
      const res = await this.apiCall('/action/kudos', 'POST', { fromId: this.user.id, toId: targetUserId });
      return res.message;
  }

  async feedPet() {
      if (!this.user) throw new Error("No User");
      const res = await this.apiCall('/action/feed-pet', 'POST', { userId: this.user.id });
      this.user = res.user;
      return res;
  }

  // Admin Actions
  async updateUser(userId: string, data: Partial<User>) {
      await this.apiCall('/admin/update-user', 'POST', { userId, ...data });
  }

  async toggleBan(userId: string) {
      await this.apiCall('/admin/toggle-ban', 'POST', { userId });
  }

  async adminPunish(userId: string, type: 'gold' | 'xp' | 'hp', amount: number) {
      await this.apiCall('/admin/punish', 'POST', { userId, type, amount });
  }

  async getAuditLogs(): Promise<AuditLog[]> {
      return await this.apiCall('/admin/audit-logs');
  }

  // Getters
  getShopItems() { return SHOP_ITEMS; }
  getAllAchievements() { return ACHIEVEMENT_LIST; }
  getSkills() { return SKILL_TREE; }
  getBossEvent() { return this.bossEvent; }
  getWeather() { return this.weather; }
  getMotd() { return this.motd; }
  getGlobalModifiers() { return this.globalModifiers; }
  getSettings() { return this.settings; }
  getSqliteStats() { return { size: 0 }; } 

  // Stubs
  async getLeaderboard() { return (await this.refreshData()).leaderboard; }
  async getTeamData() { 
      const l = await this.getLeaderboard();
      return { 
          totalUsers: l.length, 
          activeShifts: 0, 
          totalGoldInCirculation: 0, 
          totalXpGenerated: 0, 
          avgHappiness: 0, 
          users: l 
      }; 
  }
  async giveBonus(uid: string, amt: number) { /* Stub */ }
  setGlobalEvent(type: string) { return this.globalModifiers; }
  setWeather(w: WeatherType) { this.weather = w; }
  setMotd(m: string) { this.motd = m; }
  saveSettings(s: GameSettings) { this.settings = s; }
  async exportAttendanceCSV() { return ""; }
  resetGameData() { /* Stub */ }
}

export const gameService = new GameService();
