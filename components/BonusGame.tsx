
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

    // Draw Floor / Bezel Area (Masks falling items)
    const px = (playerX.current / 100) * canvas.width;
    const py = PLAYER_Y * canvas.height;
    const floorY = py + 20; // Start just below the player emoji baseline
    
    // 1. Solid Floor Background
    ctx.fillStyle = '#1a1a1a'; 
    ctx.fillRect(0, floorY, canvas.width, canvas.height - floorY);
    
    // 2. Bezel Top Highlight Line
    ctx.fillStyle = '#000';
    ctx.fillRect(0, floorY, canvas.width, 6);

    // 3. Subtle Stripe Pattern on Floor
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, floorY + 6, canvas.width, canvas.height - floorY - 6);
    ctx.clip();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    for(let i=-20; i<canvas.width; i+=20) {
        ctx.beginPath();
        ctx.moveTo(i, floorY);
        ctx.lineTo(i-10, canvas.height);
        ctx.stroke();
    }
    ctx.restore();

    // Draw Player
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('☕', px, py); // Player Avatar

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
      <div className="relative w-full max-w-md bg-retro-bg border-4 border-black pixel-shadow overflow-hidden flex flex-col h-[600px] max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-black text-retro-gold p-4 flex justify-between items-center z-10 shrink-0">
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
        <div className="relative flex-1 bg-[#f0e6d2] cursor-crosshair min-h-0">
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
        
        {/* Arcade Footer Control Panel */}
        <div className="bg-gray-900 border-t-4 border-black p-4 shrink-0 flex items-center justify-between relative shadow-inner overflow-hidden">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:4px_4px] pointer-events-none"></div>

            {/* D-Pad (Visual) */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center opacity-80 shrink-0">
                <div className="w-5 h-14 md:w-6 md:h-16 bg-gray-700 rounded absolute shadow-md border border-gray-900"></div>
                <div className="w-14 h-5 md:w-16 md:h-6 bg-gray-700 rounded absolute shadow-md border border-gray-900"></div>
                <div className="w-4 h-4 bg-gray-800 rounded-full z-10 shadow-inner"></div>
                {/* Arrow highlights */}
                <div className="absolute top-0 text-[8px] text-gray-500 font-bold">▲</div>
                <div className="absolute bottom-0 text-[8px] text-gray-500 font-bold">▼</div>
                <div className="absolute left-0 text-[8px] text-gray-500 font-bold">◀</div>
                <div className="absolute right-0 text-[8px] text-gray-500 font-bold">▶</div>
            </div>

            {/* Center Instruction (Visual) */}
            <div className="z-10 text-center flex flex-col items-center mx-2">
                 <div className="bg-black border-2 border-gray-600 px-3 py-1 mb-1 shadow-[0_0_10px_rgba(255,165,0,0.2)]">
                     <span className={`text-[10px] md:text-xs font-bold tracking-widest whitespace-nowrap ${gameState === 'playing' ? 'text-retro-gold animate-pulse' : 'text-gray-400'}`}>
                         {gameState === 'playing' ? 'DRAG TO MOVE' : gameState === 'gameover' ? 'INSERT COIN' : 'PRESS START'}
                     </span>
                 </div>
                 <div className="text-[8px] md:text-[10px] text-gray-500 font-mono uppercase">1 Player Mode</div>
            </div>

            {/* A/B Buttons (Visual) */}
            <div className="flex gap-2 md:gap-3 pr-2 opacity-90 shrink-0">
                <div className="flex flex-col items-center translate-y-2">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-600 border-b-4 border-red-900 shadow-lg active:translate-y-1 active:border-b-0 transition-transform"></div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">B</span>
                </div>
                <div className="flex flex-col items-center -translate-y-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-600 border-b-4 border-green-900 shadow-lg active:translate-y-1 active:border-b-0 transition-transform"></div>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">A</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
