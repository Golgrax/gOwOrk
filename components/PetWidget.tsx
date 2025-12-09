


import React from 'react';
import { useGame } from '../context/GameContext';
import { Dog, Bone, Sparkles, TrendingUp } from 'lucide-react';

export const PetWidget: React.FC = () => {
  const { user, feedPet } = useGame();

  if (!user || !user.pet) return null;

  // Handle potential old data where level/xp might be missing
  const petLevel = user.pet.level || 1;
  const petXp = user.pet.current_xp || 0;
  const xpNeeded = petLevel * 100;
  const xpPercent = Math.min(100, (petXp / xpNeeded) * 100);
  const activePerk = petLevel * 5; // 5% per level

  // Hunger logic
  const isHungry = user.pet.hunger < 20;
  const hungerColor = user.pet.hunger > 60 ? 'bg-green-500' : user.pet.hunger > 20 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse';

  return (
    <div className="bg-orange-50 border-4 border-black p-4 mb-6 pixel-shadow relative overflow-hidden">
        <div className="flex justify-between items-start z-10 relative mb-4">
            <div className="flex items-center gap-3">
                <div className="bg-orange-200 p-2 border-2 border-black rounded-full relative">
                    <Dog size={24} className="text-orange-900" />
                    {isHungry && (
                        <div className="absolute -top-1 -right-1 text-red-600 bg-white border border-red-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">!</div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold uppercase leading-none text-lg">{user.pet.name}</h3>
                    <div className="text-xs text-orange-800 font-bold flex items-center gap-1">
                        <Sparkles size={10} /> LVL {petLevel} COMPANION
                    </div>
                </div>
            </div>
            
            <div className="text-right">
                <button 
                    onClick={feedPet}
                    disabled={user.pet.hunger >= 100}
                    className="bg-retro-gold hover:bg-yellow-400 text-black px-3 py-1 border-2 border-black text-xs font-bold uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                >
                    <Bone size={12} /> Treat (20G)
                </button>
            </div>
        </div>

        <div className="space-y-3">
            {/* Hunger Bar */}
            <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>Satiety</span>
                    <span className={isHungry ? 'text-red-600' : 'text-gray-600'}>{Math.round(user.pet.hunger)}%</span>
                </div>
                <div className="w-full h-3 border-2 border-black bg-gray-300">
                    <div 
                        className={`h-full ${hungerColor} transition-all duration-500`} 
                        style={{ width: `${user.pet.hunger}%` }}
                    ></div>
                </div>
            </div>

            {/* XP Bar */}
            <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                    <span>Experience</span>
                    <span className="text-blue-600">{Math.floor(petXp)} / {xpNeeded} XP</span>
                </div>
                <div className="w-full h-2 border-2 border-black bg-gray-300">
                    <div 
                        className="h-full bg-blue-500 transition-all duration-500" 
                        style={{ width: `${xpPercent}%` }}
                    ></div>
                </div>
            </div>
        </div>

        {/* Active Perk Status */}
        <div className={`mt-3 p-2 border-2 border-black/10 flex items-center justify-between text-xs font-bold uppercase ${isHungry ? 'bg-gray-200 text-gray-500' : 'bg-white text-green-700'}`}>
            <span className="flex items-center gap-1"><TrendingUp size={12} /> Active Perk:</span>
            {isHungry ? (
                <span>Too Hungry to help...</span>
            ) : (
                <span>+{activePerk}% GOLD/XP BOOST</span>
            )}
        </div>
        
        {/* Decorative paw prints */}
        <div className="absolute -bottom-2 -right-2 text-orange-200 transform rotate-12 opacity-50 pointer-events-none">
            <Dog size={64} />
        </div>
    </div>
  );
};