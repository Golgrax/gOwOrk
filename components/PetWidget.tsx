
import React from 'react';
import { useGame } from '../context/GameContext';
import { Dog, Bone } from 'lucide-react';

export const PetWidget: React.FC = () => {
  const { user, feedPet } = useGame();

  if (!user || !user.pet) return null;

  const hungerColor = user.pet.hunger > 60 ? 'bg-green-500' : user.pet.hunger > 30 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="bg-orange-50 border-4 border-black p-4 mb-6 pixel-shadow relative overflow-hidden">
        <div className="flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-3">
                <div className="bg-orange-200 p-2 border-2 border-black rounded-full">
                    <Dog size={24} className="text-orange-900" />
                </div>
                <div>
                    <h3 className="font-bold uppercase leading-none">{user.pet.name}</h3>
                    <div className="text-xs text-gray-500 font-mono mt-1">LVL 1 COMPANION</div>
                </div>
            </div>
            
            <div className="text-right">
                <button 
                    onClick={feedPet}
                    disabled={user.pet.hunger >= 100}
                    className="bg-retro-gold hover:bg-yellow-400 text-black px-3 py-1 border-2 border-black text-xs font-bold uppercase flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Bone size={12} /> Feed (10G)
                </button>
            </div>
        </div>

        {/* Hunger Bar */}
        <div className="mt-3">
            <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                <span>Hunger</span>
                <span>{user.pet.hunger}%</span>
            </div>
            <div className="w-full h-3 border-2 border-black bg-gray-300">
                <div 
                    className={`h-full ${hungerColor} transition-all duration-500`} 
                    style={{ width: `${user.pet.hunger}%` }}
                ></div>
            </div>
        </div>
        
        {/* Decorative paw prints */}
        <div className="absolute -bottom-2 -right-2 text-orange-200 transform rotate-12 opacity-50 pointer-events-none">
            <Dog size={64} />
        </div>
    </div>
  );
};
