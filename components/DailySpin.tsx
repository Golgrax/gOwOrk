

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { gameService, WHEEL_PRIZES } from '../services/gameService';
import { WheelPrize } from '../types';
import { X, Gift, Heart, Coins, Star, Crown, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailySpinProps {
  onClose: () => void;
}

export const DailySpin: React.FC<DailySpinProps> = ({ onClose }) => {
  const { spinWheel, playSfx, addToast } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<WheelPrize | null>(null);

  const SEGMENT_ANGLE = 360 / WHEEL_PRIZES.length;

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    playSfx('button');

    try {
        // 1. Get the result from SERVER
        const outcome = await spinWheel(); 
        const prizeIndex = WHEEL_PRIZES.findIndex(p => p.id === outcome.prize.id);
        
        // 2. Calculate animation
        const segmentCenter = (prizeIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
        const targetBase = -segmentCenter; 
        const fullSpins = 360 * 8; 
        const jitter = (Math.random() * 4) - 2;
        const finalRotation = targetBase - fullSpins + jitter;

        // 3. Animate
        setRotation(finalRotation);

        // 4. Wait for animation
        setTimeout(() => {
            setResult(outcome.prize);
            setSpinning(false);
            playSfx('success');
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.5 },
                colors: [outcome.prize.color, '#ffffff']
            });
        }, 4000); 
    } catch (e: any) {
        addToast(e.message, 'error');
        setSpinning(false);
    }
  };

  const canSpin = gameService.canSpin();

  const getIcon = (type: string) => {
      if (type === 'gold') return <Coins size={20} />;
      if (type === 'xp') return <Star size={20} />;
      if (type === 'hp') return <Heart size={20} fill="white" />;
      return <Crown size={20} />;
  }

  const gradient = `conic-gradient(${
      WHEEL_PRIZES.map((p, i) => {
          const start = i * (100 / WHEEL_PRIZES.length);
          const end = (i + 1) * (100 / WHEEL_PRIZES.length);
          return `${p.color} ${start}% ${end}%`;
      }).join(', ')
  })`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-retro-bg border-4 border-black pixel-shadow p-6 text-center max-w-sm w-full relative overflow-hidden">
            <button onClick={onClose} className="absolute top-2 right-2 text-black hover:text-red-500 z-10">
                <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold uppercase mb-2 flex items-center justify-center gap-2">
                <Gift className="text-retro-gold" /> Daily Spin
            </h2>
            
            {!canSpin && !result && (
                <div className="text-xs font-bold text-red-500 mb-2">You already spun today!</div>
            )}

            <div className="relative w-72 h-72 mx-auto my-6">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 text-black drop-shadow-xl filter">
                    <ChevronDown size={64} fill="black" strokeWidth={3} className="text-white" />
                </div>

                <div 
                    className="w-full h-full rounded-full border-4 border-black relative overflow-hidden shadow-xl"
                    style={{ 
                        background: gradient,
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning ? 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)' : 'none'
                    }}
                >
                    {WHEEL_PRIZES.map((prize, i) => (
                        <div 
                            key={prize.id}
                            className="absolute top-1/2 left-1/2 w-full h-0 -translate-y-1/2 origin-left flex items-center"
                            style={{ 
                                transform: `rotate(${i * SEGMENT_ANGLE + (SEGMENT_ANGLE/2) - 90}deg)` 
                            }}
                        >
                            <div className="pl-10 flex items-center gap-2 font-black text-lg text-white uppercase tracking-wider" 
                                 style={{ 
                                     textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
                                 }}>
                                <span>{prize.label}</span>
                                {getIcon(prize.type)}
                            </div>
                        </div>
                    ))}
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-4 border-black rounded-full z-10 flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-full"></div>
                    </div>
                </div>
            </div>

            {result ? (
                <div className="animate-in fade-in zoom-in duration-300">
                    <div className="text-sm uppercase text-gray-500">You Won</div>
                    <div className="text-4xl font-black my-4 uppercase" style={{ color: result.color, textShadow: '2px 2px 0 #000' }}>
                        {result.label}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-gray-800 text-xl"
                    >
                        Claim Prize
                    </button>
                </div>
            ) : (
                <button 
                   onClick={handleSpin} 
                   disabled={!canSpin || spinning}
                   className={`
                      w-full border-4 border-black px-6 py-4 text-2xl font-black uppercase transition-transform
                      ${canSpin 
                          ? 'bg-retro-gold hover:bg-yellow-400 hover:scale-105 active:scale-95' 
                          : 'bg-gray-400 cursor-not-allowed text-gray-700 opacity-50'}
                   `}
                >
                   {spinning ? 'Good Luck...' : 'SPIN!'}
                </button>
            )}
        </div>
    </div>
  );
};