
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Quest, AttendanceLog, GameState, ShopItem, AvatarConfig, BossEvent, WeatherType, ToastMessage, Skill, TeamStats, GlobalModifiers, GameSettings, QuestSubmission, WheelPrize } from '../types';
import { gameService } from '../services/gameService';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

interface ExtendedGameState extends Omit<GameState, 'login' | 'spinWheel' | 'recordArcadePlay'> {
    login: (username: string, password?: string) => Promise<void>;
    getSqliteStats: () => { size: number };
    spinWheel: () => Promise<{ prize: WheelPrize }>;
    recordArcadePlay: (score: number) => Promise<void>;
}

const GameContext = createContext<ExtendedGameState | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [userQuestStatuses, setUserQuestStatuses] = useState<Record<string, string>>({});
  const [todayLog, setTodayLog] = useState<AttendanceLog | undefined>(undefined);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [bossEvent, setBossEvent] = useState<BossEvent>(gameService.getBossEvent());
  const [nextQuestRefresh, setNextQuestRefresh] = useState<number>(0);
  const [weather, setWeatherState] = useState<WeatherType>('Sunny');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [motd, setMotdState] = useState<string>('');
  const [globalModifiers, setGlobalModifiers] = useState<GlobalModifiers>({ xpMultiplier: 1, goldMultiplier: 1 });
  
  const [settings, setSettings] = useState<GameSettings>({
      musicVolume: 0.5,
      sfxVolume: 0.8,
      isMusicMuted: true,
      isSfxMuted: false,
      lowPerformanceMode: false
  });

  const isShiftActive = !!(todayLog && !todayLog.time_out);

  useEffect(() => {
    const init = async () => {
      try {
          const u = await gameService.getUserProfile();
          if (u) {
            setUser(u);
            const log = await gameService.getTodayLog();
            setTodayLog(log);
            refreshGameData();
          }
          setWeatherState(gameService.getWeather());
          setMotdState(gameService.getMotd());
          setGlobalModifiers(gameService.getGlobalModifiers());

          const dbSettings = gameService.getSettings();
          setSettings(dbSettings);
          audioService.setVolumes(dbSettings.musicVolume, dbSettings.sfxVolume, dbSettings.isMusicMuted, dbSettings.isSfxMuted);

      } catch (e) {
          console.error("Init failed", e);
      }
    };
    init();

    const interval = setInterval(async () => {
        setBossEvent({...gameService.getBossEvent()});
        if (user) {
            const freshUser = await gameService.getUserProfile();
            if (freshUser) {
                setUser(freshUser);
            }
        }
    }, 2000);

    return () => clearInterval(interval);
  }, [user?.id]); 

  useEffect(() => {
      audioService.setVolumes(settings.musicVolume, settings.sfxVolume, settings.isMusicMuted, settings.isSfxMuted);
      if (!settings.isMusicMuted && user) {
          audioService.startMusic();
      } else {
          if (settings.isMusicMuted) audioService.stopMusic();
      }
  }, [settings, user]);

  const refreshGameData = async () => {
      const q = await gameService.getQuests();
      const l = await gameService.getLeaderboard();
      setActiveQuests(q.active);
      setUserQuestStatuses(q.userStatus);
      setNextQuestRefresh(q.nextRefresh);
      setLeaderboard(l);
      setBossEvent(gameService.getBossEvent());
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
      setSettings(prev => {
          const updated = { ...prev, ...newSettings };
          gameService.saveSettings(updated); 
          return updated;
      });
  }

  const resetGameData = () => {
      if(window.confirm("WARNING: This will delete ALL progress, users, and logs. Are you sure?")) {
          gameService.resetGameData();
      }
  }

  const playSfx = (type: any) => {
      if (!settings.isSfxMuted) audioService.playSfx(type);
  }

  const addToast = (msg: string, type: 'success' | 'error' | 'info') => {
      // Use randomUUID if available, else fallback to random string to ensure uniqueness vs Date.now()
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      
      setToasts(prev => {
          const newToasts = [...prev, { id, message: msg, type }];
          // Limit to 5 max to prevent spamming/stuck UI
          if (newToasts.length > 5) return newToasts.slice(newToasts.length - 5);
          return newToasts;
      });

      if (type === 'success') playSfx('success');
      else if (type === 'error') playSfx('error');
      else playSfx('button');

      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const setWeather = (w: WeatherType) => {
      gameService.setWeather(w);
      setWeatherState(w);
      addToast(`Weather set to ${w}`, 'info');
  };

  const setMotd = (msg: string) => {
      gameService.setMotd(msg);
      setMotdState(msg);
      addToast("MOTD Updated", 'success');
  };

  const login = async (username: string, password?: string) => {
      try {
          const u = await gameService.login(username, password);
          setUser(u);
          const log = await gameService.getTodayLog(new Date(Date.now() + timeOffset));
          setTodayLog(log);
          refreshGameData();
          playSfx('success');
      } catch (e: any) {
          playSfx('error');
          throw e;
      }
  };

  const logout = () => {
      gameService.logout();
      setUser(null);
      audioService.stopMusic();
  };

  const addXp = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, current_xp: prev.current_xp + amount } : null);
  };

  const addGold = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, current_gold: prev.current_gold + amount } : null);
  };

  const takeDamage = (amount: number) => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, current_hp: Math.max(0, prev.current_hp - amount) } : null);
  };

  const clockIn = async (time: Date) => {
    const log = await gameService.clockIn(time, isOverdrive);
    setTodayLog(log);
    const updatedUser = await gameService.getUserProfile();
    setUser(updatedUser);
    setBossEvent(gameService.getBossEvent()); 
    addToast(`Clocked In: ${log.status.toUpperCase()}!`, 'success');
    return log;
  };

  const clockOut = async (time: Date) => {
    const log = await gameService.clockOut(time);
    setTodayLog(log);
    addToast('Shift Ended. Good work!', 'info');
    return log;
  };

  const submitQuest = async (questId: string) => {
    try {
      await gameService.submitQuest(questId);
      refreshGameData();
      addToast('Quest Submitted for Approval', 'info');
      playSfx('button');
    } catch (e: any) {
      addToast(e.message, 'error');
    }
  };

  const completeQuest = submitQuest;

  const approveQuest = async (userId: string, questId: string) => {
      await gameService.approveQuest(userId, questId);
      addToast('Quest Approved', 'success');
  }

  const rejectQuest = async (userId: string, questId: string) => {
      await gameService.rejectQuest(userId, questId);
      addToast('Quest Rejected', 'info');
  }

  const getPendingSubmissions = async () => {
      return await gameService.getPendingSubmissions();
  }

  const buyItem = async (itemId: string) => {
      try {
          const { user: u, message } = await gameService.buyItem(itemId);
          setUser({...u});
          addToast(message, 'success');
          playSfx('coin');
      } catch (e: any) {
          addToast(e.message, 'error');
      }
  };

  const consumeItem = async (itemId: string) => { await buyItem(itemId); };

  const equipItem = async (type: keyof AvatarConfig, assetId: string) => {
      const u = await gameService.equipItem(type, assetId);
      if(u) { setUser({...u}); addToast('Item Equipped!', 'info'); }
  };

  const createQuest = async (quest: Omit<Quest, 'id' | 'expiresAt'>, durationHours: number) => {
      await gameService.createQuest(quest, durationHours);
      refreshGameData();
      addToast('Quest Created', 'success');
  };

  const toggleOverdrive = () => {
    setIsOverdrive(prev => !prev);
    addToast(isOverdrive ? 'Normal Mode' : 'OVERDRIVE MODE', 'info');
  };

  const performWorkAction = async () => {
      try {
          const { user: u, earned } = await gameService.performWorkAction();
          setUser(u);
          addToast(earned, 'success');
          playSfx('coin');
      } catch (e: any) {
          addToast(e.message, 'error');
      }
  };

  const takeBreak = async () => {
      try {
          const { user: u, recovered } = await gameService.takeBreak();
          setUser(u);
          addToast(`Rested: +${recovered} HP`, 'info');
      } catch (e: any) {
          addToast(e.message, 'error');
      }
  };

  const spinWheel = async () => {
      const result = await gameService.spinWheel();
      setUser(gameService['user']); // Update local user from service
      return result;
  };

  const unlockSkill = async (skillId: string) => {
      try {
          const u = await gameService.unlockSkill(skillId);
          setUser({...u});
          addToast('Skill Unlocked!', 'success');
          playSfx('success');
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch(e: any) {
          addToast(e.message, 'error');
      }
  };

  const sendKudos = async (targetId: string) => {
      try {
          const msg = await gameService.sendKudos(targetId);
          addToast(msg, 'success');
      } catch(e: any) {
          addToast(e.message, 'error');
      }
  };

  const recordArcadePlay = async (score: number) => {
      const u = await gameService.recordArcadePlay(score);
      setUser({...u});
  }

  const feedPet = async () => {
      try {
          const { user: u, msg } = await gameService.feedPet();
          setUser({...u});
          addToast(msg, 'success');
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ['#FF69B4', '#FFF'] });
      } catch(e: any) {
          addToast(e.message, 'error');
      }
  };
  
  const getTeamData = async () => { return await gameService.getTeamData(); }
  
  const giveBonus = async (userId: string, amount: number) => {
      await gameService.giveBonus(userId, amount);
      addToast(`Sent ${amount}G Bonus`, 'success');
      playSfx('coin');
  }

  const setGlobalEvent = async (type: 'none' | 'double_xp' | 'happy_hour') => {
      try {
        const mods = await gameService.setGlobalEvent(type);
        setGlobalModifiers(mods);
        if (type !== 'none') {
            addToast(`EVENT STARTED: ${mods.activeEventName}`, 'success');
            confetti();
        } else {
            addToast('Event Ended', 'info');
        }
      } catch (e: any) {
        addToast("Failed to set event", 'error');
      }
  }

  const exportData = async () => { return await gameService.exportAttendanceCSV(); }
  const toggleBan = async (userId: string) => { await gameService.toggleBan(userId); addToast('User Ban Status Updated', 'info'); }
  const updateUser = async (userId: string, data: Partial<User>) => { await gameService.updateUser(userId, data); addToast('User Profile Updated', 'success'); }
  const punishUser = async (userId: string, type: 'gold' | 'xp' | 'hp', amount: number) => {
     await gameService.adminPunish(userId, type, amount);
     addToast(`Penalty Applied (-${amount} ${type.toUpperCase()})`, 'error');
     playSfx('error');
  }
  const getAuditLogs = async () => { return await gameService.getAuditLogs(); }

  const getSqliteStats = () => gameService.getSqliteStats();

  return (
    <GameContext.Provider value={{
      user,
      activeQuests,
      userQuestStatuses,
      todayLog,
      isOverdrive,
      isShiftActive,
      leaderboard,
      shopItems: gameService.getShopItems(),
      bossEvent,
      weather,
      toasts,
      skills: gameService.getSkills(),
      timeOffset,
      motd,
      globalModifiers,
      settings,
      login,
      logout,
      addXp,
      addGold,
      takeDamage,
      clockIn,
      clockOut,
      submitQuest,
      approveQuest,
      rejectQuest,
      getPendingSubmissions,
      toggleOverdrive,
      buyItem,
      equipItem,
      createQuest,
      nextQuestRefresh,
      performWorkAction,
      takeBreak,
      addToast,
      consumeItem,
      spinWheel,
      unlockSkill,
      sendKudos,
      recordArcadePlay,
      setWeather,
      setTimeOffset,
      setMotd,
      feedPet,
      getTeamData,
      giveBonus,
      setGlobalEvent,
      exportData,
      toggleBan,
      updateUser,
      punishUser,
      getAuditLogs,
      updateSettings,
      resetGameData,
      playSfx,
      getSqliteStats
    }}>
      {children}
    </GameContext.Provider>
  );
};
