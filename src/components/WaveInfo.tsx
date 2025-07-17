import React from 'react';

interface WaveInfoProps {
  currentWave: number;
  enemiesRemaining: number;
  waveState: 'starting' | 'fighting' | 'shopping' | 'preparing';
  waveTimer: number;
}

const WaveInfo: React.FC<WaveInfoProps> = ({ currentWave, enemiesRemaining, waveState, waveTimer }) => {
  const getWaveStateText = () => {
    switch (waveState) {
      case 'starting':
        return `Get Ready! ${Math.ceil(waveTimer / 1000)}s`;
      case 'fighting':
        return `Enemies: ${enemiesRemaining}`;
      case 'preparing':
        return `Next wave in: ${Math.ceil(waveTimer / 1000)}s`;
      case 'shopping':
        return 'Shop Open';
      default:
        return '';
    }
  };

  const getWaveStateColor = () => {
    switch (waveState) {
      case 'starting':
        return 'text-blue-400';
      case 'fighting':
        return 'text-red-400';
      case 'preparing':
        return 'text-yellow-400';
      case 'shopping':
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none">
      <div className="bg-black/80 p-3 rounded-lg border border-gray-700 text-center">
        <div className="text-white text-lg font-bold mb-1">
          Wave {currentWave}
        </div>
        <div className={`text-sm font-semibold ${getWaveStateColor()}`}>
          {getWaveStateText()}
        </div>
        
        {waveState === 'starting' && (
          <div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-100"
              style={{ 
                width: `${Math.max(0, (1 - waveTimer / 5000) * 100)}%` 
              }}
            />
          </div>
        )}
        
        {waveState === 'fighting' && (
          <div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all duration-300"
              style={{ 
                width: `${Math.max(0, (1 - enemiesRemaining / (currentWave * 3 + 5)) * 100)}%` 
              }}
            />
          </div>
        )}
        
        {waveState === 'preparing' && (
          <div className="mt-2 w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-100"
              style={{ 
                width: `${Math.max(0, (1 - waveTimer / 3000) * 100)}%` 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveInfo;