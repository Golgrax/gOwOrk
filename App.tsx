
import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GameScene } from './components/GameScene';
import { ClockInButton } from './components/ClockInButton';
import { QuestBoard } from './components/QuestBoard';
import { OverdriveToggle } from './components/OverdriveToggle';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { Shop } from './components/Shop';
import { Leaderboard } from './components/Leaderboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { BossWidget } from './components/BossWidget';
import { Profile } from './components/Profile';
import { ActionPad } from './components/ActionPad';
import { ToastContainer } from './components/Toast';
import { BonusGame } from './components/BonusGame';
import { DailySpin } from './components/DailySpin';
import { SkillTree } from './components/SkillTree';
import { PetWidget } from './components/PetWidget';
import { SettingsModal } from './components/SettingsModal';
import { SecurityMonitor } from './components/SecurityMonitor';
import { Home, ShoppingBag, User as UserIcon, ClipboardList, LogOut, CloudRain, Sun, Snowflake, Flame, CloudFog, Eye, EyeOff, Gift, Lock, Star, Settings, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

const GameLayout: React.FC = () => {
  const { user, isOverdrive, logout, weather, addToast, isShiftActive, recordArcadePlay, playSfx } = useGame();
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'profile' | 'admin' | 'skills' | 'security'>('home');
  const [showArcade, setShowArcade] = useState(false);
  const [showDailySpin, setShowDailySpin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);

  if (!user) return <LoginScreen />;

  const handleArcadeReward = async (score: number) => {
      try {
          await recordArcadePlay(score); // Server handles calculation
          addToast(`Arcade Score: ${score}! Rewards Added.`, 'success');
          confetti({
             particleCount: 150,
             spread: 80,
             origin: { y: 0.6 }
          });
      } catch (e: any) {
          addToast(e.message, 'error');
      }
      setShowArcade(false);
  };

  const handleOpenSpin = () => {
      if (isShiftActive) {
          setShowDailySpin(true);
          playSfx('button');
      } else {
          addToast("Clock In to Spin!", "error");
      }
  }

  const renderView = () => {
     switch(currentView) {
        case 'shop': return <Shop />;
        case 'profile': return <Profile />;
        case 'skills': return <SkillTree />;
        case 'admin': return <ManagerDashboard />;
        case 'security': return <SecurityMonitor />;
        default: return (
           <div className="space-y-6">
              <BossWidget />
              <PetWidget />
              <div className="transform transition-transform hover:scale-105 duration-200">
                <ClockInButton />
              </div>
              <ActionPad onOpenArcade={() => setShowArcade(true)} />
              
              <button 
                onClick={handleOpenSpin}
                disabled={!isShiftActive}
                className={`
                    w-full text-white border-4 border-black p-3 font-bold uppercase flex items-center justify-center gap-2 pixel-shadow transition-transform
                    ${isShiftActive ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105' : 'bg-gray-400 cursor-not-allowed'}
                `}
              >
                 {isShiftActive ? <Gift className="animate-bounce" /> : <Lock size={20} />} Daily Spin
              </button>

              <QuestBoard />
           </div>
        );
     }
  };

  const WeatherIcon = () => {
      if (weather === 'Rainy') return <CloudRain className="text-blue-400" />;
      if (weather === 'Snowy') return <Snowflake className="text-white" />;
      if (weather === 'Heatwave') return <Flame className="text-orange-500" />;
      if (weather === 'Foggy') return <CloudFog className="text-gray-400" />;
      return <Sun className="text-yellow-400 animate-pulse" />;
  };

  const getContainerWidth = () => {
      if (currentView === 'security') return 'w-full max-w-[98vw]';
      if (currentView === 'admin') return 'w-full max-w-5xl'; // Wider for tables
      return 'max-w-2xl';
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden text-gray-900 font-vt323 bg-[#1a1a1a]">
      
      <GameScene 
          config={user.avatar_json} 
          hpPercent={Math.round((user.current_hp / user.total_hp) * 100)} 
          isOverdrive={isOverdrive}
      />

      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          <button 
            onClick={() => setUiVisible(!uiVisible)}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors border-2 border-white/20"
            title={uiVisible ? "Hide UI" : "Show UI"}
          >
              {uiVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          
          <button 
            onClick={() => setShowSettings(true)}
            className="bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors border-2 border-white/20"
            title="Settings"
          >
              <Settings size={20} className={showSettings ? 'animate-spin' : ''} />
          </button>
      </div>

      <div className={`absolute top-40 left-4 z-0 pointer-events-none transition-opacity duration-500 ${uiVisible ? 'opacity-80' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 bg-black/50 text-white p-2 rounded backdrop-blur-sm border-2 border-white/20">
             <WeatherIcon />
             <span className="uppercase text-sm font-bold">{weather}</span>
          </div>
      </div>

      {showArcade && (
          <BonusGame 
            onClose={() => setShowArcade(false)} 
            onReward={handleArcadeReward}
          />
      )}
      {showDailySpin && <DailySpin onClose={() => setShowDailySpin(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className={`absolute inset-0 z-10 flex flex-col pointer-events-none transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="pointer-events-auto">
            <Header />
        </div>
        <ToastContainer />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide pointer-events-auto">
           <div className={`${getContainerWidth()} mx-auto pb-24 transition-all duration-300`}>
              {renderView()}
           </div>
        </main>

        <nav className="bg-white border-t-4 border-black p-2 flex justify-around items-center pixel-shadow pb-safe pointer-events-auto overflow-x-auto">
           <NavButton 
              icon={<Home />} 
              label="Work" 
              active={currentView === 'home'} 
              onClick={() => { setCurrentView('home'); playSfx('button'); }} 
           />
           <NavButton 
              icon={<ShoppingBag />} 
              label="Shop" 
              active={currentView === 'shop'} 
              onClick={() => { setCurrentView('shop'); playSfx('button'); }} 
           />
           <NavButton 
              icon={<Star />} 
              label="Skills" 
              active={currentView === 'skills'} 
              onClick={() => { setCurrentView('skills'); playSfx('button'); }} 
           />
           <NavButton 
              icon={<UserIcon />} 
              label="Profile" 
              active={currentView === 'profile'} 
              onClick={() => { setCurrentView('profile'); playSfx('button'); }} 
           />
           {(user.role === 'manager' || user.role === 'moderator') && (
               <>
                 <NavButton 
                    icon={<ClipboardList />} 
                    label="Admin" 
                    active={currentView === 'admin'} 
                    onClick={() => { setCurrentView('admin'); playSfx('button'); }} 
                 />
                 <NavButton 
                    icon={<Camera />} 
                    label="Monitor" 
                    active={currentView === 'security'} 
                    onClick={() => { setCurrentView('security'); playSfx('button'); }} 
                 />
               </>
           )}
           <button 
              onClick={logout}
              className="flex flex-col items-center p-2 text-red-500 hover:text-red-700 min-w-[50px]"
           >
              <LogOut size={24} />
              <span className="text-xs font-bold">EXIT</span>
           </button>
        </nav>
      </div>

      {user.role === 'manager' && (
          <div className={`pointer-events-auto transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
             <OverdriveToggle />
          </div>
      )}
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
   <button 
      onClick={onClick}
      className={`flex flex-col items-center p-2 transition-all min-w-[50px] ${active ? 'text-retro-goldDark -translate-y-2' : 'text-gray-500'}`}
   >
      <div className={`${active ? 'scale-125' : ''} transition-transform`}>{icon}</div>
      <span className="text-xs font-bold uppercase">{label}</span>
   </button>
);

const App: React.FC = () => {
  return (
    <GameProvider>
      <GameLayout />
    </GameProvider>
  );
};

export default App;
