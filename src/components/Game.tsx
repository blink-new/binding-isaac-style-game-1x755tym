import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Player, Room, Bullet, Enemy, Position } from '../types/game';
import { BULLET_MODIFIERS, getRandomItem, combineItemEffects } from '../data/items';
import GameHUD from './GameHUD';
import ItemPickup from './ItemPickup';

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
      enemies: generateEnemies(),
      items: [getRandomItem()],
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
      mousePressed: false
    };
  }

  function generateEnemies(): Enemy[] {
    const enemies: Enemy[] = [];
    const enemyCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < enemyCount; i++) {
      const enemy: Enemy = {
        id: `enemy_${i}`,
        position: {
          x: Math.random() * (ROOM_WIDTH - 60) + 50,
          y: Math.random() * (ROOM_HEIGHT - 60) + 50
        },
        velocity: { x: 0, y: 0 },
        health: 3,
        maxHealth: 3,
        damage: 1,
        size: 20,
        color: '#ff4444',
        type: 'basic',
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

      // Update player movement
      updatePlayerMovement(newState);

      // Handle shooting
      if (newState.mousePressed) {
        handleShooting(newState, now);
      }

      // Update bullets
      updateBullets(newState);

      // Update enemies
      updateEnemies(newState, now);

      // Check collisions
      checkCollisions(newState);

      // Check if room is cleared
      if (newState.currentRoom.enemies.length === 0 && !newState.currentRoom.cleared) {
        newState.currentRoom.cleared = true;
        newState.score += 100;
      }

      return newState;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function handleShooting(state: GameState, now: number) {
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

    player.lastShot = now;
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
          const speed = 1;
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

    // Remove dead enemies
    state.currentRoom.enemies = state.currentRoom.enemies.filter(enemy => enemy.health > 0);
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

          // Handle splitting bullets
          if (bullet.splitting) {
            for (let i = 0; i < 3; i++) {
              const angle = (Math.PI * 2 / 3) * i;
              const splitBullet: Bullet = {
                ...bullet,
                id: `split_${bullet.id}_${i}`,
                position: { ...bullet.position },
                velocity: {
                  x: Math.cos(angle) * 4,
                  y: Math.sin(angle) * 4
                },
                damage: bullet.damage * 0.5,
                size: bullet.size * 0.7,
                distanceTraveled: 0,
                splitting: false
              };
              state.bullets.push(splitBullet);
            }
          }

          // Remove bullet if not piercing
          if (!bullet.piercing) {
            state.bullets.splice(bulletIndex, 1);
          }

          state.score += 10;
        }
      });
    });

    // Player vs Item collisions
    state.currentRoom.items.forEach((item, itemIndex) => {
      const itemPos = { x: 100 + itemIndex * 60, y: 100 };
      if (isColliding(state.player.position, { width: state.player.size, height: state.player.size },
                     itemPos, { width: 40, height: 40 })) {
        
        // Show pickup UI
        setShowItemPickup({ item, position: itemPos });
        
        // Remove item from room
        state.currentRoom.items.splice(itemIndex, 1);
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

  const handleItemPickup = (accept: boolean) => {
    if (!showItemPickup) return;
    
    if (accept) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          items: [...prev.player.items, showItemPickup.item]
        }
      }));
    }
    
    setShowItemPickup(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Draw items
    gameState.currentRoom.items.forEach((item, index) => {
      const x = 100 + index * 60;
      const y = 100;
      
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, 40, 40);
      
      // Item glow effect
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(x, y, 40, 40);
      ctx.shadowBlur = 0;
      
      // Item icon
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(item.icon, x + 20, y + 25);
    });

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
        />
        
        {showItemPickup && (
          <ItemPickup
            item={showItemPickup.item}
            onAccept={() => handleItemPickup(true)}
            onDecline={() => handleItemPickup(false)}
          />
        )}
      </div>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>WASD to move • Mouse to aim and shoot • Collect items to upgrade your bullets!</p>
      </div>
    </div>
  );
};

export default Game;