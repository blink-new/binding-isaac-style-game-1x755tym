import React from 'react';
import { BulletModifier } from '../types/game';
import { Button } from './ui/button';

interface ShopProps {
  items: BulletModifier[];
  playerMoney: number;
  onPurchase: (item: BulletModifier) => void;
  onClose: () => void;
  currentWave: number;
}

const Shop: React.FC<ShopProps> = ({ items, playerMoney, onPurchase, onClose, currentWave }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-100';
      case 'rare': return 'border-blue-400 bg-blue-100';
      case 'epic': return 'border-purple-400 bg-purple-100';
      case 'legendary': return 'border-yellow-400 bg-yellow-100';
      default: return 'border-gray-400 bg-gray-100';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-700';
      case 'rare': return 'text-blue-700';
      case 'epic': return 'text-purple-700';
      case 'legendary': return 'text-yellow-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-background border-2 border-primary rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">ITEM SHOP</h2>
          <p className="text-lg text-muted-foreground">Wave {currentWave} Complete!</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-accent">{playerMoney}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {items.map((item) => {
            const canAfford = playerMoney >= item.price;
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 ${getRarityColor(item.rarity)} ${
                  !canAfford ? 'opacity-50' : ''
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className={`text-sm font-semibold uppercase ${getRarityTextColor(item.rarity)}`}>
                    {item.rarity}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground mb-4 text-center min-h-[40px]">{item.description}</p>

                <div className="space-y-2 mb-4">
                  {/* Show item effects */}
                  {item.effects.damage && item.effects.damage !== 1 && (
                    <div className="text-xs text-red-600">+{((item.effects.damage - 1) * 100).toFixed(0)}% Damage</div>
                  )}
                  {item.effects.speed && item.effects.speed !== 1 && (
                    <div className="text-xs text-green-600">+{((item.effects.speed - 1) * 100).toFixed(0)}% Speed</div>
                  )}
                  {item.effects.fireRate && item.effects.fireRate !== 1 && (
                    <div className="text-xs text-orange-600">+{((item.effects.fireRate - 1) * 100).toFixed(0)}% Fire Rate</div>
                  )}
                  {item.effects.piercing && <div className="text-xs text-blue-600">Piercing</div>}
                  {item.effects.homing && <div className="text-xs text-purple-600">Homing</div>}
                  {item.effects.multiShot && item.effects.multiShot > 1 && (
                    <div className="text-xs text-yellow-600">+{item.effects.multiShot - 1} Extra Shots</div>
                  )}
                  {item.effects.explosive && <div className="text-xs text-red-600">Explosive</div>}
                  {item.effects.poison && <div className="text-xs text-green-600">Poison</div>}
                  {item.effects.freeze && <div className="text-xs text-cyan-600">Freeze</div>}
                  {item.effects.lifeSteal && (
                    <div className="text-xs text-pink-600">+{(item.effects.lifeSteal * 100).toFixed(0)}% Life Steal</div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">💰</span>
                    <span className="font-bold text-lg">{item.price}</span>
                  </div>
                  <Button
                    onClick={() => onPurchase(item)}
                    disabled={!canAfford}
                    size="sm"
                    className={canAfford ? 'bg-accent hover:bg-accent/80' : ''}
                  >
                    {canAfford ? 'Buy' : 'Too Expensive'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button onClick={onClose} size="lg" className="bg-primary hover:bg-primary/80">
            Continue to Wave {currentWave + 1}
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>💡 Tip: Items stack! Collect multiple of the same type for stronger effects.</p>
        </div>
      </div>
    </div>
  );
};

export default Shop;