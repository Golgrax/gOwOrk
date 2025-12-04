
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import confetti from 'canvas-confetti';
import { Gamepad2, AlertTriangle, LogOut, CheckCircle } from 'lucide-react';

export const ClockInButton: React.FC = () => {
  const { clockIn, clockOut, todayLog, isOverdrive, isShiftActive, timeOffset, playSfx } = useGame();
  const [now, setNow] = useState(new Date(Date.now() + timeOffset));
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Update local "now" every second, respecting the global offset
    const interval = setInterval(() => {
        setNow(new Date(Date.now() + timeOffset));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeOffset]);

  const handleClockIn = async () => {
    setLoading(true);
    playSfx('success'); // Use simplified SFX

    const log = await clockIn(now);

    if (log.status === 'critical_hit') {
       setShake(true);
       confetti({
         particleCount: 200,
         spread: 120,
         origin: { y: 0.6 }
       });
       setTimeout(() => setShake(false), 500);
    }

    setLoading(false);
  };

  const handleClockOut = async () => {
      setLoading(true);
      playSfx('button');
      await clockOut(now);
      setLoading(false);
  };

  // State 3: Shift Complete (Clocked In AND Clocked Out)
  if (todayLog && todayLog.time_out) {
    return (
      <div className="text-center p-6 border-4 border-black bg-gray-100 pixel-shadow">
        <div className="flex justify-center mb-2 text-retro-green"><CheckCircle size={48} /></div>
        <h3 className="text-xl font-bold uppercase mb-2">SHIFT COMPLETE</h3>
        <p className="text-sm text-gray-600 mb-1">Time In: {new Date(todayLog.time_in).toLocaleTimeString()}</p>
        <p className="text-sm text-gray-600 mb-4">Time Out: {new Date(todayLog.time_out).toLocaleTimeString()}</p>
        <div className="bg-blue-100 p-2 border-2 border-blue-300 inline-block rounded">
            <p className="font-bold text-blue-800">XP EARNED: +{todayLog.xp_earned}</p>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">See you tomorrow, Hero!</p>
      </div>
    );
  }

  // Format Time
  const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
  const [hours, minutes] = [now.getHours(), now.getMinutes()];

  // Pre-calculate status for UI hint
  let statusHint = 'Ready to Work';
  let hintColor = 'text-gray-500';
  
  if (!isShiftActive) {
      if (hours === 7 && minutes >= 45) { statusHint = 'EARLY BIRD (+20 XP)'; hintColor = 'text-blue-500'; }
      else if (hours === 8 && minutes === 0) { statusHint = 'CRITICAL HIT WINDOW (+50 XP)'; hintColor = 'text-retro-green animate-pulse'; }
      else if (hours > 8 || (hours === 8 && minutes > 15)) { statusHint = 'LATE PENALTY (-10 HP)'; hintColor = 'text-retro-red'; }
  } else {
      statusHint = 'SHIFT IN PROGRESS';
      hintColor = 'text-blue-600 animate-pulse';
  }

  return (
    <div className={`flex flex-col items-center ${shake ? 'shake-anim' : ''}`}>
       <div className="mb-4 text-6xl font-bold font-mono tracking-widest bg-black text-retro-gold p-4 border-4 border-gray-600 rounded">
         {timeStr}
       </div>
       
       <div className={`mb-6 text-xl font-bold uppercase ${hintColor}`}>
         {statusHint}
       </div>

       {!isShiftActive ? (
           // State 1: Start Shift
           <button
             onClick={handleClockIn}
             disabled={loading}
             className={`
               group relative px-12 py-6 text-3xl font-bold text-white uppercase tracking-widest
               transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
               ${isOverdrive ? 'bg-retro-darkAccent hover:bg-red-800' : 'bg-blue-600 hover:bg-blue-500'}
               border-4 border-black pixel-shadow
             `}
           >
             <span className="flex items-center gap-4">
               {isOverdrive ? <AlertTriangle size={32} /> : <Gamepad2 size={32} />}
               {loading ? 'SYNCING...' : 'START SHIFT'}
             </span>
           </button>
       ) : (
           // State 2: End Shift
           <button
             onClick={handleClockOut}
             disabled={loading}
             className="
               group relative px-12 py-6 text-3xl font-bold text-white uppercase tracking-widest
               transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
               bg-red-600 hover:bg-red-500 border-4 border-black pixel-shadow
             "
           >
             <span className="flex items-center gap-4">
               <LogOut size={32} />
               {loading ? 'SYNCING...' : 'END SHIFT'}
             </span>
           </button>
       )}
    </div>
  );
};
