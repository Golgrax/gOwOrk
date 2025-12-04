
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RetroCard } from './RetroCard';
import { PlusCircle, CloudRain, Sun, Snowflake, Zap, CloudFog, Flame, Clock, Megaphone, Users, Activity, BarChart3, Gift, PartyPopper, GraduationCap, Download, Ban, Gavel, UserCog, Save } from 'lucide-react';
import { WeatherType, TeamStats, User } from '../types';

export const ManagerDashboard: React.FC = () => {
  const { createQuest, setWeather, weather, toggleOverdrive, isOverdrive, setTimeOffset, setMotd, motd, getTeamData, giveBonus, setGlobalEvent, globalModifiers, exportData, toggleBan, updateUser, punishUser, addToast, playSfx } = useGame();
  const [activeTab, setActiveTab] = useState<'control' | 'team' | 'manage'>('control');
  
  // Control State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [gold, setGold] = useState(10);
  const [xp, setXp] = useState(10);
  const [duration, setDuration] = useState(24); // Hours
  const [timeInput, setTimeInput] = useState('');
  const [motdInput, setMotdInput] = useState(motd);

  // Team State
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);

  // Manage Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [punishMode, setPunishMode] = useState<{userId: string, type: 'gold' | 'xp' | 'hp', amount: number} | null>(null);

  useEffect(() => {
      if (activeTab === 'team' || activeTab === 'manage') {
          getTeamData().then(setTeamStats);
      }
  }, [activeTab]);

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

  const handleToggleBan = async (userId: string) => {
      if(window.confirm("Are you sure you want to ban/unban this user?")) {
          await toggleBan(userId);
          getTeamData().then(setTeamStats);
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

  const weatherOptions: { type: WeatherType, icon: React.ReactNode }[] = [
      { type: 'Sunny', icon: <Sun size={16} /> },
      { type: 'Rainy', icon: <CloudRain size={16} /> },
      { type: 'Snowy', icon: <Snowflake size={16} /> },
      { type: 'Heatwave', icon: <Flame size={16} /> },
      { type: 'Foggy', icon: <CloudFog size={16} /> },
  ];

  return (
    <div className="pb-20 space-y-6">
       
       {/* Dashboard Tabs */}
       <div className="flex border-4 border-black bg-white flex-wrap">
           <button 
             onClick={() => setActiveTab('control')}
             className={`flex-1 min-w-[120px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'control' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
               <Zap size={20}/> Controls
           </button>
           <button 
             onClick={() => setActiveTab('team')}
             className={`flex-1 min-w-[120px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'team' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
               <BarChart3 size={20}/> Analytics
           </button>
           <button 
             onClick={() => setActiveTab('manage')}
             className={`flex-1 min-w-[120px] p-3 font-bold uppercase flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
           >
               <Users size={20}/> HR Dept
           </button>
       </div>

       {activeTab === 'control' && (
           <>
               <RetroCard title="Company Events (Buffs)" className="bg-purple-100 border-purple-900">
                    <div className="flex flex-col md:flex-row gap-4">
                        <button 
                           onClick={() => setGlobalEvent(globalModifiers.activeEventName?.includes('Training') ? 'none' : 'double_xp')}
                           className={`flex-1 p-4 border-4 border-black font-bold uppercase flex flex-col items-center gap-2 transition-all ${globalModifiers.xpMultiplier > 1 ? 'bg-green-500 text-white animate-pulse' : 'bg-white hover:bg-gray-100'}`}
                        >
                             <GraduationCap size={32} />
                             <span>Training Day (2x XP)</span>
                        </button>
                        <button 
                           onClick={() => setGlobalEvent(globalModifiers.activeEventName?.includes('Happy') ? 'none' : 'happy_hour')}
                           className={`flex-1 p-4 border-4 border-black font-bold uppercase flex flex-col items-center gap-2 transition-all ${globalModifiers.goldMultiplier > 1 ? 'bg-yellow-400 text-black animate-pulse' : 'bg-white hover:bg-gray-100'}`}
                        >
                             <PartyPopper size={32} />
                             <span>Happy Hour (2x Gold)</span>
                        </button>
                    </div>
               </RetroCard>
               
               {/* Corporate Actions section removed */}

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
                           <h3 className="font-bold border-b-2 border-black">World Weather</h3>
                           <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                               {weatherOptions.map(opt => (
                                   <button
                                     key={opt.type}
                                     onClick={() => setWeather(opt.type)}
                                     className={`p-2 border-2 border-black font-bold text-xs uppercase flex items-center gap-1 justify-center ${weather === opt.type ? 'bg-retro-gold' : 'bg-white hover:bg-gray-100'}`}
                                   >
                                       {opt.icon} {opt.type}
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
       
       {activeTab === 'team' && (
           <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-100 border-4 border-black p-4 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Active Shifts</h3>
                       <div className="text-3xl font-bold flex justify-center items-center gap-2">
                           <Activity size={24} className="text-blue-600"/> {teamStats?.activeShifts || 0} / {teamStats?.totalUsers || 0}
                       </div>
                   </div>
                   <div className="bg-yellow-100 border-4 border-black p-4 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Total Payroll</h3>
                       <div className="text-3xl font-bold text-yellow-700">
                           {teamStats?.totalGoldInCirculation.toLocaleString()} G
                       </div>
                   </div>
                   <div className="bg-green-100 border-4 border-black p-4 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Productivity (XP)</h3>
                       <div className="text-3xl font-bold text-green-700">
                           {teamStats?.totalXpGenerated.toLocaleString()} XP
                       </div>
                   </div>
                   <div className="bg-red-100 border-4 border-black p-4 text-center">
                       <h3 className="text-xs uppercase font-bold text-gray-500 mb-1">Avg Happiness</h3>
                       <div className="text-3xl font-bold text-red-700">
                           {teamStats?.avgHappiness || 0}%
                       </div>
                   </div>
               </div>
               
               {/* Advanced Charts (Visualized via CSS widths) */}
               <RetroCard title="Productivity Metrics" className="bg-white">
                   <div className="space-y-4">
                       <div>
                           <div className="flex justify-between text-xs uppercase font-bold mb-1">
                               <span>Budget Utilization</span>
                               <span>76%</span>
                           </div>
                           <div className="w-full bg-gray-200 h-4 border-2 border-black">
                               <div className="bg-yellow-500 h-full w-[76%]"></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs uppercase font-bold mb-1">
                               <span>Server Load</span>
                               <span>42%</span>
                           </div>
                           <div className="w-full bg-gray-200 h-4 border-2 border-black">
                               <div className="bg-blue-500 h-full w-[42%]"></div>
                           </div>
                       </div>
                       <div>
                           <div className="flex justify-between text-xs uppercase font-bold mb-1">
                               <span>Employee Morale</span>
                               <span>{teamStats?.avgHappiness || 0}%</span>
                           </div>
                           <div className="w-full bg-gray-200 h-4 border-2 border-black">
                               <div className={`h-full w-[${teamStats?.avgHappiness || 0}%] ${Number(teamStats?.avgHappiness) < 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${teamStats?.avgHappiness}%`}}></div>
                           </div>
                       </div>
                   </div>
               </RetroCard>

               {/* Employee Superlatives */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {teamStats?.topEarner && (
                       <div className="bg-yellow-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Top Earner</div>
                           <div className="font-bold text-lg">{teamStats.topEarner.name}</div>
                           <div className="text-retro-goldDark text-sm">{teamStats.topEarner.current_gold} G</div>
                       </div>
                   )}
                   {teamStats?.highestLevel && (
                       <div className="bg-blue-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Highest Level</div>
                           <div className="font-bold text-lg">{teamStats.highestLevel.name}</div>
                           <div className="text-blue-600 text-sm">Lvl {teamStats.highestLevel.level}</div>
                       </div>
                   )}
                   {teamStats?.mostKudos && (
                       <div className="bg-pink-50 border-4 border-black p-3 text-center">
                           <div className="text-xs font-bold text-gray-500 uppercase">Most Loved</div>
                           <div className="font-bold text-lg">{teamStats.mostKudos.name}</div>
                           <div className="text-pink-600 text-sm">{teamStats.mostKudos.kudos_received} Kudos</div>
                       </div>
                   )}
               </div>
           </div>
       )}

       {activeTab === 'manage' && (
           <div className="space-y-6">
               <RetroCard title="Data Management" className="bg-white">
                   <p className="text-sm text-gray-600 mb-4">Export attendance logs for payroll processing.</p>
                   <button 
                     onClick={handleExport}
                     className="bg-green-600 text-white px-4 py-2 border-2 border-black font-bold uppercase flex items-center gap-2 hover:bg-green-500"
                   >
                       <Download size={16} /> Export Logs (CSV)
                   </button>
               </RetroCard>

               <RetroCard title="Staff Management" className="bg-white">
                   <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                           <thead>
                               <tr className="border-b-4 border-black bg-gray-100 text-black">
                                   <th className="p-2 font-bold uppercase text-sm text-black">User</th>
                                   <th className="p-2 font-bold uppercase text-sm text-black">Role</th>
                                   <th className="p-2 font-bold uppercase text-sm text-right text-black">Actions</th>
                               </tr>
                           </thead>
                           <tbody>
                               {teamStats?.users.map(u => (
                                   <tr key={u.id} className={`border-b-2 border-gray-200 ${u.isBanned ? 'bg-red-100' : 'hover:bg-yellow-50'}`}>
                                       <td className="p-3">
                                           <div className="font-bold flex items-center gap-2 text-black">
                                               {u.name}
                                               {u.isBanned && <span className="text-xs bg-red-600 text-white px-1">BANNED</span>}
                                           </div>
                                           <div className="text-xs text-gray-500">Lvl {u.level} • {u.current_gold}G</div>
                                       </td>
                                       <td className="p-3 uppercase text-xs font-bold text-black">{u.role}</td>
                                       <td className="p-3 text-right">
                                           <div className="flex justify-end gap-2">
                                               <button 
                                                 onClick={() => setEditingUser(u)}
                                                 className="p-2 border-2 border-black bg-white hover:bg-gray-100 text-black"
                                                 title="Edit Profile"
                                               >
                                                   <UserCog size={16} />
                                               </button>
                                               <button 
                                                 onClick={() => handleGiveBonus(u.id)}
                                                 className="p-2 border-2 border-black bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                                                 title="Give Bonus"
                                               >
                                                   <Gift size={16} />
                                               </button>
                                               <button 
                                                  onClick={() => setPunishMode({userId: u.id, type: 'hp', amount: 10})}
                                                  className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-800"
                                                  title="Punish (Smite)"
                                               >
                                                   <Gavel size={16} />
                                               </button>
                                               <button 
                                                  onClick={() => handleToggleBan(u.id)}
                                                  className="p-2 border-2 border-black bg-gray-800 text-white hover:bg-black"
                                                  title={u.isBanned ? "Unban User" : "Ban User"}
                                               >
                                                   <Ban size={16} />
                                               </button>
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
