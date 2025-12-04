
import React from 'react';
import { useGame } from '../context/GameContext';
import { Flame, Zap, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, motd, globalModifiers } = useGame();

  if (!user) return null;

  return (
    <div className="sticky top-0 z-40 shadow-lg">
      <header className="p-4 bg-white border-b-4 border-black flex flex-wrap gap-4 justify-between items-center relative z-20">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-gray-200 border-2 border-black flex items-center justify-center font-bold text-2xl relative">
             {user.level}
             {user.streak > 0 && (
                 <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border border-black animate-bounce" title="Current Streak">
                     <Flame size={10} fill="white" />
                 </div>
             )}
           </div>
           <div>
             <h1 className="text-xl font-bold uppercase leading-none">{user.name}</h1>
             <div className="w-32 h-4 border-2 border-black bg-gray-300 mt-1 relative">
                <div 
                  className="h-full bg-blue-500 absolute left-0 top-0 transition-all duration-500" 
                  style={{ width: `${Math.min(100, (user.current_xp / (user.level * 100)) * 100)}%` }}
                ></div>
                <span className="absolute inset-0 text-[10px] text-center font-bold leading-3 text-white drop-shadow-md">
                  XP {user.current_xp} / {user.level * 100}
                </span>
             </div>
           </div>
         </div>

         {/* Active Global Event Badge */}
         {globalModifiers.activeEventName && (
             <div className="bg-purple-600 text-white px-2 py-1 border-2 border-black font-bold uppercase text-xs flex items-center gap-1 animate-pulse">
                 <Sparkles size={12} /> {globalModifiers.activeEventName}
             </div>
         )}

         <div className="text-right">
            <div className="font-bold text-retro-goldDark text-xl">
               GP {user.current_gold}
            </div>
            {user.streak > 1 && (
               <div className="text-xs text-orange-600 font-bold flex items-center justify-end gap-1">
                   <Flame size={12} /> {user.streak} Day Streak
               </div>
            )}
         </div>
      </header>
      
      {/* MOTD Ticker */}
      <div className="bg-black text-retro-gold text-xs py-1 border-b-4 border-black overflow-hidden relative z-10">
          <div className="whitespace-nowrap animate-[marquee_15s_linear_infinite] px-4 font-mono">
              📢 {motd}
          </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};
