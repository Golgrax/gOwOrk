
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.trim()) {
        try {
            await login(username);
        } catch (e: any) {
            setError(e.message);
        }
    }
  };

  return (
    <div className="min-h-screen bg-retro-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black pixel-shadow p-8 text-center">
         <div className="mb-6 flex justify-center text-retro-gold">
            <Gamepad2 size={64} />
         </div>
         <h1 className="text-4xl font-bold mb-2 uppercase">gOwOrk</h1>
         <p className="text-gray-600 mb-8 font-sans">Gamify your 9-to-5. Earn XP. Get Gold.</p>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-left font-bold mb-1">USER ID</label>
               <input 
                 type="text" 
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 className="w-full border-4 border-black p-3 font-mono text-xl focus:outline-none focus:bg-yellow-50"
                 placeholder="Enter username..."
               />
               <p className="text-xs text-gray-500 mt-1 text-left">Try 'hero', 'boss', or 'worker'</p>
            </div>

            {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-2 font-bold text-sm">
                    {error}
                </div>
            )}
            
            <button 
              type="submit"
              className="w-full bg-retro-gold border-4 border-black py-3 text-xl font-bold hover:bg-retro-goldDark active:translate-y-1 transition-all"
            >
              INSERT COIN (LOGIN)
            </button>
         </form>
      </div>
    </div>
  );
};
