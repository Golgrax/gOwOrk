import React from 'react';
import { useGame } from '../context/GameContext';
import { Skull, Swords } from 'lucide-react';

export const BossWidget: React.FC = () => {
  const { bossEvent } = useGame();

  if (!bossEvent.isActive && bossEvent.currentHp === bossEvent.maxHp) return null;

  const hpPercent = (bossEvent.currentHp / bossEvent.maxHp) * 100;

  return (
    <div className="bg-gradient-to-r from-red-900 to-black border-4 border-black pixel-shadow p-4 mb-6 text-white relative overflow-hidden">
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 bg-red-600 opacity-10 animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-2">
            <h3 className="text-xl font-bold uppercase flex items-center gap-2 text-red-400">
                <Skull className="animate-bounce" /> {bossEvent.name}
            </h3>
            <span className="text-sm font-mono text-gray-300">RAID BOSS EVENT</span>
        </div>
        
        <p className="text-xs text-gray-400 mb-2 italic">{bossEvent.description}</p>

        {/* HP Bar */}
        <div className="w-full h-8 bg-black border-2 border-red-500 relative">
            <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${hpPercent}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-sm tracking-widest pixel-text-shadow">
                {bossEvent.currentHp} / {bossEvent.maxHp} HP
            </div>
        </div>

        {bossEvent.currentHp === 0 && (
            <div className="mt-2 text-center text-yellow-400 font-bold animate-pulse">
                BOSS DEFEATED! +500 GOLD
            </div>
        )}
      </div>
    </div>
  );
};