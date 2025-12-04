
import React from 'react';
import { useGame } from '../context/GameContext';
import { RetroCard } from './RetroCard';
import { Lock, Unlock, Star } from 'lucide-react';

export const SkillTree: React.FC = () => {
  const { user, skills, unlockSkill } = useGame();

  if (!user) return null;

  return (
    <div className="pb-24">
      <div className="bg-white p-4 border-4 border-black pixel-shadow mb-6">
         <h2 className="text-2xl font-bold uppercase flex items-center gap-2">
            <Star className="text-retro-gold" /> Career Ladder (Skills)
         </h2>
         <p className="text-sm text-gray-600">Level up to earn Skill Points (SP) and unlock passive perks.</p>
         <div className="mt-4 flex justify-between items-center bg-gray-100 p-2 border-2 border-black">
             <div className="font-bold">Current Level: {user.level}</div>
             <div className="font-bold text-blue-600">Available SP: {user.skill_points}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
          {skills.map(skill => {
              const isUnlocked = user.unlocked_skills.includes(skill.id);
              const canAfford = user.skill_points >= skill.cost;
              const levelMet = user.level >= skill.requiredLevel;
              const isLocked = !isUnlocked;

              return (
                  <RetroCard 
                    key={skill.id} 
                    className={`relative ${isUnlocked ? 'bg-green-50' : (levelMet ? 'bg-white' : 'bg-gray-200')}`}
                  >
                      <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                              <div className="text-4xl bg-white border-2 border-black w-16 h-16 flex items-center justify-center rounded">
                                  {skill.icon}
                              </div>
                              <div>
                                  <h3 className="text-lg font-bold flex items-center gap-2">
                                      {skill.name}
                                      {isUnlocked && <Unlock size={16} className="text-green-500" />}
                                  </h3>
                                  <p className="text-sm text-gray-700">{skill.description}</p>
                                  <div className="text-xs mt-1 font-mono text-gray-500">
                                      Req: Level {skill.requiredLevel} • Cost: {skill.cost} SP
                                  </div>
                              </div>
                          </div>

                          {isLocked ? (
                              <button 
                                onClick={() => unlockSkill(skill.id)}
                                disabled={!canAfford || !levelMet}
                                className={`
                                  px-4 py-2 font-bold border-2 border-black text-sm uppercase flex items-center gap-2
                                  ${canAfford && levelMet 
                                    ? 'bg-retro-gold hover:bg-yellow-400' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                                `}
                              >
                                {levelMet ? (canAfford ? 'Unlock' : 'Need SP') : 'Lvl Low'} <Lock size={14} />
                              </button>
                          ) : (
                              <div className="px-4 py-2 font-bold text-green-600 border-2 border-green-600 uppercase text-sm">
                                  Active
                              </div>
                          )}
                      </div>
                  </RetroCard>
              );
          })}
      </div>
    </div>
  );
};
