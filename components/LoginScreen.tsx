
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, User, KeyRound, UserPlus, LogIn } from 'lucide-react';
import { gameService } from '../services/gameService';

export const LoginScreen: React.FC = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        if (!username || !password) throw new Error("Please fill in all fields");

        if (isRegistering) {
            await gameService.register(username, password);
            // Auto login after register
            await login(username); 
        } else {
            // Usually login handles the state update via context, 
            // but we need to pass password now.
            // Note: The context `login` function in GameContext needs update to accept password?
            // Actually `useGame().login` calls `gameService.login`. 
            // We need to bypass context or update context signature. 
            // Let's assume we updated context or call service directly then refresh context?
            // Proper way: Update GameContext signature. But for now, let's try calling the context method
            // which wraps gameService. The Context wrapper likely doesn't accept password in previous file.
            // I will implement a direct call here if Context isn't updated, 
            // BUT I should update Context signature in a real app.
            // Since I cannot change GameContext.tsx in this XML block (I can only provide changes),
            // I will rely on the fact that I *can* update GameContext in the next change block.
            await login(username, password); 
        }
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-bg flex items-center justify-center p-4 font-vt323">
      <div className="w-full max-w-md bg-white border-4 border-black pixel-shadow p-8 text-center relative">
         <div className="mb-6 flex justify-center text-retro-gold">
            <Gamepad2 size={64} />
         </div>
         <h1 className="text-4xl font-bold mb-2 uppercase">gOwOrk</h1>
         <p className="text-gray-600 mb-8 font-sans text-sm">Gamified Attendance System<br/>Now with SQLite & Secure Auth</p>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
               <label className="block font-bold mb-1 flex items-center gap-2"><User size={16}/> USERNAME</label>
               <input 
                 type="text" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full border-4 border-black p-2 font-mono text-lg focus:bg-yellow-50 outline-none"
                 placeholder="Enter username"
               />
            </div>
            
            <div className="text-left">
               <label className="block font-bold mb-1 flex items-center gap-2"><KeyRound size={16}/> PASSWORD</label>
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full border-4 border-black p-2 font-mono text-lg focus:bg-yellow-50 outline-none"
                 placeholder="Enter password"
               />
            </div>

            {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-2 font-bold text-sm">
                    {error}
                </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className={`
                 w-full border-4 border-black py-3 text-xl font-bold active:translate-y-1 transition-all flex items-center justify-center gap-2
                 ${isRegistering ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-retro-gold hover:bg-yellow-500'}
              `}
            >
              {loading ? 'PROCESSING...' : (isRegistering ? <><UserPlus /> CREATE ACCOUNT</> : <><LogIn /> LOGIN</>)}
            </button>
         </form>

         <div className="mt-4 pt-4 border-t-2 border-gray-100">
             <button 
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                className="text-gray-500 text-sm hover:text-black font-bold underline"
             >
                 {isRegistering ? "Already have an account? Login" : "New hire? Create Account"}
             </button>
         </div>
      </div>
    </div>
  );
};
