

export interface AvatarConfig {
  hat: string;
  eyes: string;
  mouth: string;
  clothing: string;
  accessory?: string;
}

export type UserRole = 'employee' | 'manager' | 'moderator';

export interface ShopItem {
  id: string;
  name: string;
  type: 'hat' | 'eyes' | 'clothing' | 'accessory' | 'consumable' | 'pet';
  asset_id: string; // The value used in AvatarConfig or effect ID
  cost: number;
  description: string;
  effectValue?: number; // For consumables (e.g., +20 HP)
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number; // SP Cost
  effectType: 'gold_boost' | 'xp_boost' | 'shop_discount' | 'max_hp_boost';
  effectValue: number; // e.g. 0.2 for 20% boost
  requiredLevel: number;
  icon: string;
}

export interface Pet {
    name: string;
    hunger: number; // 0-100
    happiness: number; // 0-100
}

export interface User {
  id: string;
  username: string; // For login
  name: string;
  role: UserRole;
  avatar_json: AvatarConfig;
  level: number;
  current_xp: number;
  current_gold: number;
  current_hp: number;
  total_hp: number;
  inventory: string[]; // Array of ShopItem IDs
  streak: number;
  last_login_date: string;
  achievements: string[]; // IDs of unlocked achievements
  last_spin_date?: string;
  last_mystery_box_date?: string; // YYYY-MM-DD
  last_arcade_play_time?: number; // Timestamp
  skill_points: number;
  unlocked_skills: string[]; // Skill IDs
  kudos_received: number;
  pet?: Pet;
  isBanned?: boolean; // Admin suspension
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  date: string; // ISO String YYYY-MM-DD
  time_in: string; // ISO String
  time_out?: string;
  status: 'ontime' | 'late' | 'critical_hit' | 'early_bird';
  xp_earned: number;
}

export interface AuditLog {
    id: string;
    user_id: string;
    user_name?: string; // Joined field
    action_type: 'SPIN' | 'SHOP' | 'QUEST' | 'ADMIN' | 'ARCADE' | 'SYSTEM';
    details: string;
    timestamp: number;
}

export type QuestType = 'Daily' | 'Party' | 'Urgent';

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward_gold: number;
  reward_xp: number;
  type: QuestType;
  expiresAt: number; // Timestamp
}

export interface QuestSubmission {
    user_id: string;
    user_name: string;
    quest_id: string;
    quest_title: string;
    reward_gold: number;
    reward_xp: number;
    status: 'pending' | 'approved';
}

export interface BossEvent {
  name: string;
  currentHp: number;
  maxHp: number;
  isActive: boolean;
  description: string;
}

export type WeatherType = 'Sunny' | 'Rainy' | 'Snowy' | 'Heatwave' | 'Foggy';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TeamStats {
  totalUsers: number;
  activeShifts: number;
  totalGoldInCirculation: number;
  totalXpGenerated: number;
  avgHappiness: number;
  users: User[];
  topEarner?: User;
  highestLevel?: User;
  mostKudos?: User;
}

export interface GlobalModifiers {
    xpMultiplier: number;
    goldMultiplier: number;
    activeEventName?: string;
}

export interface GameSettings {
    musicVolume: number; // 0.0 to 1.0
    sfxVolume: number; // 0.0 to 1.0
    isMusicMuted: boolean;
    isSfxMuted: boolean;
    lowPerformanceMode: boolean;
}

export interface WheelPrize {
    id: string;
    label: string;
    type: 'gold' | 'xp' | 'hp';
    value: number;
    weight: number; 
    color: string;
}

export interface GameState {
  user: User | null;
  activeQuests: Quest[];
  userQuestStatuses: Record<string, string>; // questId -> 'pending' | 'approved'
  todayLog?: AttendanceLog;
  isOverdrive: boolean;
  isShiftActive: boolean;
  leaderboard: User[];
  shopItems: ShopItem[];
  bossEvent: BossEvent;
  weather: WeatherType;
  toasts: ToastMessage[];
  skills: Skill[];
  timeOffset: number;
  motd: string;
  globalModifiers: GlobalModifiers;
  settings: GameSettings;
  // Actions
  login: (username: string) => Promise<void>;
  logout: () => void;
  addXp: (amount: number) => void;
  addGold: (amount: number) => void;
  takeDamage: (amount: number) => void;
  clockIn: (time: Date) => Promise<AttendanceLog>;
  clockOut: (time: Date) => Promise<AttendanceLog>;
  submitQuest: (questId: string) => void; // User submits
  approveQuest: (userId: string, questId: string) => Promise<void>; // Admin approves
  rejectQuest: (userId: string, questId: string) => Promise<void>; // Admin rejects
  getPendingSubmissions: () => Promise<QuestSubmission[]>;
  toggleOverdrive: () => void;
  buyItem: (itemId: string) => void;
  equipItem: (type: keyof AvatarConfig, assetId: string) => void;
  createQuest: (quest: Omit<Quest, 'id' | 'expiresAt'>, durationHours: number) => void;
  nextQuestRefresh: number; // Timestamp
  performWorkAction: () => void;
  takeBreak: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  consumeItem: (itemId: string) => void;
  spinWheel: () => { reward: string, value: number, type: 'gold' | 'xp' | 'hp', prizeId: string };
  unlockSkill: (skillId: string) => void;
  sendKudos: (targetUserId: string) => void;
  recordArcadePlay: () => void;
  setWeather: (w: WeatherType) => void;
  setTimeOffset: (offset: number) => void;
  setMotd: (msg: string) => void;
  feedPet: () => void;
  getTeamData: () => Promise<TeamStats>;
  giveBonus: (userId: string, amount: number) => Promise<void>;
  setGlobalEvent: (type: 'none' | 'double_xp' | 'happy_hour') => void;
  // Admin Features
  exportData: () => Promise<string>;
  toggleBan: (userId: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  punishUser: (userId: string, type: 'gold' | 'xp' | 'hp', amount: number) => Promise<void>;
  deleteUserAccount: (userId: string) => Promise<void>;
  deleteAuditLog: (logId: string) => Promise<void>;
  getAuditLogs: () => Promise<AuditLog[]>;
  // Settings & Audio
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetGameData: () => void;
  playSfx: (type: 'button' | 'coin' | 'error' | 'success' | 'collect' | 'hurt' | 'miss' | 'gameover') => void;
}