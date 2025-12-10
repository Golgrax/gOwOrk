
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, User, KeyRound, UserPlus, LogIn, Check } from 'lucide-react';
import { gameService } from '../services/gameService';

export const LoginScreen: React.FC = () => {
  const { login } = useGame();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }
            if (password.length < 4) {
                throw new Error("Password must be at least 4 characters");
            }
            await gameService.register(username, password);
            // Auto login after register
            await login(username, password); 
        } else {
            await login(username, password); 
        }
    } catch (e: any) {
        setError(e.message);
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setError(null);
      setPassword('');
      setConfirmPassword('');
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

            {isRegistering && (
                <div className="text-left animate-in slide-in-from-top-2 fade-in duration-300">
                   <label className="block font-bold mb-1 flex items-center gap-2 text-blue-600"><Check size={16}/> CONFIRM PASSWORD</label>
                   <input 
                     type="password" 
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className={`w-full border-4 p-2 font-mono text-lg focus:bg-blue-50 outline-none ${
                         confirmPassword && password !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-black'
                     }`}
                     placeholder="Re-enter password"
                   />
                </div>
            )}

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
                onClick={toggleMode}
                className="text-gray-500 text-sm hover:text-black font-bold underline"
             >
                 {isRegistering ? "Already have an account? Login" : "New hire? Create Account"}
             </button>
         </div>
      </div>
    </div>
  );
};
