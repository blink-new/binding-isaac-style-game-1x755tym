export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface BulletModifier {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effects: {
    damage?: number;
    speed?: number;
    size?: number;
    fireRate?: number;
    piercing?: boolean;
    homing?: boolean;
    splitting?: boolean;
    bouncing?: boolean;
    explosive?: boolean;
    poison?: boolean;
    freeze?: boolean;
    knockback?: number;
    multiShot?: number;
    spread?: number;
    range?: number;
    lifeSteal?: number;
  };
  visualEffects: {
    color?: string;
    trail?: boolean;
    glow?: boolean;
    particles?: boolean;
    size?: number;
    shape?: 'circle' | 'square' | 'diamond' | 'star';
  };
}

export interface Bullet {
  id: string;
  position: Position;
  velocity: Velocity;
  damage: number;
  size: number;
  color: string;
  piercing: boolean;
  homing: boolean;
  bouncing: boolean;
  explosive: boolean;
  poison: boolean;
  freeze: boolean;
  knockback: number;
  range: number;
  distanceTraveled: number;
  trail: boolean;
  glow: boolean;
  particles: boolean;
  shape: 'circle' | 'square' | 'diamond' | 'star';
  lifeSteal: number;
  createdAt: number;
}

export interface Enemy {
  id: string;
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  damage: number;
  size: number;
  color: string;
  type: 'basic' | 'fast' | 'tank' | 'shooter' | 'boss';
  ai: 'chase' | 'patrol' | 'ranged' | 'boss';
  lastShot: number;
  shootCooldown: number;
  stunned: boolean;
  poisoned: boolean;
  frozen: boolean;
  knockbackVelocity: Velocity;
}

export interface Player {
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  fireRate: number;
  lastShot: number;
  size: number;
  items: BulletModifier[];
  stats: {
    damage: number;
    speed: number;
    fireRate: number;
    range: number;
    piercing: boolean;
    homing: boolean;
    multiShot: number;
    spread: number;
    knockback: number;
    lifeSteal: number;
  };
}

export interface Room {
  id: string;
  position: Position;
  type: 'normal' | 'boss' | 'treasure' | 'shop';
  enemies: Enemy[];
  items: BulletModifier[];
  cleared: boolean;
  visited: boolean;
  doors: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
  };
}

export interface GameState {
  player: Player;
  currentRoom: Room;
  rooms: Room[];
  bullets: Bullet[];
  enemyBullets: Bullet[];
  score: number;
  level: number;
  gameOver: boolean;
  paused: boolean;
  keys: { [key: string]: boolean };
  mousePosition: Position;
  mousePressed: boolean;
  // Wave system
  currentWave: number;
  waveState: 'starting' | 'fighting' | 'shopping' | 'preparing';
  enemiesRemaining: number;
  waveTimer: number;
  shopItems: BulletModifier[];
  playerMoney: number;
  purchasedItems: string[]; // Track purchased item IDs per shop
  // Directional shooting
  lastDirectionalShot: number;
}