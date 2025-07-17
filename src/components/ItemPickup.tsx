import React from 'react';
import { BulletModifier } from '../types/game';
import { Button } from './ui/button';

interface ItemPickupProps {
  item: BulletModifier;
  onAccept: () => void;
  onDecline: () => void;
}

const ItemPickup: React.FC<ItemPickupProps> = ({ item, onAccept, onDecline }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-gray-700 rounded-lg p-6 max-w-md mx-4 animate-slide-up">
        <div className="text-center mb-4">
          <div 
            className="text-6xl mb-2 item-glow"
            style={{ color: item.color }}
          >
            {item.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
          <p className="text-gray-300 text-sm mb-4">{item.description}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h4 className="text-white font-semibold mb-2">Effects:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            {item.effects.damage && (
              <div className="flex justify-between">
                <span>Damage:</span>
                <span className="text-red-400">×{item.effects.damage}</span>
              </div>
            )}
            {item.effects.speed && (
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="text-green-400">×{item.effects.speed}</span>
              </div>
            )}
            {item.effects.fireRate && (
              <div className="flex justify-between">
                <span>Fire Rate:</span>
                <span className="text-yellow-400">×{item.effects.fireRate}</span>
              </div>
            )}
            {item.effects.size && (
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="text-purple-400">×{item.effects.size}</span>
              </div>
            )}
            {item.effects.piercing && (
              <div className="text-blue-400">• Piercing shots</div>
            )}
            {item.effects.homing && (
              <div className="text-purple-400">• Homing tears</div>
            )}
            {item.effects.multiShot && (
              <div className="text-yellow-400">• Multi-shot ({item.effects.multiShot})</div>
            )}
            {item.effects.explosive && (
              <div className="text-orange-400">• Explosive bullets</div>
            )}
            {item.effects.poison && (
              <div className="text-green-400">• Poison damage</div>
            )}
            {item.effects.freeze && (
              <div className="text-cyan-400">• Freeze enemies</div>
            )}
            {item.effects.bouncing && (
              <div className="text-pink-400">• Bouncing bullets</div>
            )}
            {item.effects.splitting && (
              <div className="text-orange-300">• Splitting bullets</div>
            )}
            {item.effects.knockback && (
              <div className="flex justify-between">
                <span>Knockback:</span>
                <span className="text-orange-400">+{item.effects.knockback}</span>
              </div>
            )}
            {item.effects.lifeSteal && (
              <div className="flex justify-between">
                <span>Life Steal:</span>
                <span className="text-pink-400">+{(item.effects.lifeSteal * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Take Item
          </Button>
          <Button 
            onClick={onDecline}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Leave
          </Button>
        </div>

        <div className="text-center mt-3 text-xs text-gray-500">
          Items stack and combine in unique ways!
        </div>
      </div>
    </div>
  );
};

export default ItemPickup;