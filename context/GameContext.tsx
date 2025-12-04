
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Quest, AttendanceLog, GameState, ShopItem, AvatarConfig, BossEvent, WeatherType, ToastMessage, Skill, TeamStats, GlobalModifiers, GameSettings } from '../types';
import { gameService } from '../services/gameService';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
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
  
  // Settings State
  const [settings, setSettings] = useState<GameSettings>({
      musicVolume: 0.5,
      sfxVolume: 0.8,
      isMusicMuted: true, // Default to muted to avoid auto-play blocking
      isSfxMuted: false,
      lowPerformanceMode: false
  });

  // Derived state
  const isShiftActive = !!(todayLog && !todayLog.time_out);

  useEffect(() => {
    const init = async () => {
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

      // Load Settings
      const savedSettings = localStorage.getItem('gowork_settings');
      if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings(parsed);
          audioService.setVolumes(parsed.musicVolume, parsed.sfxVolume, parsed.isMusicMuted, parsed.isSfxMuted);
      } else {
          audioService.setVolumes(0.5, 0.8, true, false);
      }
    };
    init();

    const interval = setInterval(() => {
        setBossEvent({...gameService.getBossEvent()});
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Update Audio Service whenever settings change
  useEffect(() => {
      audioService.setVolumes(settings.musicVolume, settings.sfxVolume, settings.isMusicMuted, settings.isSfxMuted);
      
      // Strict Playback Logic: Only play if logged in AND unmuted
      if (!settings.isMusicMuted && user) {
          audioService.startMusic();
      } else {
          // If muted OR logged out (handled by logout(), but explicit check here helps edge cases)
          if (settings.isMusicMuted) audioService.stopMusic();
      }
  }, [settings, user]); // User dependency ensures music starts/stops on login/logout if settings allow

  const refreshGameData = async () => {
      const q = await gameService.getQuests();
      const l = await gameService.getLeaderboard();
      setActiveQuests(q.active);
      setCompletedQuestIds(q.completedIds);
      setNextQuestRefresh(q.nextRefresh);
      setLeaderboard(l);
      setBossEvent(gameService.getBossEvent());
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
      setSettings(prev => {
          const updated = { ...prev, ...newSettings };
          localStorage.setItem('gowork_settings', JSON.stringify(updated));
          return updated;
      });
  }

  const resetGameData = () => {
      if(window.confirm("WARNING: This will delete ALL progress, users, and logs. Are you sure?")) {
          gameService.resetGameData();
      }
  }

  const playSfx = (type: 'button' | 'coin' | 'error' | 'success') => {
      if (!settings.isSfxMuted) audioService.playSfx(type);
  }

  const addToast = (msg: string, type: 'success' | 'error' | 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message: msg, type }]);
      
      // Play sound based on toast type
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

  const login = async (username: string) => {
      try {
          const u = await gameService.login(username);
          setUser(u);
          const log = await gameService.getTodayLog(new Date(Date.now() + timeOffset));
          setTodayLog(log);
          refreshGameData();
          playSfx('success');
          
          // Music logic handled by useEffect on [user]
      } catch (e: any) {
          playSfx('error');
          throw e; // Bubble up to login component
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

  const completeQuest = async (questId: string) => {
    try {
      const { user: updatedUser, reward } = await gameService.completeQuest(questId);
      setUser(updatedUser);
      setCompletedQuestIds(prev => [...prev, questId]);
      setBossEvent(gameService.getBossEvent()); 
      addToast(`Quest Complete! +${reward} Gold`, 'success');
      playSfx('coin');
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500']
      });
      
    } catch (e: any) {
      console.error(e);
      addToast(e.message, 'error');
    }
  };

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

  const consumeItem = async (itemId: string) => {
     await buyItem(itemId);
  };

  const equipItem = async (type: keyof AvatarConfig, assetId: string) => {
      const u = await gameService.equipItem(type, assetId);
      if(u) {
          setUser({...u});
          addToast('Item Equipped!', 'info');
      }
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

  const spinWheel = () => {
      try {
          const result = gameService.spinWheel();
          // Force update local user state
          gameService.getUserProfile().then(u => setUser(u));
          return result;
      } catch (e: any) {
          addToast(e.message, 'error');
          throw e;
      }
  };

  const unlockSkill = async (skillId: string) => {
      try {
          const u = await gameService.unlockSkill(skillId);
          setUser({...u});
          addToast('Skill Unlocked!', 'success');
          playSfx('success');
          confetti({
             particleCount: 50,
             spread: 60,
             origin: { y: 0.7 }
          });
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

  const recordArcadePlay = async () => {
      const u = await gameService.recordArcadePlay();
      setUser({...u});
  }

  const feedPet = () => {
      try {
          const { user: u, msg } = gameService.feedPet();
          setUser({...u});
          addToast(msg, 'success');
          confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.8 },
              colors: ['#FF69B4', '#FFF']
          });
      } catch(e: any) {
          addToast(e.message, 'error');
      }
  };
  
  const getTeamData = async () => {
      return await gameService.getTeamData();
  }

  const giveBonus = async (userId: string, amount: number) => {
      await gameService.giveBonus(userId, amount);
      addToast(`Sent ${amount}G Bonus`, 'success');
      playSfx('coin');
  }

  const setGlobalEvent = (type: 'none' | 'double_xp' | 'happy_hour') => {
      const mods = gameService.setGlobalEvent(type);
      setGlobalModifiers(mods);
      if (type !== 'none') {
          addToast(`EVENT STARTED: ${mods.activeEventName}`, 'success');
          confetti();
      } else {
          addToast('Event Ended', 'info');
      }
  }

  // Admin Features
  const exportData = async () => {
     return await gameService.exportAttendanceCSV();
  }

  const toggleBan = async (userId: string) => {
     await gameService.toggleBan(userId);
     addToast('User Ban Status Updated', 'info');
  }

  const updateUser = async (userId: string, data: Partial<User>) => {
     await gameService.updateUser(userId, data);
     addToast('User Profile Updated', 'success');
  }

  const punishUser = async (userId: string, type: 'gold' | 'xp' | 'hp', amount: number) => {
     await gameService.adminPunish(userId, type, amount);
     addToast(`Penalty Applied (-${amount} ${type.toUpperCase()})`, 'error');
     playSfx('error');
  }

  return (
    <GameContext.Provider value={{
      user,
      activeQuests,
      completedQuestIds,
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
      completeQuest,
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
      updateSettings,
      resetGameData,
      playSfx
    }}>
      {children}
    </GameContext.Provider>
  );
};
