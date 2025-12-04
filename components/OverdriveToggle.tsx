import React from 'react';
import { useGame } from '../context/GameContext';
import { Zap, Sun } from 'lucide-react';

export const OverdriveToggle: React.FC = () => {
  const { isOverdrive, toggleOverdrive } = useGame();

  return (
    <button 
      onClick={toggleOverdrive}
      className={`
        fixed bottom-6 right-6 p-4 rounded-full border-4 border-black pixel-shadow transition-all z-50
        ${isOverdrive ? 'bg-retro-red text-white animate-pulse' : 'bg-retro-gold text-black'}
      `}
      title="Toggle Overdrive Mode (Debug)"
    >
      {isOverdrive ? <Zap size={32} /> : <Sun size={32} />}
    </button>
  );
};
