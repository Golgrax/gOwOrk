import React from 'react';
import { useGame } from '../context/GameContext';
import { gameService } from '../services/gameService';
import { RetroCard } from './RetroCard';
import { User, Trophy, Flame, Calendar, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useGame();
  const allAchievements = gameService.getAllAchievements();

  if (!user) return null;

  return (
    <div className="space-y-6 pb-20">
       {/* Stats Header */}
       <div className="bg-white border-4 border-black pixel-shadow p-6 text-center">
          <div className="inline-block p-4 rounded-full bg-gray-100 border-4 border-black mb-4">
              <User size={48} className="text-gray-700" />
          </div>
          <h2 className="text-3xl font-bold uppercase">{user.name}</h2>
          <div className="text-gray-500 uppercase font-bold mb-4">{user.role} - Level {user.level}</div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-blue-50 p-2 border-2 border-blue-200">
                  <div className="text-xs text-gray-500 uppercase flex items-center gap-1"><Shield size={12}/> Total XP</div>
                  <div className="font-bold text-xl text-blue-600">{user.current_xp}</div>
              </div>
              <div className="bg-orange-50 p-2 border-2 border-orange-200">
                  <div className="text-xs text-gray-500 uppercase flex items-center gap-1"><Flame size={12}/> Streak</div>
                  <div className="font-bold text-xl text-orange-600">{user.streak} Days</div>
              </div>
          </div>
       </div>

       {/* Achievements Grid */}
       <div>
          <h3 className="text-xl font-bold uppercase mb-4 flex items-center gap-2">
              <Trophy className="text-retro-gold" /> Achievements
          </h3>
          <div className="grid grid-cols-1 gap-4">
              {allAchievements.map(ach => {
                  const unlocked = user.achievements.includes(ach.id);
                  return (
                      <RetroCard key={ach.id} className={unlocked ? 'bg-yellow-50' : 'bg-gray-100 opacity-60'}>
                          <div className="flex items-center gap-4">
                              <div className={`text-4xl ${unlocked ? '' : 'grayscale'}`}>{ach.icon}</div>
                              <div>
                                  <h4 className="font-bold">{ach.name}</h4>
                                  <p className="text-xs text-gray-600">{ach.description}</p>
                                  {unlocked ? (
                                      <span className="text-[10px] bg-green-500 text-white px-1 font-bold uppercase">Unlocked</span>
                                  ) : (
                                      <span className="text-[10px] bg-gray-400 text-white px-1 font-bold uppercase">Locked</span>
                                  )}
                              </div>
                          </div>
                      </RetroCard>
                  );
              })}
          </div>
       </div>
    </div>
  );
};