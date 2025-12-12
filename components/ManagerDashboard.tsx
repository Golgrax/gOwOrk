
import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { RetroCard } from './RetroCard';
import { PlusCircle, CloudRain, Sun, Snowflake, Zap, CloudFog, Flame, Megaphone, Users, Activity, BarChart3, Gift, PartyPopper, GraduationCap, Download, Ban, Gavel, UserCog, Save, FileText, Check, X, Inbox, Search, TrendingUp, DollarSign, Clock, Trash2, Database, Upload } from 'lucide-react';
import { WeatherType, TeamStats, User, AuditLog, QuestSubmission } from '../types';
import { gameService } from '../services/gameService';

export const ManagerDashboard: React.FC = () => {
  const { createQuest, setWeather, weather, toggleOverdrive, isOverdrive, setTimeOffset, setMotd, motd, getTeamData, giveBonus, setGlobalEvent, globalModifiers, exportData, exportDatabase, importDatabase, toggleBan, updateUser, punishUser, deleteUserAccount, deleteAuditLog, clearAllAuditLogs, addToast, playSfx, approveQuest, rejectQuest, getPendingSubmissions, user } = useGame();
  const [activeTab, setActiveTab] = useState<'inbox' | 'control' | 'team' | 'manage' | 'logs'>('inbox');
  
  // Control State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [gold, setGold] = useState(10);
  const [xp, setXp] = useState(10);
  const [duration, setDuration] = useState(24); // Hours
  const [timeInput, setTimeInput] = useState('');
  const [motdInput, setMotdInput] = useState(motd);

  // Team State
  const [teamStats, setTeamStats] = useState<any | null>(null);
  
  // Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logFilter, setLogFilter] = useState<'ALL' | 'PRIZES' | 'SHOP' | 'ADMIN'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Inbox State
  const [pendingQuests, setPendingQuests] = useState<QuestSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Manage Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [punishMode, setPunishMode] = useState<{userId: string, type: 'gold' | 'xp' | 'hp', amount: number} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isManager = user?.role === 'manager';
  const isModerator = user?.role === 'moderator' || isManager; // Mods have partial access

  useEffect(() => {
      if ((activeTab === 'team' || activeTab === 'manage') && isModerator) {
          getTeamData().then(setTeamStats);
      }
      if (activeTab === 'logs') {
          gameService.getAuditLogs().then(setAuditLogs);
      }
      if (activeTab === 'inbox') {
          refreshInbox();
      }
  }, [activeTab, isModerator]);

  const refreshInbox = async () => {
      try {
          const subs = await getPendingSubmissions();
          setPendingQuests(subs);
      } catch(e) {
          console.error("Failed to refresh inbox", e);
      }
  }

  const handleApprove = async (userId: string, questId: string) => {
      await approveQuest(userId, questId);
      refreshInbox();
      playSfx('coin');
  }

  const handleReject = async (userId: string, questId: string) => {
      await rejectQuest(userId, questId);
      refreshInbox();
  }

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     createQuest({
        title,
        description: desc,
        reward_gold: Number(gold),
        reward_xp: Number(xp),
        type: 'Urgent'
     }, duration);
     setTitle('');
     setDesc('');
  };

  const handleSetTime = () => {
      if (!timeInput) return;
      const [h, m] = timeInput.split(':').map(Number);
      const now = new Date();
      const targetTime = new Date(now);
      targetTime.setHours(h, m, 0, 0);
      
      const offset = targetTime.getTime() - now.getTime();
      setTimeOffset(offset);
  };

  const handleSetMotd = () => {
      if (motdInput.trim()) setMotd(motdInput);
  };
  
  const handleGiveBonus = async (userId: string) => {
      await giveBonus(userId, 50);
      getTeamData().then(setTeamStats);
  };
  
  const handleExport = async () => {
      const csv = await exportData();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `gowork_export_${new Date().toISOString()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  const handleExportDb = async () => {
      const pwd = window.prompt("Security Check: Enter your password to DOWNLOAD the full database backup (ZIP).");
      if (pwd) {
          await exportDatabase(pwd);
      }
  };

  const handleImportClick = () => {
      if(fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = e.target.files;
          const pwd = window.prompt("WARNING: This will OVERWRITE the current database.\nEnter password to confirm restore:");
          if (pwd) {
              await importDatabase(files, pwd);
          }
          // Reset input
          e.target.value = '';
      }
  };

  const handleToggleBan = async (userId: string) => {
      if(window.confirm("Are you sure you want to ban/unban this user?")) {
          await toggleBan(userId);
          getTeamData().then(setTeamStats);
      }
  }

  const handleDeleteUser = async (userId: string, username: string) => {
      if(window.confirm(`DANGER: Are you sure you want to DELETE user "${username}"?\nThis action cannot be undone. All logs and data will be removed.`)) {
          await deleteUserAccount(userId);
          getTeamData().then(setTeamStats);
      }
  }

  const handleDeleteLog = async (logId: string) => {
      await deleteAuditLog(logId);
      gameService.getAuditLogs().then(setAuditLogs);
  }

  const handleClearAllLogs = async () => {
      const pwd = window.prompt("DANGER: This will delete ALL audit logs history.\nEnter your password to confirm:");
      if (pwd) {
          try {
              await clearAllAuditLogs(pwd);
              gameService.getAuditLogs().then(setAuditLogs);
          } catch(e: any) {
              addToast(e.message || "Operation failed", "error");
          }
      }
  }

  const handlePunish = async () => {
      if (punishMode) {
          await punishUser(punishMode.userId, punishMode.type, punishMode.amount);
          setPunishMode(null);
          getTeamData().then(setTeamStats);
      }
  }

  const handleEditSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if(editingUser) {
          await updateUser(editingUser.id, { name: editingUser.name, role: editingUser.role });
          setEditingUser(null);
          getTeamData().then(setTeamStats);
      }
  }
  
  // Handlers for Global Events
  const handleToggleDoubleXp = () => {
      const newType = globalModifiers.activeEventName === 'Training Day' ? 'none' : 'double_xp';
      setGlobalEvent(newType as any);
  }
  
  const handleToggleHappyHour = () => {
      const newType = globalModifiers.activeEventName === 'Happy Hour' ? 'none' : 'happy_hour';
      setGlobalEvent(newType as any);
  }

  const weatherOptions: { type: WeatherType, icon: React.ReactNode, perk: string }[] = [
      { type: 'Sunny', icon: <Sun size={16} />, perk: 'Balanced' },
      { type: 'Rainy', icon: <CloudRain size={16} />, perk: '+25 HP Rest' },
      { type: 'Snowy', icon: <Snowflake size={16} />, perk: '1.5x XP / High Cost' },
      { type: 'Heatwave', icon: <Flame size={16} />, perk: '1.5x Gold / High Cost' },
      { type: 'Foggy', icon: <CloudFog size={16} />, perk: 'Lucky Gold Drops' },
  ];

  const filteredLogs = auditLogs.filter(log => {
      const typeMatch = (logFilter === 'ALL') 
          || (logFilter === 'PRIZES' && ['SPIN', 'QUEST', 'ARCADE'].includes(log.action_type))
          || (logFilter === 'SHOP' && log.action_type === 'SHOP')
          || (logFilter === 'ADMIN' && ['ADMIN', 'SYSTEM'].includes(log.action_type));
      
      if (!typeMatch) return false;

      const search = logSearch.toLowerCase();
      if (!search) return true;

      return (
          log.details.toLowerCase().includes(search) || 
          log.user_name?.toLowerCase().includes(search) ||
          log.action_type.toLowerCase().includes(search)
      );
  });

  const getFilteredPending = () => {
      if (!searchQuery) return pendingQuests;
      return pendingQuests.filter(p => p.user_name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div className="pb-20 space-y-6">
       
       {/* Dashboard Tabs */}
       <div className="flex border-4 border-black bg-white flex-wrap">
           <button 
             onClick={() => setActiveTab('inbox')}
             className={`flex-1 min-w-[100px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'inbox' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
               <Inbox size={20}/> Inbox
               {pendingQuests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingQuests.length}</span>}
           </button>
           
           {/* Restricted Tabs - Managers Only */}
           {isManager && (
               <button 
                 onClick={() => setActiveTab('control')}
                 className={`flex-1 min-w-[100px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'control' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
               >
                   <Zap size={20}/> Controls
               </button>
           )}

           {isModerator && (
               <>
                   {isManager && (
                       <button 
                         onClick={() => setActiveTab('team')}
                         className={`flex-1 min-w-[100px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'team' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                       >
                           <BarChart3 size={20}/> Analytics
                       </button>
                   )}
                   <button 
                     onClick={() => setActiveTab('manage')}
                     className={`flex-1 min-w-[100px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                   >
                       <Users size={20}/> Staff
                   </button>
               </>
           )}

           <button 
             onClick={() => setActiveTab('logs')}
             className={`flex-1 min-w-[100px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'logs' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
               <FileText size={20}/> Logs
           </button>
       </div>

       {activeTab === 'inbox' && (
           <RetroCard title="Pending Approvals" className="bg-white">
               {/* Search */}
               <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center">
                   <div className="relative w-full flex-1">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                       <input 
                           type="text"
                           placeholder="Search users..."
                           className="w-full border-2 border-black pl-10 pr-4 py-2 font-bold"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                       />
                   </div>
               </div>

               {getFilteredPending().length === 0 ? (
                   <div className="text-center py-8 text-gray-500 italic">No pending quests found.</div>
               ) : (
                   <div className="space-y-3">
                       {getFilteredPending().map((p, i) => (
                           <div key={`${p.user_id}-${p.quest_id}`} className="bg-yellow-50 border-2 border-black p-3 flex justify-between items-center">
                               <div>
                                   <div className="font-bold">{p.user_name}</div>
                                   <div className="text-sm text-gray-600">Completed: {p.quest_title}</div>
                                   <div className="text-xs text-retro-goldDark font-bold mt-1">Reward: {p.reward_gold}G / {p.reward_xp}XP</div>
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                      onClick={() => handleReject(p.user_id, p.quest_id)}
                                      className="p-2 border-2 border-black bg-white hover:bg-red-100 text-red-600 font-bold"
                                      title="Reject"
                                   >
                                       <X size={16} />
                                   </button>
                                   <button 
                                      onClick={() => handleApprove(p.user_id, p.quest_id)}
                                      className="p-2 border-2 border-black bg-green-500 hover:bg-green-400 text-white font-bold flex items-center gap-1"
                                      title="Approve"
                                   >
                                       <Check size={16} /> Approve
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </RetroCard>
       )}

       {activeTab === 'control' && isManager && (
           <>
               <RetroCard title="Company Events (Buffs)" className="bg-purple-100 border-purple-900">
                    <div className="flex flex-col md:flex-row gap-4">
                        <button 
                           onClick={handleToggleDoubleXp}
                           className={`flex-1 p-4 border-4 border-black font-bold uppercase flex flex-col items-center gap-2 transition-all ${globalModifiers.xpMultiplier > 1 ? 'bg-green-500 text-white animate-pulse' : 'bg-white hover:bg-gray-100'}`}
                        >
                             <GraduationCap size={32} />
                             <span>Training Day (2x XP)</span>
                             {globalModifiers.xpMultiplier > 1 && <span className="text-[10px] bg-white text-black px-2 rounded-full">ACTIVE</span>}
                        </button>
                        <button 
                           onClick={handleToggleHappyHour}
                           className={`flex-1 p-4 border-4 border-black font-bold uppercase flex flex-col items-center gap-2 transition-all ${globalModifiers.goldMultiplier > 1 ? 'bg-yellow-400 text-black animate-pulse' : 'bg-white hover:bg-gray-100'}`}
                        >
                             <PartyPopper size={32} />
                             <span>Happy Hour (2x Gold)</span>
                             {globalModifiers.goldMultiplier > 1 && <span className="text-[10px] bg-black text-white px-2 rounded-full">ACTIVE</span>}
                        </button>
                    </div>
               </RetroCard>
               
               <RetroCard title="Environment Settings" className="bg-gray-100">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                           <h3 className="font-bold border-b-2 border-black">Time & Mode</h3>
                           <div className="flex items-center gap-2">
                               <input 
                                 type="time" 
                                 className="border-2 border-black p-2 flex-1"
                                 value={timeInput}
                                 onChange={e => setTimeInput(e.target.value)}
                               />
                               <button onClick={handleSetTime} className="bg-blue-600 text-white p-2 border-2 border-black font-bold hover:bg-blue-500">
                                   SET TIME
                               </button>
                           </div>
                           
                           <button 
                             onClick={toggleOverdrive}
                             className={`w-full p-2 border-2 border-black font-bold flex items-center justify-center gap-2 ${isOverdrive ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-300'}`}
                           >
                               <Zap size={16} /> {isOverdrive ? 'OVERDRIVE ACTIVE' : 'ENABLE OVERDRIVE'}
                           </button>
                       </div>

                       <div className="space-y-4">
                           <h3 className="font-bold border-b-2 border-black">Announcement (MOTD)</h3>
                           <div className="flex gap-2">
                               <input 
                                  type="text" 
                                  className="border-2 border-black p-2 flex-1"
                                  value={motdInput}
                                  onChange={e => setMotdInput(e.target.value)}
                                  placeholder="Broadcast message..."
                               />
                               <button onClick={handleSetMotd} className="bg-retro-gold text-black p-2 border-2 border-black hover:bg-yellow-400">
                                   <Megaphone size={20} />
                               </button>
                           </div>
                       </div>

                       <div className="space-y-4 md:col-span-2">
                           <div className="flex justify-between items-center border-b-2 border-black">
                               <h3 className="font-bold">World Weather</h3>
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                               {weatherOptions.map(opt => (
                                   <button
                                     key={opt.type}
                                     onClick={() => setWeather(opt.type)}
                                     className={`p-2 border-2 border-black font-bold text-xs uppercase flex flex-col items-center gap-1 justify-center ${weather === opt.type ? 'bg-retro-gold' : 'bg-white hover:bg-gray-100'}`}
                                     title={opt.perk}
                                   >
                                       {opt.icon} 
                                       <span>{opt.type}</span>
                                       <span className="text-[9px] bg-black text-white px-1 rounded">{opt.perk}</span>
                                   </button>
                               ))}
                           </div>
                       </div>
                   </div>
               </RetroCard>

               <RetroCard title="Quest Creator" className="bg-white">
                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                     <div>
                        <label className="block text-sm font-bold">Quest Title</label>
                        <input required className="w-full border-2 border-black p-2" value={title} onChange={e => setTitle(e.target.value)} />
                     </div>
                     <div>
                        <label className="block text-sm font-bold">Description</label>
                        <textarea required className="w-full border-2 border-black p-2" value={desc} onChange={e => setDesc(e.target.value)} />
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="block text-sm font-bold">Gold Reward</label>
                           <input type="number" className="w-full border-2 border-black p-2" value={gold} onChange={e => setGold(Number(e.target.value))} />
                        </div>
                        <div className="flex-1">
                           <label className="block text-sm font-bold">XP Reward</label>
                           <input type="number" className="w-full border-2 border-black p-2" value={xp} onChange={e => setXp(Number(e.target.value))} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold">Duration (Hours)</label>
                        <input type="number" className="w-full border-2 border-black p-2" value={duration} onChange={e => setDuration(Number(e.target.value))} min={1} max={72} />
                     </div>
                     <button type="submit" className="w-full bg-black text-white py-2 font-bold hover:bg-gray-800 flex justify-center items-center gap-2">
                        <PlusCircle size={16} /> POST QUEST
                     </button>
                  </form>
               </RetroCard>
           </>
       )}
       
       {activeTab === 'team' && isManager && teamStats && (
           <div className="space-y-6">
               {/* 1. OVERVIEW CARDS */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-blue-100 border-4 border-black p-3 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Active Shifts</h3>
                       <div className="text-2xl md:text-3xl font-bold flex justify-center items-center gap-2">
                           <Activity size={24} className="text-blue-600"/> {teamStats.activeShifts || 0}
                       </div>
                   </div>
                   <div className="bg-yellow-100 border-4 border-black p-3 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Total Gold</h3>
                       <div className="text-2xl md:text-3xl font-bold text-yellow-700 truncate">
                           {(teamStats.totalGoldInCirculation || 0).toLocaleString()}
                       </div>
                   </div>
                   <div className="bg-green-100 border-4 border-black p-3 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Total XP</h3>
                       <div className="text-2xl md:text-3xl font-bold text-green-700 truncate">
                           {(teamStats.totalXpGenerated || 0).toLocaleString()}
                       </div>
                   </div>
                   <div className="bg-red-100 border-4 border-black p-3 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Avg Morale</h3>
                       <div className="text-2xl md:text-3xl font-bold text-red-700">
                           {teamStats.avgHappiness || 0}%
                       </div>
                   </div>
               </div>

               {/* 2. ATTENDANCE & ECONOMY ROW */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Attendance Health */}
                    <RetroCard title="Attendance Health">
                         <div className="space-y-2 mt-2">
                            {(() => {
                                const stats = teamStats.attendanceStats || {early: 0, ontime: 0, late: 0, total: 1};
                                const earlyPct = (stats.early / stats.total) * 100;
                                const ontimePct = (stats.ontime / stats.total) * 100;
                                const latePct = (stats.late / stats.total) * 100;
                                return (
                                    <>
                                        <div className="flex h-8 w-full border-2 border-black bg-gray-200">
                                            {stats.early > 0 && <div style={{width: `${earlyPct}%`}} className="bg-blue-400 h-full"></div>}
                                            {stats.ontime > 0 && <div style={{width: `${ontimePct}%`}} className="bg-green-400 h-full"></div>}
                                            {stats.late > 0 && <div style={{width: `${latePct}%`}} className="bg-red-400 h-full"></div>}
                                        </div>
                                        <div className="flex justify-between text-xs font-bold uppercase mt-2">
                                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 border border-black"></div> Early</div>
                                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 border border-black"></div> On Time</div>
                                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 border border-black"></div> Late</div>
                                        </div>
                                    </>
                                );
                            })()}
                         </div>
                    </RetroCard>

                    {/* Quest Stats */}
                    <RetroCard title="Quest Performance">
                         <div className="flex justify-around items-center h-full pt-2">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{teamStats.questStats?.active || 0}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Active</div>
                            </div>
                            <div className="text-center border-l-2 border-gray-300 pl-4">
                                <div className="text-2xl font-bold text-yellow-600">{teamStats.questStats?.pending || 0}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Pending</div>
                            </div>
                            <div className="text-center border-l-2 border-gray-300 pl-4">
                                <div className="text-2xl font-bold text-green-600">{teamStats.questStats?.completed || 0}</div>
                                <div className="text-xs uppercase font-bold text-gray-500">Completed</div>
                            </div>
                         </div>
                    </RetroCard>
               </div>

               {/* 3. ECONOMY METRICS */}
               <RetroCard title="Economy Insights">
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <div className="flex justify-between text-xs uppercase font-bold mb-1">
                               <span>Inflation (Gold/User)</span>
                               <span>{teamStats.totalUsers > 0 ? Math.round(teamStats.totalGoldInCirculation / teamStats.totalUsers) : 0} G</span>
                           </div>
                           <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                               <div className="bg-yellow-500 h-full w-[60%]"></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs uppercase font-bold mb-1">
                               <span>Avg Employee Level</span>
                               <span>Lvl {teamStats.avgLevel}</span>
                           </div>
                           <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                               <div className="bg-blue-500 h-full w-[45%]"></div>
                           </div>
                       </div>
                   </div>
               </RetroCard>

               {/* 4. SUPERLATIVES */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {teamStats.topEarner && (
                       <div className="bg-yellow-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Top Earner</div>
                           <div className="font-bold text-lg">{teamStats.topEarner.name}</div>
                           <div className="text-retro-goldDark text-sm">{teamStats.topEarner.current_gold} G</div>
                       </div>
                   )}
                   {teamStats.highestLevel && (
                       <div className="bg-blue-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Highest Level</div>
                           <div className="font-bold text-lg">{teamStats.highestLevel.name}</div>
                           <div className="text-blue-600 text-sm">Lvl {teamStats.highestLevel.level}</div>
                       </div>
                   )}
                   {teamStats.mostKudos && (
                       <div className="bg-pink-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Most Loved</div>
                           <div className="font-bold text-lg">{teamStats.mostKudos.name}</div>
                           <div className="text-pink-600 text-sm">{teamStats.mostKudos.kudos_received} Kudos</div>
                       </div>
                   )}
               </div>
           </div>
       )}

       {activeTab === 'manage' && isModerator && teamStats && (
           <div className="space-y-6">
               <RetroCard title="Data Management" className="bg-white">
                   <p className="text-sm text-gray-600 mb-4">Export system data for backup or payroll. Import to restore state.</p>
                   <div className="flex flex-col gap-4">
                       <button 
                         onClick={handleExport}
                         className="flex-1 bg-green-600 text-white px-4 py-2 border-2 border-black font-bold uppercase flex justify-center items-center gap-2 hover:bg-green-500"
                       >
                           <Download size={16} /> Export Logs (CSV)
                       </button>
                       <div className="flex gap-4">
                           <button 
                             onClick={handleExportDb}
                             className="flex-1 bg-blue-600 text-white px-4 py-2 border-2 border-black font-bold uppercase flex justify-center items-center gap-2 hover:bg-blue-500"
                           >
                               <Database size={16} /> Backup DB (ZIP)
                           </button>
                           <button 
                             onClick={handleImportClick}
                             className="flex-1 bg-orange-600 text-white px-4 py-2 border-2 border-black font-bold uppercase flex justify-center items-center gap-2 hover:bg-orange-500"
                           >
                               <Upload size={16} /> Restore DB (Upload Files)
                           </button>
                           {/* Hidden File Input: MULTIPLE ALLOWED */}
                           <input 
                               type="file" 
                               ref={fileInputRef} 
                               onChange={handleFileChange} 
                               accept=".db,.db-wal,.db-shm,.zip" 
                               multiple
                               className="hidden"
                           />
                       </div>
                   </div>
               </RetroCard>

               <RetroCard title="Staff Management" className="bg-white">
                   <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="border-b-4 border-black bg-gray-100 text-black">
                                   <th className="p-2 font-bold uppercase text-sm text-black">User</th>
                                   <th className="p-2 font-bold uppercase text-sm text-black hidden md:table-cell">Role</th>
                                   <th className="p-2 font-bold uppercase text-sm text-black hidden md:table-cell">Perf</th>
                                   <th className="p-2 font-bold uppercase text-sm text-right text-black">Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                               {(teamStats.users || []).map((u: User) => (
                                   <tr key={u.id} className={`border-b-2 border-gray-200 ${u.isBanned ? 'bg-red-100' : 'hover:bg-yellow-50'}`}>
                                       <td className="p-3">
                                           <div className="font-bold flex items-center gap-2 text-black">
                                               {u.name}
                                               {u.isBanned && <span className="text-xs bg-red-600 text-white px-1">BANNED</span>}
                                           </div>
                                           <div className="text-xs text-gray-500">Lvl {u.level} • {u.current_gold}G</div>
                                       </td>
                                       <td className="p-3 uppercase text-xs font-bold text-black hidden md:table-cell">{u.role}</td>
                                       <td className="p-3 hidden md:table-cell">
                                            <div className="text-xs font-mono">
                                                <div title="XP">{u.current_xp} XP</div>
                                                <div title="Streak" className="text-orange-600">{u.streak} Days</div>
                                            </div>
                                       </td>
                                       <td className="p-3 text-right">
                                           <div className="flex justify-end gap-2">
                                               {isManager && (
                                                   <button 
                                                     onClick={() => setEditingUser(u)}
                                                     className="p-2 border-2 border-black bg-white hover:bg-gray-100 text-black"
                                                     title="Edit Profile"
                                                   >
                                                       <UserCog size={16} />
                                                   </button>
                                               )}
                                               {isManager && (
                                                   <button 
                                                     onClick={() => handleGiveBonus(u.id)}
                                                     className="p-2 border-2 border-black bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                                                     title="Give Bonus"
                                                   >
                                                       <Gift size={16} />
                                                   </button>
                                               )}
                                               {isModerator && (
                                                   <>
                                                       {isManager && (
                                                           <button 
                                                              onClick={() => setPunishMode({userId: u.id, type: 'hp', amount: 10})}
                                                              className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-800"
                                                              title="Punish (Smite)"
                                                           >
                                                               <Gavel size={16} />
                                                           </button>
                                                       )}
                                                       <button 
                                                          onClick={() => handleToggleBan(u.id)}
                                                          className="p-2 border-2 border-black bg-gray-800 text-white hover:bg-black"
                                                          title={u.isBanned ? "Unban User" : "Ban User"}
                                                       >
                                                           <Ban size={16} />
                                                       </button>
                                                       {isManager && (
                                                           <button 
                                                              onClick={() => handleDeleteUser(u.id, u.name)}
                                                              className="p-2 border-2 border-black bg-red-500 text-white hover:bg-red-600"
                                                              title="Delete User"
                                                           >
                                                               <Trash2 size={16} />
                                                           </button>
                                                       )}
                                                   </>
                                               )}
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </RetroCard>
           </div>
       )}

       {activeTab === 'logs' && (
           <RetroCard title="Activity Audit Logs" className="bg-white">
               {/* Log Filters */}
               <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between">
                   <div className="flex gap-2 overflow-x-auto pb-2">
                       {['ALL', 'PRIZES', 'SHOP', 'ADMIN'].map((filter) => (
                           <button
                               key={filter}
                               onClick={() => setLogFilter(filter as any)}
                               className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase flex items-center gap-1 ${
                                   logFilter === filter ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                               }`}
                           >
                               {filter === 'ALL' && <FileText size={12} />}
                               {filter === 'PRIZES' && <Gift size={12} />}
                               {filter === 'SHOP' && <Download size={12} className="rotate-180" />}
                               {filter === 'ADMIN' && <Gavel size={12} />}
                               {filter}
                           </button>
                       ))}
                   </div>
                   <div className="relative flex items-center gap-2">
                       <input 
                           type="text" 
                           placeholder="Search logs..." 
                           className="border-2 border-black p-1 pl-8 w-full md:w-64 font-mono text-sm"
                           value={logSearch}
                           onChange={e => setLogSearch(e.target.value)}
                       />
                       <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                       
                       {isManager && (
                           <button 
                               onClick={handleClearAllLogs}
                               className="bg-red-600 text-white px-3 py-1 border-2 border-black font-bold uppercase hover:bg-red-500 flex items-center gap-1 text-xs"
                               title="Clear All Logs (Requires Password)"
                           >
                               <Trash2 size={12} /> Clear All
                           </button>
                       )}
                   </div>
               </div>

               <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                       <thead>
                           <tr className="border-b-4 border-black bg-gray-100">
                               <th className="p-2 font-bold uppercase">Time</th>
                               <th className="p-2 font-bold uppercase">User</th>
                               <th className="p-2 font-bold uppercase">Action</th>
                               <th className="p-2 font-bold uppercase">Details</th>
                               <th className="p-2 font-bold uppercase text-right"></th>
                           </tr>
                       </thead>
                       <tbody>
                           {filteredLogs.length > 0 ? filteredLogs.map(log => (
                               <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 font-mono group">
                                   <td className="p-2 text-gray-600 whitespace-nowrap">
                                       {new Date(log.timestamp).toLocaleTimeString()}
                                   </td>
                                   <td className="p-2 font-bold">{log.user_name}</td>
                                   <td className="p-2">
                                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                           log.action_type === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                           log.action_type === 'SPIN' ? 'bg-purple-100 text-purple-600' :
                                           log.action_type === 'SHOP' ? 'bg-yellow-100 text-yellow-700' :
                                           'bg-blue-100 text-blue-600'
                                       }`}>
                                           {log.action_type}
                                       </span>
                                   </td>
                                   <td className="p-2 text-gray-800">{log.details}</td>
                                   <td className="p-2 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                       {isManager && (
                                           <button 
                                             onClick={() => handleDeleteLog(log.id)}
                                             className="text-gray-400 hover:text-red-500"
                                             title="Delete Log Entry"
                                           >
                                               <Trash2 size={14} />
                                           </button>
                                       )}
                                   </td>
                               </tr>
                           )) : (
                               <tr><td colSpan={5} className="p-4 text-center text-gray-500">No logs found for this filter.</td></tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </RetroCard>
       )}

       {/* Edit User Modal */}
       {editingUser && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
               <div className="bg-white border-4 border-black p-6 w-full max-w-sm">
                   <h3 className="text-xl font-bold uppercase mb-4">Edit User</h3>
                   <form onSubmit={handleEditSave} className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold uppercase">Display Name</label>
                           <input 
                             className="w-full border-2 border-black p-2" 
                             value={editingUser.name}
                             onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold uppercase">Role</label>
                           <select 
                             className="w-full border-2 border-black p-2"
                             value={editingUser.role}
                             onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}
                           >
                               <option value="employee">Employee</option>
                               <option value="moderator">Moderator</option>
                               <option value="manager">Manager</option>
                           </select>
                       </div>
                       <div className="flex gap-2 justify-end">
                           <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-red-500 font-bold">Cancel</button>
                           <button type="submit" className="px-4 py-2 bg-green-500 text-white border-2 border-black font-bold flex items-center gap-2">
                               <Save size={16} /> Save
                           </button>
                       </div>
                   </form>
               </div>
           </div>
       )}

       {/* Punish Modal */}
       {punishMode && (
           <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
               <div className="bg-white border-4 border-black p-6 w-full max-w-sm">
                   <h3 className="text-xl font-bold uppercase mb-4 text-red-600 flex items-center gap-2">
                       <Gavel /> Admin Punishment
                   </h3>
                   <p className="text-sm mb-4">Select penalty for user ID: {punishMode.userId}</p>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-xs font-bold uppercase">Penalty Type</label>
                           <select 
                             className="w-full border-2 border-black p-2"
                             value={punishMode.type}
                             onChange={e => setPunishMode({...punishMode, type: e.target.value as any})}
                           >
                               <option value="hp">Damage HP (Injury)</option>
                               <option value="gold">Fine Gold</option>
                               <option value="xp">Dock XP</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-xs font-bold uppercase">Amount</label>
                           <input 
                             type="number"
                             className="w-full border-2 border-black p-2" 
                             value={punishMode.amount}
                             onChange={e => setPunishMode({...punishMode, amount: Number(e.target.value)})}
                           />
                       </div>
                       <div className="flex gap-2 justify-end">
                           <button type="button" onClick={() => setPunishMode(null)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                           <button type="button" onClick={handlePunish} className="px-4 py-2 bg-red-600 text-white border-2 border-black font-bold uppercase">
                               Apply Penalty
                           </button>
                       </div>
                   </div>
               </div>
           </div>
       )}

    </div>
  );
};
