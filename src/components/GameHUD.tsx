import React from 'react';
import { Player } from '../types/game';

interface GameHUDProps {
  player: Player;
  score: number;
  level: number;
}

const GameHUD: React.FC<GameHUDProps> = ({ player, score, level }) => {
  const renderHearts = () => {
    const hearts = [];
    const fullHearts = Math.floor(player.health);
    const hasHalfHeart = player.health % 1 !== 0;
    
    for (let i = 0; i < player.maxHealth; i++) {
      if (i < fullHearts) {
        hearts.push(
          <span key={i} className="text-red-500 text-xl health-heart">❤️</span>
        );
      } else if (i === fullHearts && hasHalfHeart) {
        hearts.push(
          <span key={i} className="text-red-300 text-xl">💔</span>
        );
      } else {
        hearts.push(
          <span key={i} className="text-gray-600 text-xl">🖤</span>
        );
      }
    }
    
    return hearts;
  };

  const renderItems = () => {
    return player.items.map((item, index) => (
      <div
        key={item.id}
        className="flex items-center justify-center w-8 h-8 bg-gray-800 border border-gray-600 rounded text-xs"
        title={`${item.name}: ${item.description}`}
      >
        <span className="text-xs">{item.icon}</span>
      </div>
    ));
  };

  return (
    <div className="absolute top-4 left-4 right-4 pointer-events-none">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        {/* Health and Stats */}
        <div className="bg-black/80 p-3 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-sm font-bold">Health:</span>
            <div className="flex gap-1">
              {renderHearts()}
            </div>
          </div>
          
          <div className="text-xs text-gray-300 space-y-1">
            <div>Damage: {player.stats.damage.toFixed(1)}</div>
            <div>Fire Rate: {player.stats.fireRate.toFixed(1)}</div>
            <div>Speed: {player.stats.speed.toFixed(1)}</div>
          </div>
        </div>

        {/* Score and Level */}
        <div className="bg-black/80 p-3 rounded-lg border border-gray-700 text-right">
          <div className="text-white text-lg font-bold">Score: {score.toLocaleString()}</div>
          <div className="text-gray-300 text-sm">Level: {level}</div>
        </div>
      </div>

      {/* Items Inventory */}
      {player.items.length > 0 && (
        <div className="mt-4 bg-black/80 p-3 rounded-lg border border-gray-700 max-w-md">
          <div className="text-white text-sm font-bold mb-2">Items ({player.items.length}):</div>
          <div className="flex flex-wrap gap-2">
            {renderItems()}
          </div>
        </div>
      )}

      {/* Item Effects Summary */}
      {player.items.length > 0 && (
        <div className="mt-2 bg-black/80 p-2 rounded-lg border border-gray-700 max-w-md">
          <div className="text-xs text-gray-300 space-y-1">
            {player.stats.piercing && <div className="text-blue-400">• Piercing Shots</div>}
            {player.stats.homing && <div className="text-purple-400">• Homing Tears</div>}
            {player.stats.multiShot > 1 && <div className="text-yellow-400">• Multi Shot ({player.stats.multiShot})</div>}
            {player.stats.knockback > 0 && <div className="text-orange-400">• Knockback ({player.stats.knockback})</div>}
            {player.stats.lifeSteal > 0 && <div className="text-pink-400">• Life Steal ({(player.stats.lifeSteal * 100).toFixed(0)}%)</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUD;