
import React, { useRef, useEffect, useState } from 'react';
import { X, Trophy, Play, Heart } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface BonusGameProps {
  onClose: () => void;
  onReward: (score: number) => void;
}

export const BonusGame: React.FC<BonusGameProps> = ({ onClose, onReward }) => {
  const { playSfx } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Game State Refs (Mutable to avoid re-renders during 60fps loop)
  const playerX = useRef(50); // Percentage 0-100
  const items = useRef<any[]>([]);
  const frameId = useRef(0);
  const lastSpawn = useRef(0);
  const gameScore = useRef(0);
  const difficulty = useRef(1);
  const gameLives = useRef(3); // Ref to sync with loop

  // Constants
  const PLAYER_Y = 0.85; // % from top
  const PLAYER_SIZE = 0.15; // % of width

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
    gameScore.current = 0;
    gameLives.current = 3;
    items.current = [];
    difficulty.current = 1;
    playerX.current = 50;
    lastSpawn.current = Date.now();
    playSfx('button');
    loop();
  };

  const spawnItem = (width: number) => {
    const rand = Math.random();
    let type = 'bean';
    if (rand > 0.95) type = 'coin'; // 5% chance
    else if (rand > 0.75) type = 'bug'; // 20% chance

    items.current.push({
      id: Date.now(),
      x: Math.random(), // 0-1 pos
      y: -0.1,
      type,
      speed: (0.005 + (Math.random() * 0.005)) * difficulty.current
    });
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameLives.current <= 0) {
        handleGameOver();
        return;
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }

    // Spawn Logic
    const now = Date.now();
    if (now - lastSpawn.current > (1000 / difficulty.current)) {
      spawnItem(canvas.width);
      lastSpawn.current = now;
      difficulty.current += 0.05; // Ramp up speed
    }

    // Update Items
    for (let i = items.current.length - 1; i >= 0; i--) {
        const item = items.current[i];
        item.y += item.speed;
      
        // Draw Item
        ctx.font = '30px Arial';
        let emoji = '🫘';
        if (item.type === 'bug') emoji = '🪳';
        if (item.type === 'coin') emoji = '🪙';
      
        const screenX = item.x * canvas.width;
        const screenY = item.y * canvas.height;
        ctx.fillText(emoji, screenX, screenY);

        // Collision Detection
        const playerScreenX = (playerX.current / 100) * canvas.width;
        const playerScreenY = PLAYER_Y * canvas.height;
        const hitBox = 40;

        if (
            Math.abs(screenX - playerScreenX) < hitBox &&
            Math.abs(screenY - playerScreenY) < hitBox
        ) {
            // HIT!
            if (item.type === 'bug') {
                takeDamage();
                playSfx('hurt');
            } else {
                const points = item.type === 'coin' ? 50 : 10;
                gameScore.current += points;
                setScore(gameScore.current); // Sync to UI
                playSfx('collect');
            }
            items.current.splice(i, 1);
        } else if (item.y > 1) {
            // Missed item logic
            if (item.type !== 'bug') {
                // Missed a good item (coin or bean) -> lose a heart
                takeDamage();
                playSfx('miss');
            }
            items.current.splice(i, 1);
        }
    }

    if (gameState === 'gameover') return;

    // Draw Player
    const px = (playerX.current / 100) * canvas.width;
    const py = PLAYER_Y * canvas.height;
    
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('☕', px, py); // Player Avatar

    // Debug / Floor
    ctx.fillStyle = '#333';
    ctx.fillRect(0, py + 20, canvas.width, 10);

    frameId.current = requestAnimationFrame(loop);
  };

  const takeDamage = () => {
      gameLives.current -= 1;
      setLives(gameLives.current);
  }

  const handleGameOver = () => {
    cancelAnimationFrame(frameId.current);
    setGameState('gameover');
    playSfx('gameover');
  };

  const handleTouchMove = (e: React.TouchEvent) => {
     if (!canvasRef.current) return;
     const rect = canvasRef.current.getBoundingClientRect();
     const touchX = e.touches[0].clientX - rect.left;
     playerX.current = (touchX / rect.width) * 100;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
     if (!canvasRef.current) return;
     const rect = canvasRef.current.getBoundingClientRect();
     const mouseX = e.clientX - rect.left;
     playerX.current = (mouseX / rect.width) * 100;
  };

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(frameId.current);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-retro-bg border-4 border-black pixel-shadow overflow-hidden flex flex-col h-[600px]">
        
        {/* Header */}
        <div className="bg-black text-retro-gold p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
              <div className="font-bold text-xl uppercase flex items-center gap-2">
                 <Trophy size={20} /> {score}
              </div>
              <div className="flex items-center gap-1 text-retro-red">
                  {Array.from({length: Math.max(0, lives)}).map((_, i) => (
                      <Heart key={i} size={20} fill="currentColor" />
                  ))}
              </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-500">
             <X size={24} />
          </button>
        </div>

        {/* Canvas Layer */}
        <div className="relative flex-1 bg-[#f0e6d2] cursor-crosshair">
           <canvas
             ref={canvasRef}
             width={400}
             height={600}
             className="w-full h-full block"
             onTouchMove={handleTouchMove}
             onMouseMove={handleMouseMove}
           />
           
           {/* Overlays */}
           {gameState === 'start' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-6 text-center">
                <h2 className="text-4xl font-bold text-retro-gold mb-2 drop-shadow-md">COFFEE RUSH</h2>
                <p className="mb-2 font-sans">Catch Beans 🫘 and Coins 🪙.</p>
                <p className="mb-6 font-sans text-retro-red font-bold">Avoid Bugs 🪳 & Don't Miss Beans!</p>
                <div className="flex gap-1 mb-6">
                    <Heart size={24} fill="red" />
                    <Heart size={24} fill="red" />
                    <Heart size={24} fill="red" />
                </div>
                <button 
                  onClick={startGame}
                  className="bg-retro-green text-black border-4 border-white px-8 py-4 text-2xl font-bold uppercase hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Play fill="black" /> Start
                </button>
             </div>
           )}

           {gameState === 'gameover' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 text-white p-6 text-center animate-in fade-in duration-300">
                <h2 className="text-4xl font-bold mb-2">GAME OVER</h2>
                <p className="text-xl mb-4">Final Score: {score}</p>
                <div className="bg-black/50 p-4 rounded mb-6 w-full">
                    <div className="flex justify-between mb-1 text-retro-gold">
                        <span>Gold Earned:</span>
                        <span>+{Math.floor(score / 10)}</span>
                    </div>
                    <div className="flex justify-between text-blue-300">
                        <span>XP Earned:</span>
                        <span>+{Math.floor(score / 5)}</span>
                    </div>
                </div>
                <button 
                  onClick={() => onReward(score)}
                  className="bg-retro-gold text-black border-4 border-black px-8 py-4 text-xl font-bold uppercase hover:bg-yellow-400 w-full"
                >
                  CLAIM REWARD
                </button>
             </div>
           )}
        </div>
        
        {/* Footer Hint */}
        {gameState === 'playing' && (
           <div className="bg-black text-white p-2 text-center text-xs">
              TOUCH & DRAG TO MOVE CUP ☕
           </div>
        )}
      </div>
    </div>
  );
};
