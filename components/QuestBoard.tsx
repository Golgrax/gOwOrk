
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { RetroCard } from './RetroCard';
import { CheckCircle, ShieldAlert, Star, RefreshCw, Lock, Clock } from 'lucide-react';

export const QuestBoard: React.FC = () => {
  const { activeQuests, submitQuest, userQuestStatuses, user, nextQuestRefresh, isShiftActive } = useGame();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
      const updateTimer = () => {
          const diff = nextQuestRefresh - Date.now();
          if (diff <= 0) {
              setTimeLeft('Ready');
          } else {
              const h = Math.floor(diff / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              setTimeLeft(`${h}h ${m}m`);
          }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000); // Update every minute
      return () => clearInterval(interval);
  }, [nextQuestRefresh]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold uppercase border-b-4 border-black pb-1">Quest Board</h2>
        <div className="flex flex-col items-end">
           <div className="flex items-center gap-2 text-retro-goldDark font-bold">
             <span className="text-xl">💰 {user?.current_gold}</span>
           </div>
           <div className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw size={10} /> New in: {timeLeft}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {activeQuests.map((quest) => {
          const status = userQuestStatuses[quest.id] || 'active'; // 'active', 'pending', 'approved'
          const isCompleted = status === 'approved';
          const isPending = status === 'pending';
          const isUrgent = quest.type === 'Urgent';

          return (
            <RetroCard 
              key={quest.id} 
              className={`${isCompleted ? 'opacity-60 bg-gray-200' : ''}`}
              variant={isUrgent ? 'danger' : 'default'}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isUrgent && <ShieldAlert className="text-retro-red" size={20} />}
                    {quest.type === 'Party' && <Star className="text-blue-500" size={20} />}
                    <h3 className={`font-bold text-lg ${isCompleted ? 'line-through' : ''}`}>
                      {quest.title}
                    </h3>
                    <span className="text-xs bg-black text-white px-2 py-0.5 ml-2 uppercase">{quest.type}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{quest.description}</p>
                  <div className="text-xs font-bold text-retro-goldDark">
                    REWARD: {quest.reward_gold} GOLD / {quest.reward_xp} XP
                  </div>
                </div>

                <button
                  onClick={() => submitQuest(quest.id)}
                  disabled={isCompleted || isPending || !isShiftActive}
                  className={`
                    ml-4 px-4 py-2 text-sm font-bold border-2 border-black pixel-shadow flex items-center gap-2
                    ${isCompleted 
                      ? 'bg-gray-400 text-gray-700 cursor-default shadow-none translate-y-1 translate-x-1' 
                      : isPending 
                        ? 'bg-yellow-300 text-yellow-800 cursor-not-allowed'
                        : !isShiftActive
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-retro-green hover:bg-green-400 text-black active:translate-y-1 active:shadow-none'
                    }
                  `}
                >
                  {!isShiftActive && !isCompleted && !isPending ? <Lock size={14} /> : null}
                  {isCompleted ? 'DONE' : isPending ? <><Clock size={14}/> PENDING</> : 'COMPLETE'}
                </button>
              </div>
            </RetroCard>
          );
        })}
      </div>
    </div>
  );
};
