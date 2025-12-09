
import React from 'react';
import { useGame } from '../context/GameContext';

export const ToastContainer: React.FC = () => {
  const { toasts } = useGame();

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`
            min-w-[200px] p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] font-bold uppercase text-sm 
            toast-anim
            ${t.type === 'success' ? 'bg-retro-green text-black' : 
              t.type === 'error' ? 'bg-retro-red text-white' : 'bg-white text-black'}
          `}
        >
           {t.message}
        </div>
      ))}
    </div>
  );
};
