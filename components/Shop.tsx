
import React from 'react';
import { useGame } from '../context/GameContext';
import { RetroCard } from './RetroCard';
import { ShoppingBag, Coffee, HelpCircle, Clock, Dog } from 'lucide-react';

export const Shop: React.FC = () => {
  const { user, shopItems, buyItem, equipItem } = useGame();

  if (!user) return null;

  const cosmetics = shopItems.filter(i => i.type !== 'consumable' && i.type !== 'pet');
  const consumables = shopItems.filter(i => i.type === 'consumable');
  const pets = shopItems.filter(i => i.type === 'pet');

  const today = new Date().toISOString().split('T')[0];
  const isMysteryBoxOnCooldown = user.last_mystery_box_date === today;

  return (
    <div className="space-y-6 pb-20">
       <div className="flex justify-between items-center bg-white p-4 border-4 border-black pixel-shadow sticky top-0 z-10">
          <h2 className="text-2xl font-bold uppercase">Item Shop</h2>
          <div className="text-retro-goldDark font-bold text-xl">💰 {user.current_gold}</div>
       </div>

       {/* Mystery Box - Gacha */}
       <RetroCard className="bg-gradient-to-r from-purple-100 to-indigo-100 border-indigo-900">
           <div className="flex justify-between items-center">
               <div className="flex items-center gap-4">
                   <div className={`text-white p-3 border-2 border-black ${isMysteryBoxOnCooldown ? 'bg-gray-400' : 'bg-indigo-600 animate-bounce'}`}>
                       <HelpCircle size={32} />
                   </div>
                   <div>
                       <h3 className="font-bold text-xl text-indigo-900 uppercase">Mystery Box</h3>
                       <p className="text-sm text-indigo-700">Contains random Loot: Gold, XP, or Full Heal!</p>
                       {isMysteryBoxOnCooldown && (
                           <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 border border-red-300 font-bold mt-1 inline-block">
                               Cooldown: 24h
                           </span>
                       )}
                   </div>
               </div>
               <button 
                  onClick={() => buyItem('mystery_box')}
                  disabled={user.current_gold < 100 || isMysteryBoxOnCooldown}
                  className={`
                    px-6 py-3 border-4 border-black font-bold flex items-center gap-2
                    ${isMysteryBoxOnCooldown 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50'}
                  `}
               >
                  {isMysteryBoxOnCooldown ? <Clock size={16}/> : '100 G'}
               </button>
           </div>
       </RetroCard>

       {/* Pet Section */}
       {pets.length > 0 && (
           <div>
               <h3 className="text-xl font-bold uppercase mb-2 text-white bg-black inline-block px-2">Companions</h3>
               <div className="grid grid-cols-1 gap-4">
                   {pets.map(item => {
                       const isOwned = !!user.pet;
                       return (
                           <RetroCard key={item.id} className="bg-orange-100 border-orange-800">
                               <div className="flex justify-between items-center">
                                   <div className="flex items-center gap-4">
                                       <div className="bg-orange-200 p-2 border-2 border-orange-900 rounded-full">
                                            <Dog size={32} className="text-orange-900" />
                                       </div>
                                       <div>
                                           <h3 className="font-bold text-lg text-orange-900">{item.name}</h3>
                                           <p className="text-sm text-orange-800">{item.description}</p>
                                       </div>
                                   </div>
                                   <div>
                                       {isOwned ? (
                                           <div className="bg-green-200 text-green-800 font-bold px-3 py-1 border-2 border-green-800 text-sm">
                                               ADOPTED
                                           </div>
                                       ) : (
                                           <button 
                                              onClick={() => buyItem(item.id)}
                                              disabled={user.current_gold < item.cost}
                                              className="bg-orange-600 text-white px-4 py-2 border-2 border-black font-bold hover:bg-orange-500 disabled:opacity-50"
                                           >
                                              ADOPT ({item.cost} G)
                                           </button>
                                       )}
                                   </div>
                               </div>
                           </RetroCard>
                       );
                   })}
               </div>
           </div>
       )}

       {/* Consumables Section */}
       <div>
           <h3 className="text-xl font-bold uppercase mb-2 text-white bg-black inline-block px-2">Snacks (Instant HP)</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {consumables.map(item => (
                   <RetroCard key={item.id} className="bg-orange-50">
                       <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                               <Coffee size={24} className="text-orange-800"/>
                               <div>
                                   <div className="font-bold">{item.name}</div>
                                   <div className="text-xs text-gray-500">{item.description}</div>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="font-bold text-retro-goldDark">{item.cost} G</div>
                               <button 
                                  onClick={() => buyItem(item.id)}
                                  disabled={user.current_gold < item.cost}
                                  className="bg-green-600 text-white text-xs px-2 py-1 border-2 border-black hover:bg-green-500 disabled:opacity-50"
                               >
                                  EAT
                               </button>
                           </div>
                       </div>
                   </RetroCard>
               ))}
           </div>
       </div>

       {/* Cosmetics Section */}
       <div>
           <h3 className="text-xl font-bold uppercase mb-2 text-white bg-black inline-block px-2">Gear</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cosmetics.map(item => {
                 const isOwned = user.inventory.includes(item.id);
                 const isEquipped = 
                   user.avatar_json.hat === item.asset_id || 
                   user.avatar_json.eyes === item.asset_id || 
                   user.avatar_json.clothing === item.asset_id;

                 return (
                   <RetroCard key={item.id} className="flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <span className="text-xs bg-gray-200 px-2 py-0.5 uppercase">{item.type}</span>
                         </div>
                         {!isOwned && <div className="font-bold text-retro-goldDark">{item.cost} G</div>}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 h-10">{item.description}</p>

                      {isOwned ? (
                         <button 
                           onClick={() => equipItem(item.type as any, item.asset_id)}
                           disabled={isEquipped}
                           className={`w-full py-2 font-bold border-2 border-black ${
                             isEquipped ? 'bg-green-200 text-green-800' : 'bg-white hover:bg-gray-100'
                           }`}
                         >
                           {isEquipped ? 'EQUIPPED' : 'EQUIP'}
                         </button>
                      ) : (
                         <button 
                           onClick={() => buyItem(item.id)}
                           disabled={user.current_gold < item.cost}
                           className="w-full bg-retro-gold text-black border-2 border-black py-2 font-bold hover:bg-retro-goldDark disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           BUY
                         </button>
                      )}
                   </RetroCard>
                 );
              })}
           </div>
       </div>
    </div>
  );
};
