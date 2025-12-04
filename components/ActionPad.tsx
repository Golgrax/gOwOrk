
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Coffee, Armchair, Joystick, Lock, Clock, Ban } from 'lucide-react';

interface ActionPadProps {
    onOpenArcade?: () => void;
}

export const ActionPad: React.FC<ActionPadProps> = ({ onOpenArcade }) => {
  const { performWorkAction, takeBreak, user, weather, isShiftActive, globalModifiers, addToast } = useGame();
  const [breakCooldown, setBreakCooldown] = useState(0);
  const [arcadeCooldownStr, setArcadeCooldownStr] = useState<string | null>(null);

  useEffect(() => {
      let interval: any;
      if (breakCooldown > 0) {
          interval = setInterval(() => setBreakCooldown(p => p - 1), 1000);
      }
      return () => clearInterval(interval);
  }, [breakCooldown]);

  // Arcade Timer
  useEffect(() => {
    const updateArcadeTimer = () => {
        if (!user || !user.last_arcade_play_time) {
            setArcadeCooldownStr(null);
            return;
        }

        const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
        const diff = Date.now() - user.last_arcade_play_time;
        
        if (diff < COOLDOWN_MS) {
            const remaining = COOLDOWN_MS - diff;
            const h = Math.floor(remaining / (1000 * 60 * 60));
            const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            setArcadeCooldownStr(`${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
        } else {
            setArcadeCooldownStr(null);
        }
    };

    updateArcadeTimer();
    const interval = setInterval(updateArcadeTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.last_arcade_play_time]);

  const handleBreak = () => {
      if (breakCooldown === 0 && isShiftActive) {
          takeBreak();
          setBreakCooldown(60);
      }
  };

  const handleWork = () => {
      if (breakCooldown > 0) {
          addToast("You are on break! Relax.", "error");
          return;
      }
      if (isShiftActive) performWorkAction();
  }

  const handleArcade = () => {
      if (isShiftActive && onOpenArcade && !arcadeCooldownStr) onOpenArcade();
  }

  if (!user) return null;

  const hasGoldBoost = user.unlocked_skills.includes('skill_barista_mastery') || globalModifiers.goldMultiplier > 1;
  const hasXpBoost = user.unlocked_skills.includes('skill_fast_learner') || globalModifiers.xpMultiplier > 1;

  const isOnBreak = breakCooldown > 0;

  return (
    <div className={`grid grid-cols-3 gap-2 md:gap-4 mb-6 relative ${!isShiftActive ? 'opacity-70' : ''}`}>
        
        {!isShiftActive && (
            <div className="absolute inset-0 z-20 bg-black/10 flex items-center justify-center pointer-events-none">
                {/* Visual overlay only, buttons are disabled logically */}
            </div>
        )}

        {/* Work Button */}
        <button 
           onClick={handleWork}
           disabled={!isShiftActive || isOnBreak}
           className={`
             border-4 border-black p-2 md:p-4 text-white transition-all pixel-shadow relative overflow-hidden group disabled:cursor-not-allowed 
             ${!isShiftActive || isOnBreak ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}
           `}
        >
            <div className="relative z-10 flex flex-col items-center">
                {!isShiftActive ? (
                    <Lock size={24} className="mb-1 md:mb-2"/> 
                ) : isOnBreak ? (
                    <Ban size={24} className="mb-1 md:mb-2 text-red-200" />
                ) : (
                    <Coffee size={24} className="mb-1 md:mb-2" />
                )}
                
                <span className="font-bold uppercase text-sm md:text-lg">
                    {isOnBreak ? 'Resting' : 'Serve'}
                </span>
                
                <span className="text-[10px] opacity-80 mt-1 hidden md:block">
                   {isOnBreak ? `${breakCooldown}s Left` : (
                       <>
                        - {weather === 'Snowy' ? 5 : 2} HP 
                        {(hasGoldBoost || hasXpBoost) && <span className="text-yellow-300 font-bold ml-1 animate-pulse">^BOOST</span>}
                       </>
                   )}
                </span>
            </div>
            {isShiftActive && !isOnBreak && <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>}
        </button>

        {/* Break Button */}
        <button 
           onClick={handleBreak}
           disabled={breakCooldown > 0 || !isShiftActive}
           className={`
             border-4 border-black p-2 md:p-4 text-white transition-all pixel-shadow relative
             ${breakCooldown > 0 || !isShiftActive ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 active:scale-95'}
           `}
        >
             <div className="flex flex-col items-center">
                {breakCooldown > 0 ? (
                    <>
                       <span className="text-xl md:text-2xl font-mono font-bold">{breakCooldown}s</span>
                       <span className="text-[10px] mt-1">RESTING</span>
                    </>
                ) : (
                    <>
                       {!isShiftActive ? <Lock size={24} className="mb-1 md:mb-2"/> : <Armchair size={24} className="mb-1 md:mb-2" />}
                       <span className="font-bold uppercase text-sm md:text-lg">Break</span>
                       <span className="text-[10px] opacity-80 mt-1 hidden md:block">+15 HP</span>
                    </>
                )}
             </div>
        </button>

        {/* Arcade Button */}
        <button 
           onClick={handleArcade}
           disabled={!isShiftActive || !!arcadeCooldownStr}
           className={`
                border-4 border-black p-2 md:p-4 text-white transition-all pixel-shadow relative overflow-hidden group disabled:cursor-not-allowed 
                ${!!arcadeCooldownStr ? 'bg-gray-600' : 'bg-purple-600 hover:bg-purple-500 active:scale-95'}
           `}
        >
             <div className="relative z-10 flex flex-col items-center">
                {arcadeCooldownStr ? (
                    <>
                        <Clock size={24} className="mb-1 md:mb-2 text-gray-400" />
                        <span className="font-bold font-mono text-sm md:text-lg">{arcadeCooldownStr}</span>
                    </>
                ) : (
                    <>
                        {!isShiftActive ? <Lock size={24} className="mb-1 md:mb-2"/> : <Joystick size={24} className="mb-1 md:mb-2 text-yellow-300" />}
                        <span className="font-bold uppercase text-sm md:text-lg text-yellow-300">Play</span>
                        <span className="text-[10px] opacity-80 mt-1 hidden md:block">Win Gold</span>
                    </>
                )}
             </div>
             {isShiftActive && !arcadeCooldownStr && <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>}
        </button>
    </div>
  );
};
