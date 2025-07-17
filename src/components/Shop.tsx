import React from 'react';
import { BulletModifier } from '../types/game';
import { Button } from './ui/button';

interface ShopProps {
  items: BulletModifier[];
  playerMoney: number;
  onPurchase: (item: BulletModifier) => void;
  onClose: () => void;
  currentWave: number;
  purchasedItems?: string[]; // Track purchased item IDs
}

const Shop: React.FC<ShopProps> = ({ items, playerMoney, onPurchase, onClose, currentWave, purchasedItems = [] }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-white';
      case 'rare': return 'border-blue-500 bg-blue-50';
      case 'epic': return 'border-purple-500 bg-purple-50';
      case 'legendary': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-white';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-800';
      case 'rare': return 'text-blue-800';
      case 'epic': return 'text-purple-800';
      case 'legendary': return 'text-yellow-800';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-primary rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">ITEM SHOP</h2>
          <p className="text-lg text-gray-300">Wave {currentWave} Complete!</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-accent">{playerMoney}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {items.map((item) => {
            const canAfford = playerMoney >= item.price;
            const isPurchased = purchasedItems.includes(item.id);
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 ${getRarityColor(item.rarity)} ${
                  !canAfford || isPurchased ? 'opacity-50' : ''
                } ${isPurchased ? 'bg-gray-200' : ''}`}
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-lg text-black">{item.name}</h3>
                  <p className={`text-sm font-semibold uppercase ${getRarityTextColor(item.rarity)}`}>
                    {item.rarity}
                  </p>
                </div>

                <p className="text-sm text-gray-700 mb-4 text-center min-h-[40px]">{item.description}</p>

                <div className="space-y-2 mb-4">
                  {/* Show item effects */}
                  {item.effects.damage && item.effects.damage !== 1 && (
                    <div className="text-xs text-red-700 font-medium">+{((item.effects.damage - 1) * 100).toFixed(0)}% Damage</div>
                  )}
                  {item.effects.speed && item.effects.speed !== 1 && (
                    <div className="text-xs text-green-700 font-medium">+{((item.effects.speed - 1) * 100).toFixed(0)}% Speed</div>
                  )}
                  {item.effects.fireRate && item.effects.fireRate !== 1 && (
                    <div className="text-xs text-orange-700 font-medium">+{((item.effects.fireRate - 1) * 100).toFixed(0)}% Fire Rate</div>
                  )}
                  {item.effects.piercing && <div className="text-xs text-blue-700 font-medium">Piercing</div>}
                  {item.effects.homing && <div className="text-xs text-purple-700 font-medium">Homing</div>}
                  {item.effects.multiShot && item.effects.multiShot > 1 && (
                    <div className="text-xs text-yellow-700 font-medium">+{item.effects.multiShot - 1} Extra Shots</div>
                  )}
                  {item.effects.explosive && <div className="text-xs text-red-700 font-medium">Explosive</div>}
                  {item.effects.poison && <div className="text-xs text-green-700 font-medium">Poison</div>}
                  {item.effects.freeze && <div className="text-xs text-cyan-700 font-medium">Freeze</div>}
                  {item.effects.lifeSteal && (
                    <div className="text-xs text-pink-700 font-medium">+{(item.effects.lifeSteal * 100).toFixed(0)}% Life Steal</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">💰</span>
                    <span className="font-bold text-lg text-black">{item.price}</span>
                  </div>
                  <Button
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford || isPurchased}
                    size="sm"
                    className={`${canAfford && !isPurchased ? 'bg-accent hover:bg-accent/80 text-white' : 'bg-gray-400 text-gray-600'}`}
                  >
                    {isPurchased ? 'Purchased' : canAfford ? 'Buy' : 'Too Expensive'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={onClose} size="lg" className="bg-primary hover:bg-primary/80 text-white">
            Continue to Wave {currentWave + 1}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400">
          <p>💡 Tip: Items stack! Collect multiple of the same type for stronger effects.</p>
        </div>
      </div>
    </div>
  );
};

export default Shop;