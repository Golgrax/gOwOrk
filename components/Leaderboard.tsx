
import React from 'react';
import { useGame } from '../context/GameContext';
import { Trophy, Medal, Hand, Heart } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const { leaderboard, user, sendKudos } = useGame();

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white p-4 border-4 border-black pixel-shadow mb-6 text-center">
         <h2 className="text-2xl font-bold uppercase flex justify-center items-center gap-2">
            <Trophy className="text-retro-gold" /> Leaderboard
         </h2>
      </div>

      <div className="space-y-2">
         {leaderboard.map((u, index) => {
            const isMe = u.id === user?.id;
            return (
               <div 
                 key={u.id} 
                 className={`flex items-center p-4 border-4 border-black pixel-shadow ${
                    isMe ? 'bg-yellow-50 border-retro-gold' : 'bg-white/90'
                 }`}
               >
                  <div className="w-12 text-2xl font-bold text-gray-400">
                     #{index + 1}
                  </div>
                  <div className="flex-1">
                     <div className="font-bold text-lg flex items-center gap-2">
                        {u.name}
                        {index === 0 && <Medal className="text-retro-gold" size={16} />}
                     </div>
                     <div className="text-xs text-gray-500 uppercase flex gap-2">
                         <span>{u.role} • Lvl {u.level}</span>
                         {u.kudos_received > 0 && (
                             <span className="text-pink-500 flex items-center gap-1 font-bold">
                                 <Heart size={10} fill="currentColor" /> {u.kudos_received}
                             </span>
                         )}
                     </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                     <div className="font-bold text-blue-600">{u.current_xp} XP</div>
                     
                     {!isMe && (
                         <button 
                           onClick={() => sendKudos(u.id)}
                           className="bg-gray-100 p-2 border-2 border-black hover:bg-pink-100 hover:text-pink-600 transition-colors"
                           title="Send Kudos (+XP)"
                         >
                            <Hand size={16} />
                         </button>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
    </div>
  );
};
