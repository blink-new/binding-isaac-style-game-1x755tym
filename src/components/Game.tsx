import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Room, Bullet, Enemy, Position } from '../types/game';
import { BULLET_MODIFIERS, getRandomShopItems, combineItemEffects } from '../data/items';
import GameHUD from './GameHUD';
import ItemPickup from './ItemPickup';
import Shop from './Shop';
import WaveInfo from './WaveInfo';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROOM_WIDTH = 760;
const ROOM_HEIGHT = 560;
const WALL_THICKNESS = 20;

const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());
  const [showItemPickup, setShowItemPickup] = useState<{ item: any; position: Position } | null>(null);

  function initializeGame(): GameState {
    const player: Player = {
      position: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      velocity: { x: 0, y: 0 },
      health: 6,
      maxHealth: 6,
      damage: 1,
      speed: 3,
      fireRate: 1,
      lastShot: 0,
      size: 16,
      items: [],
      stats: {
        damage: 1,
        speed: 3,
        fireRate: 1,
        range: 300,
        piercing: false,
        homing: false,
        multiShot: 1,
        spread: 0,
        knockback: 0,
        lifeSteal: 0
      }
    };

    const room: Room = {
      id: 'room_1',
      position: { x: 0, y: 0 },
      type: 'normal',
      enemies: [],
      items: [],
      cleared: false,
      visited: true,
      doors: { north: true, south: true, east: true, west: true }
    };

    return {
      player,
      currentRoom: room,
      rooms: [room],
      bullets: [],
      enemyBullets: [],
      score: 0,
      level: 1,
      gameOver: false,
      paused: false,
      keys: {},
      mousePosition: { x: 0, y: 0 },
      mousePressed: false,
      // Wave system
      currentWave: 1,
      waveState: 'preparing',
      enemiesRemaining: 0,
      waveTimer: 3000, // 3 seconds to prepare
      shopItems: [],
      playerMoney: 50, // Starting money
      // Directional shooting
      lastDirectionalShot: 0
    };
  }

  function generateEnemiesForWave(wave: number): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyCount = Math.min(wave * 3 + 5, 20); // Cap at 20 enemies
    
    for (let i = 0; i < enemyCount; i++) {
      const enemyTypes = ['basic', 'fast', 'tank'];
      const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)] as 'basic' | 'fast' | 'tank';
      
      let health = 3;
      let size = 20;
      let color = '#ff4444';
      let speed = 1;
      
      // Adjust stats based on type and wave
      switch (type) {
        case 'fast':
          health = Math.max(1, 2 + Math.floor(wave / 3));
          speed = 1.5 + wave * 0.1;
          color = '#44ff44';
          size = 16;
          break;
        case 'tank':
          health = 5 + Math.floor(wave / 2);
          speed = 0.5 + wave * 0.05;
          color = '#4444ff';
          size = 28;
          break;
        default: // basic
          health = 3 + Math.floor(wave / 4);
          speed = 1 + wave * 0.05;
          break;
      }

      const enemy: Enemy = {
        id: `enemy_${wave}_${i}`,
        position: {
          x: Math.random() * (ROOM_WIDTH - 60) + 50,
          y: Math.random() * (ROOM_HEIGHT - 60) + 50
        },
        velocity: { x: 0, y: 0 },
        health,
        maxHealth: health,
        damage: 1 + Math.floor(wave / 5),
        size,
        color,
        type,
        ai: 'chase',
        lastShot: 0,
        shootCooldown: 2000,
        stunned: false,
        poisoned: false,
        frozen: false,
        knockbackVelocity: { x: 0, y: 0 }
      };
      enemies.push(enemy);
    }
    
    return enemies;
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [e.key.toLowerCase()]: true }
    }));
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setGameState(prev => ({
      ...prev,
      keys: { ...prev.keys, [e.key.toLowerCase()]: false }
    }));
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setGameState(prev => ({
      ...prev,
      mousePosition: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setGameState(prev => ({ ...prev, mousePressed: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setGameState(prev => ({ ...prev, mousePressed: false }));
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseMove, handleMouseDown, handleMouseUp]);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver || prev.paused) return prev;

      const newState = { ...prev };
      const now = Date.now();

      // Update wave system
      updateWaveSystem(newState, now);

      // Only update game mechanics during fighting phase
      if (newState.waveState === 'fighting') {
        // Update player movement
        updatePlayerMovement(newState);

        // Handle shooting (mouse and directional)
        if (newState.mousePressed) {
          handleMouseShooting(newState, now);
        }
        handleDirectionalShooting(newState, now);

        // Update bullets
        updateBullets(newState);

        // Update enemies
        updateEnemies(newState, now);

        // Check collisions
        checkCollisions(newState);
      }

      return newState;
    });
  }, []);

  function updateWaveSystem(state: GameState, now: number) {
    switch (state.waveState) {
      case 'preparing':
        state.waveTimer -= 16; // Assuming 60fps
        if (state.waveTimer <= 0) {
          // Start the wave
          state.waveState = 'fighting';
          state.currentRoom.enemies = generateEnemiesForWave(state.currentWave);
          state.enemiesRemaining = state.currentRoom.enemies.length;
        }
        break;
        
      case 'fighting':
        state.enemiesRemaining = state.currentRoom.enemies.length;
        if (state.enemiesRemaining === 0) {
          // Wave completed
          state.waveState = 'shopping';
          state.shopItems = getRandomShopItems(3);
          state.playerMoney += 20 + state.currentWave * 5; // Money reward
          state.score += 100 * state.currentWave;
        }
        break;
        
      case 'shopping':
        // Shop is handled by UI component
        break;
    }
  }

  function updatePlayerMovement(state: GameState) {
    const { player, keys } = state;
    let vx = 0, vy = 0;

    if (keys['w'] || keys['arrowup']) vy -= 1;
    if (keys['s'] || keys['arrowdown']) vy += 1;
    if (keys['a'] || keys['arrowleft']) vx -= 1;
    if (keys['d'] || keys['arrowright']) vx += 1;

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    player.velocity.x = vx * player.stats.speed;
    player.velocity.y = vy * player.stats.speed;

    // Update position with wall collision
    const newX = player.position.x + player.velocity.x;
    const newY = player.position.y + player.velocity.y;

    if (newX > WALL_THICKNESS && newX < CANVAS_WIDTH - WALL_THICKNESS - player.size) {
      player.position.x = newX;
    }
    if (newY > WALL_THICKNESS && newY < CANVAS_HEIGHT - WALL_THICKNESS - player.size) {
      player.position.y = newY;
    }
  }

  function handleMouseShooting(state: GameState, now: number) {
    const { player, mousePosition } = state;
    const timeSinceLastShot = now - player.lastShot;
    const fireDelay = 200 / player.stats.fireRate;

    if (timeSinceLastShot < fireDelay) return;

    const dx = mousePosition.x - (player.position.x + player.size / 2);
    const dy = mousePosition.y - (player.position.y + player.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const dirX = dx / distance;
    const dirY = dy / distance;

    createBullets(state, dirX, dirY, now);
    player.lastShot = now;
  }

  function handleDirectionalShooting(state: GameState, now: number) {
    const { player, keys } = state;
    const timeSinceLastShot = now - state.lastDirectionalShot;
    const fireDelay = 150 / player.stats.fireRate; // Slightly faster for directional

    if (timeSinceLastShot < fireDelay) return;

    let dirX = 0, dirY = 0;

    // Check for arrow keys or IJKL for shooting
    if (keys['arrowup'] || keys['i']) dirY = -1;
    if (keys['arrowdown'] || keys['k']) dirY = 1;
    if (keys['arrowleft'] || keys['j']) dirX = -1;
    if (keys['arrowright'] || keys['l']) dirX = 1;

    if (dirX === 0 && dirY === 0) return;

    // Normalize diagonal shooting
    if (dirX !== 0 && dirY !== 0) {
      dirX *= 0.707;
      dirY *= 0.707;
    }

    createBullets(state, dirX, dirY, now);
    state.lastDirectionalShot = now;
  }

  function createBullets(state: GameState, dirX: number, dirY: number, now: number) {
    const { player } = state;
    
    // Create bullets based on multiShot
    const bulletCount = Math.max(1, player.stats.multiShot);
    const spreadAngle = player.stats.spread;

    for (let i = 0; i < bulletCount; i++) {
      let angle = Math.atan2(dirY, dirX);
      
      if (bulletCount > 1) {
        const spreadOffset = (i - (bulletCount - 1) / 2) * spreadAngle;
        angle += spreadOffset;
      }

      const bulletDirX = Math.cos(angle);
      const bulletDirY = Math.sin(angle);

      const combined = combineItemEffects(player.items);
      
      const bullet: Bullet = {
        id: `bullet_${now}_${i}`,
        position: {
          x: player.position.x + player.size / 2,
          y: player.position.y + player.size / 2
        },
        velocity: {
          x: bulletDirX * 8 * player.stats.speed * combined.stats.speed,
          y: bulletDirY * 8 * player.stats.speed * combined.stats.speed
        },
        damage: player.stats.damage * combined.stats.damage,
        size: 6 * combined.stats.size * combined.visual.size,
        color: combined.visual.color,
        piercing: combined.stats.piercing,
        homing: combined.stats.homing,
        bouncing: combined.stats.bouncing,
        explosive: combined.stats.explosive,
        poison: combined.stats.poison,
        freeze: combined.stats.freeze,
        knockback: combined.stats.knockback,
        range: player.stats.range * combined.stats.range,
        distanceTraveled: 0,
        trail: combined.visual.trail,
        glow: combined.visual.glow,
        particles: combined.visual.particles,
        shape: combined.visual.shape,
        lifeSteal: combined.stats.lifeSteal,
        createdAt: now
      };

      state.bullets.push(bullet);
    }
  }

  function updateBullets(state: GameState) {
    // Update player bullets
    state.bullets = state.bullets.filter(bullet => {
      bullet.position.x += bullet.velocity.x;
      bullet.position.y += bullet.velocity.y;
      bullet.distanceTraveled += Math.sqrt(bullet.velocity.x ** 2 + bullet.velocity.y ** 2);

      // Homing behavior
      if (bullet.homing && state.currentRoom.enemies.length > 0) {
        const nearestEnemy = findNearestEnemy(bullet.position, state.currentRoom.enemies);
        if (nearestEnemy) {
          const dx = nearestEnemy.position.x - bullet.position.x;
          const dy = nearestEnemy.position.y - bullet.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const homingStrength = 0.1;
            bullet.velocity.x += (dx / distance) * homingStrength;
            bullet.velocity.y += (dy / distance) * homingStrength;
          }
        }
      }

      // Bouncing off walls
      if (bullet.bouncing) {
        if (bullet.position.x <= WALL_THICKNESS || bullet.position.x >= CANVAS_WIDTH - WALL_THICKNESS) {
          bullet.velocity.x *= -1;
        }
        if (bullet.position.y <= WALL_THICKNESS || bullet.position.y >= CANVAS_HEIGHT - WALL_THICKNESS) {
          bullet.velocity.y *= -1;
        }
      }

      // Remove bullets that are out of bounds or out of range
      return bullet.distanceTraveled < bullet.range &&
             bullet.position.x > -50 && bullet.position.x < CANVAS_WIDTH + 50 &&
             bullet.position.y > -50 && bullet.position.y < CANVAS_HEIGHT + 50;
    });
  }

  function findNearestEnemy(position: Position, enemies: Enemy[]): Enemy | null {
    let nearest = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
      const dx = enemy.position.x - position.x;
      const dy = enemy.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    });

    return nearest;
  }

  function updateEnemies(state: GameState, now: number) {
    state.currentRoom.enemies.forEach(enemy => {
      if (enemy.frozen) return;

      // Apply knockback
      if (enemy.knockbackVelocity.x !== 0 || enemy.knockbackVelocity.y !== 0) {
        enemy.position.x += enemy.knockbackVelocity.x;
        enemy.position.y += enemy.knockbackVelocity.y;
        enemy.knockbackVelocity.x *= 0.9;
        enemy.knockbackVelocity.y *= 0.9;
        
        if (Math.abs(enemy.knockbackVelocity.x) < 0.1) enemy.knockbackVelocity.x = 0;
        if (Math.abs(enemy.knockbackVelocity.y) < 0.1) enemy.knockbackVelocity.y = 0;
      }

      // Basic AI - chase player
      if (enemy.ai === 'chase') {
        const dx = state.player.position.x - enemy.position.x;
        const dy = state.player.position.y - enemy.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          let speed = 1;
          if (enemy.type === 'fast') speed = 1.5;
          if (enemy.type === 'tank') speed = 0.5;
          
          enemy.velocity.x = (dx / distance) * speed;
          enemy.velocity.y = (dy / distance) * speed;
          
          enemy.position.x += enemy.velocity.x;
          enemy.position.y += enemy.velocity.y;
        }
      }

      // Apply poison damage
      if (enemy.poisoned) {
        enemy.health -= 0.02;
      }

      // Keep enemies in bounds
      enemy.position.x = Math.max(WALL_THICKNESS, Math.min(CANVAS_WIDTH - WALL_THICKNESS - enemy.size, enemy.position.x));
      enemy.position.y = Math.max(WALL_THICKNESS, Math.min(CANVAS_HEIGHT - WALL_THICKNESS - enemy.size, enemy.position.y));
    });

    // Remove dead enemies and award money
    const initialCount = state.currentRoom.enemies.length;
    state.currentRoom.enemies = state.currentRoom.enemies.filter(enemy => {
      if (enemy.health <= 0) {
        state.playerMoney += 2 + Math.floor(state.currentWave / 3); // Money per kill
        state.score += 10;
        return false;
      }
      return true;
    });
  }

  function checkCollisions(state: GameState) {
    // Bullet vs Enemy collisions
    state.bullets.forEach((bullet, bulletIndex) => {
      state.currentRoom.enemies.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet.position, { width: bullet.size, height: bullet.size }, 
                       enemy.position, { width: enemy.size, height: enemy.size })) {
          
          // Apply damage
          enemy.health -= bullet.damage;
          
          // Apply effects
          if (bullet.poison) enemy.poisoned = true;
          if (bullet.freeze) enemy.frozen = true;
          if (bullet.knockback > 0) {
            const dx = enemy.position.x - bullet.position.x;
            const dy = enemy.position.y - bullet.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              enemy.knockbackVelocity.x = (dx / distance) * bullet.knockback;
              enemy.knockbackVelocity.y = (dy / distance) * bullet.knockback;
            }
          }
          
          // Life steal
          if (bullet.lifeSteal > 0) {
            state.player.health = Math.min(state.player.maxHealth, 
              state.player.health + bullet.lifeSteal);
          }

          // Remove bullet if not piercing
          if (!bullet.piercing) {
            state.bullets.splice(bulletIndex, 1);
          }
        }
      });
    });

    // Player vs Enemy collisions (damage player)
    state.currentRoom.enemies.forEach(enemy => {
      if (isColliding(state.player.position, { width: state.player.size, height: state.player.size },
                     enemy.position, { width: enemy.size, height: enemy.size })) {
        // Simple damage system - could be improved with invincibility frames
        state.player.health -= 0.01; // Small continuous damage
        if (state.player.health <= 0) {
          state.gameOver = true;
        }
      }
    });
  }

  function isColliding(pos1: Position, size1: { width: number; height: number },
                      pos2: Position, size2: { width: number; height: number }): boolean {
    return pos1.x < pos2.x + size2.width &&
           pos1.x + size1.width > pos2.x &&
           pos1.y < pos2.y + size2.height &&
           pos1.y + size1.height > pos2.y;
  }

  const handleShopPurchase = (item: any) => {
    setGameState(prev => {
      if (prev.playerMoney >= item.price) {
        return {
          ...prev,
          player: {
            ...prev.player,
            items: [...prev.player.items, item]
          },
          playerMoney: prev.playerMoney - item.price
        };
      }
      return prev;
    });
  };

  const handleShopClose = () => {
    setGameState(prev => ({
      ...prev,
      waveState: 'preparing',
      waveTimer: 3000,
      currentWave: prev.currentWave + 1,
      shopItems: []
    }));
  };

  useEffect(() => {
    const gameLoop = () => {
      updateGame();
      draw();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateGame]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw walls
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, CANVAS_WIDTH, WALL_THICKNESS); // Top
    ctx.fillRect(0, CANVAS_HEIGHT - WALL_THICKNESS, CANVAS_WIDTH, WALL_THICKNESS); // Bottom
    ctx.fillRect(0, 0, WALL_THICKNESS, CANVAS_HEIGHT); // Left
    ctx.fillRect(CANVAS_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, CANVAS_HEIGHT); // Right

    // Draw enemies
    gameState.currentRoom.enemies.forEach(enemy => {
      ctx.fillStyle = enemy.color;
      if (enemy.frozen) ctx.fillStyle = '#88ddff';
      if (enemy.poisoned) ctx.fillStyle = '#44ff88';
      
      ctx.fillRect(enemy.position.x, enemy.position.y, enemy.size, enemy.size);
      
      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(enemy.position.x, enemy.position.y - 8, enemy.size, 4);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(enemy.position.x, enemy.position.y - 8, enemy.size * healthPercent, 4);
    });

    // Draw bullets
    gameState.bullets.forEach(bullet => {
      ctx.fillStyle = bullet.color;
      
      if (bullet.glow) {
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 8;
      }
      
      if (bullet.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(bullet.position.x + bullet.size / 2, bullet.position.y + bullet.size / 2, bullet.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (bullet.shape === 'diamond') {
        ctx.save();
        ctx.translate(bullet.position.x + bullet.size / 2, bullet.position.y + bullet.size / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-bullet.size / 2, -bullet.size / 2, bullet.size, bullet.size);
        ctx.restore();
      } else if (bullet.shape === 'star') {
        drawStar(ctx, bullet.position.x + bullet.size / 2, bullet.position.y + bullet.size / 2, bullet.size / 2);
      } else {
        ctx.fillRect(bullet.position.x, bullet.position.y, bullet.size, bullet.size);
      }
      
      ctx.shadowBlur = 0;
    });

    // Draw player
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(gameState.player.position.x, gameState.player.position.y, gameState.player.size, gameState.player.size);
    
    // Player eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gameState.player.position.x + 4, gameState.player.position.y + 4, 3, 3);
    ctx.fillRect(gameState.player.position.x + 9, gameState.player.position.y + 4, 3, 3);
  };

  function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x1 = x + Math.cos(angle) * radius;
      const y1 = y + Math.sin(angle) * radius;
      
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      
      const innerAngle = ((i + 0.5) * Math.PI * 2) / 5 - Math.PI / 2;
      const x2 = x + Math.cos(innerAngle) * (radius * 0.4);
      const y2 = y + Math.sin(innerAngle) * (radius * 0.4);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas pixel-perfect"
        />
        
        <GameHUD 
          player={gameState.player}
          score={gameState.score}
          level={gameState.level}
          money={gameState.playerMoney}
        />
        
        <WaveInfo
          currentWave={gameState.currentWave}
          enemiesRemaining={gameState.enemiesRemaining}
          waveState={gameState.waveState}
          waveTimer={gameState.waveTimer}
        />
        
        {gameState.waveState === 'shopping' && (
          <Shop
            items={gameState.shopItems}
            playerMoney={gameState.playerMoney}
            onPurchase={handleShopPurchase}
            onClose={handleShopClose}
            currentWave={gameState.currentWave}
          />
        )}
        
        {showItemPickup && (
          <ItemPickup
            item={showItemPickup.item}
            onAccept={() => setShowItemPickup(null)}
            onDecline={() => setShowItemPickup(null)}
          />
        )}
        
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="bg-background border-2 border-primary rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-primary mb-4">GAME OVER</h2>
              <p className="text-lg mb-2">Final Score: {gameState.score.toLocaleString()}</p>
              <p className="text-lg mb-4">Wave Reached: {gameState.currentWave}</p>
              <button 
                onClick={() => setGameState(initializeGame())}
                className="bg-accent hover:bg-accent/80 text-white px-6 py-2 rounded font-bold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>WASD to move • Mouse to aim and shoot • Arrow keys for directional shooting</p>
        <p>Survive waves of enemies • Buy upgrades between waves!</p>
      </div>
    </div>
  );
};

export default Game;