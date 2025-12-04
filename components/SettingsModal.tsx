
import React from 'react';
import { useGame } from '../context/GameContext';
import { X, Volume2, VolumeX, Speaker, Trash2, Info } from 'lucide-react';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { settings, updateSettings, resetGameData } = useGame();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white border-4 border-black pixel-shadow p-6 w-full max-w-md relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded text-black"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-2 border-b-4 border-black pb-2">
                    <Info className="text-retro-gold" /> System Settings
                </h2>

                <div className="space-y-6">
                    {/* Audio Controls */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-sm bg-gray-100 p-1">Audio Configuration</h3>
                        
                        {/* Music Volume */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="font-bold text-xs uppercase flex items-center gap-2">
                                    {settings.isMusicMuted ? <VolumeX size={16}/> : <Volume2 size={16}/>} Music (BGM)
                                </label>
                                <button 
                                    onClick={() => updateSettings({ isMusicMuted: !settings.isMusicMuted })}
                                    className={`text-xs px-2 py-0.5 border border-black font-bold uppercase ${settings.isMusicMuted ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                                >
                                    {settings.isMusicMuted ? 'OFF' : 'ON'}
                                </button>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1" 
                                value={settings.musicVolume}
                                onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                                disabled={settings.isMusicMuted}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-retro-gold"
                            />
                        </div>

                        {/* SFX Volume */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="font-bold text-xs uppercase flex items-center gap-2">
                                    <Speaker size={16}/> Sound Effects
                                </label>
                                <button 
                                    onClick={() => updateSettings({ isSfxMuted: !settings.isSfxMuted })}
                                    className={`text-xs px-2 py-0.5 border border-black font-bold uppercase ${settings.isSfxMuted ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}
                                >
                                    {settings.isSfxMuted ? 'OFF' : 'ON'}
                                </button>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1" 
                                value={settings.sfxVolume}
                                onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
                                disabled={settings.isSfxMuted}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </div>

                    {/* Graphics */}
                    <div className="space-y-2">
                        <h3 className="font-bold uppercase text-sm bg-gray-100 p-1">Performance</h3>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={settings.lowPerformanceMode}
                                onChange={(e) => updateSettings({ lowPerformanceMode: e.target.checked })}
                                className="w-5 h-5 border-2 border-black rounded focus:ring-0"
                            />
                            <span className="text-sm">Low Performance Mode (Disable Particles)</span>
                        </label>
                    </div>

                    {/* Dangerous Zone */}
                    <div className="pt-4 border-t-2 border-gray-200">
                        <h3 className="font-bold uppercase text-sm text-red-600 mb-2">Danger Zone</h3>
                        <button 
                            onClick={resetGameData}
                            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 border-2 border-red-500 p-3 font-bold hover:bg-red-200 uppercase text-sm"
                        >
                            <Trash2 size={16} /> Reset Game Data (Wipe Save)
                        </button>
                    </div>
                    
                    <div className="text-center text-[10px] text-gray-400 font-mono mt-2">
                        v1.2.0 - gOwOrk Canary Build
                    </div>
                </div>
            </div>
        </div>
    );
};
