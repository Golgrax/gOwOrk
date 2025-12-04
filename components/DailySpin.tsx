
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { gameService } from '../services/gameService';
import { X, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailySpinProps {
  onClose: () => void;
}

export const DailySpin: React.FC<DailySpinProps> = ({ onClose }) => {
  const { spinWheel } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSpin = () => {
    setSpinning(true);
    setTimeout(() => {
        try {
            const outcome = spinWheel();
            setResult(outcome.reward);
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 }
            });
        } catch (e) {
            setResult("Error");
        }
        setSpinning(false);
    }, 2000);
  };

  const canSpin = gameService.canSpin();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-retro-bg border-4 border-black pixel-shadow p-6 text-center max-w-sm w-full relative">
            <button onClick={onClose} className="absolute top-2 right-2 text-black hover:text-red-500 z-10">
                <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold uppercase mb-4 flex items-center justify-center gap-2">
                <Gift className="text-retro-gold" /> Daily Spin
            </h2>

            {!result ? (
                <div className="py-8">
                    {canSpin ? (
                        <>
                         <div className={`text-6xl mb-6 ${spinning ? 'animate-spin' : ''}`}>🎡</div>
                         <button 
                            onClick={handleSpin} 
                            disabled={spinning}
                            className="bg-retro-green border-4 border-black px-6 py-3 text-xl font-bold uppercase hover:scale-105 transition-transform"
                         >
                            {spinning ? 'SPINNING...' : 'SPIN NOW'}
                         </button>
                        </>
                    ) : (
                        <div className="text-gray-500 font-bold">
                            ALREADY SPUN TODAY!<br/>COME BACK TOMORROW.
                        </div>
                    )}
                </div>
            ) : (
                <div className="py-8">
                    <div className="text-sm uppercase text-gray-500">YOU WON</div>
                    <div className="text-4xl font-bold text-retro-goldDark my-4 animate-bounce">{result}</div>
                    <button onClick={onClose} className="mt-4 text-sm font-bold underline hover:text-red-500">Close</button>
                </div>
            )}
        </div>
    </div>
  );
};
