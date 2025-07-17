import { BulletModifier } from '../types/game';

export const BULLET_MODIFIERS: BulletModifier[] = [
  {
    id: 'damage_up',
    name: 'Damage Up',
    description: 'Increases bullet damage',
    icon: '💪',
    color: '#ff4444',
    price: 15,
    rarity: 'common',
    effects: {
      damage: 2
    },
    visualEffects: {
      color: '#ff4444',
      glow: true
    }
  },
  {
    id: 'speed_up',
    name: 'Speed Up',
    description: 'Increases bullet speed',
    icon: '⚡',
    color: '#44ff44',
    price: 12,
    rarity: 'common',
    effects: {
      speed: 1.5
    },
    visualEffects: {
      trail: true,
      color: '#44ff44'
    }
  },
  {
    id: 'piercing_shots',
    name: 'Piercing Shots',
    description: 'Bullets pierce through enemies',
    icon: '🏹',
    color: '#4444ff',
    price: 25,
    rarity: 'rare',
    effects: {
      piercing: true
    },
    visualEffects: {
      color: '#4444ff',
      trail: true
    }
  },
  {
    id: 'homing_tears',
    name: 'Homing Tears',
    description: 'Bullets home in on enemies',
    icon: '🎯',
    color: '#ff44ff',
    price: 30,
    rarity: 'rare',
    effects: {
      homing: true
    },
    visualEffects: {
      color: '#ff44ff',
      particles: true
    }
  },
  {
    id: 'multi_shot',
    name: 'Multi Shot',
    description: 'Fire multiple bullets at once',
    icon: '🔫',
    color: '#ffff44',
    price: 35,
    rarity: 'rare',
    effects: {
      multiShot: 3,
      spread: 0.3
    },
    visualEffects: {
      color: '#ffff44'
    }
  },
  {
    id: 'explosive_shots',
    name: 'Explosive Shots',
    description: 'Bullets explode on impact',
    icon: '💥',
    color: '#ff8844',
    price: 45,
    rarity: 'epic',
    effects: {
      explosive: true,
      damage: 1.5
    },
    visualEffects: {
      color: '#ff8844',
      glow: true,
      size: 1.2
    }
  },
  {
    id: 'poison_tears',
    name: 'Poison Tears',
    description: 'Bullets poison enemies over time',
    icon: '☠️',
    color: '#44ff88',
    price: 20,
    rarity: 'common',
    effects: {
      poison: true
    },
    visualEffects: {
      color: '#44ff88',
      particles: true
    }
  },
  {
    id: 'freeze_shot',
    name: 'Freeze Shot',
    description: 'Bullets freeze enemies temporarily',
    icon: '❄️',
    color: '#88ddff',
    price: 22,
    rarity: 'common',
    effects: {
      freeze: true
    },
    visualEffects: {
      color: '#88ddff',
      glow: true
    }
  },
  {
    id: 'bouncing_tears',
    name: 'Bouncing Tears',
    description: 'Bullets bounce off walls',
    icon: '⚾',
    color: '#ff88ff',
    price: 28,
    rarity: 'rare',
    effects: {
      bouncing: true,
      range: 1.5
    },
    visualEffects: {
      color: '#ff88ff',
      trail: true
    }
  },
  {
    id: 'splitting_shot',
    name: 'Splitting Shot',
    description: 'Bullets split into smaller bullets on impact',
    icon: '🌟',
    color: '#ffaa44',
    price: 40,
    rarity: 'epic',
    effects: {
      splitting: true,
      damage: 0.8
    },
    visualEffects: {
      color: '#ffaa44',
      particles: true
    }
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Greatly increases fire rate',
    icon: '🔥',
    color: '#ff6644',
    price: 32,
    rarity: 'rare',
    effects: {
      fireRate: 2.5
    },
    visualEffects: {
      color: '#ff6644',
      trail: true
    }
  },
  {
    id: 'giant_tears',
    name: 'Giant Tears',
    description: 'Massive bullets with increased damage',
    icon: '🔴',
    color: '#aa44ff',
    price: 50,
    rarity: 'epic',
    effects: {
      size: 2,
      damage: 3,
      speed: 0.7
    },
    visualEffects: {
      size: 2,
      color: '#aa44ff',
      glow: true
    }
  },
  {
    id: 'life_steal',
    name: 'Life Steal',
    description: 'Bullets heal you when they hit enemies',
    icon: '❤️',
    color: '#ff4488',
    price: 60,
    rarity: 'legendary',
    effects: {
      lifeSteal: 0.1
    },
    visualEffects: {
      color: '#ff4488',
      glow: true,
      particles: true
    }
  },
  {
    id: 'knockback_shot',
    name: 'Knockback Shot',
    description: 'Bullets knock enemies back',
    icon: '👊',
    color: '#8844ff',
    price: 18,
    rarity: 'common',
    effects: {
      knockback: 5,
      damage: 1.2
    },
    visualEffects: {
      color: '#8844ff',
      glow: true
    }
  },
  {
    id: 'diamond_tears',
    name: 'Diamond Tears',
    description: 'Sharp diamond-shaped bullets',
    icon: '💎',
    color: '#44ffff',
    price: 38,
    rarity: 'rare',
    effects: {
      damage: 1.5,
      piercing: true
    },
    visualEffects: {
      shape: 'diamond',
      color: '#44ffff',
      glow: true
    }
  },
  {
    id: 'star_shot',
    name: 'Star Shot',
    description: 'Star-shaped bullets with special properties',
    icon: '⭐',
    color: '#ffff88',
    price: 42,
    rarity: 'epic',
    effects: {
      damage: 1.3,
      multiShot: 2,
      spread: 0.2
    },
    visualEffects: {
      shape: 'star',
      color: '#ffff88',
      particles: true
    }
  }
];

export function getRandomItem(): BulletModifier {
  return BULLET_MODIFIERS[Math.floor(Math.random() * BULLET_MODIFIERS.length)];
}

export function getRandomShopItems(count: number = 3): BulletModifier[] {
  const shuffled = [...BULLET_MODIFIERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function combineItemEffects(items: BulletModifier[]) {
  const baseStats = {
    damage: 1,
    speed: 1,
    fireRate: 1,
    size: 1,
    range: 1,
    piercing: false,
    homing: false,
    bouncing: false,
    explosive: false,
    poison: false,
    freeze: false,
    splitting: false,
    multiShot: 1,
    spread: 0,
    knockback: 0,
    lifeSteal: 0
  };

  const visualEffects = {
    color: '#ffffff',
    trail: false,
    glow: false,
    particles: false,
    size: 1,
    shape: 'circle' as const
  };

  items.forEach(item => {
    // Multiplicative effects
    if (item.effects.damage) baseStats.damage *= item.effects.damage;
    if (item.effects.speed) baseStats.speed *= item.effects.speed;
    if (item.effects.fireRate) baseStats.fireRate *= item.effects.fireRate;
    if (item.effects.size) baseStats.size *= item.effects.size;
    if (item.effects.range) baseStats.range *= item.effects.range;

    // Boolean effects (any item can enable)
    if (item.effects.piercing) baseStats.piercing = true;
    if (item.effects.homing) baseStats.homing = true;
    if (item.effects.bouncing) baseStats.bouncing = true;
    if (item.effects.explosive) baseStats.explosive = true;
    if (item.effects.poison) baseStats.poison = true;
    if (item.effects.freeze) baseStats.freeze = true;
    if (item.effects.splitting) baseStats.splitting = true;

    // Additive effects
    if (item.effects.multiShot) baseStats.multiShot += item.effects.multiShot - 1;
    if (item.effects.spread) baseStats.spread += item.effects.spread;
    if (item.effects.knockback) baseStats.knockback += item.effects.knockback;
    if (item.effects.lifeSteal) baseStats.lifeSteal += item.effects.lifeSteal;

    // Visual effects (last item wins for some, combine for others)
    if (item.visualEffects.color) visualEffects.color = item.visualEffects.color;
    if (item.visualEffects.trail) visualEffects.trail = true;
    if (item.visualEffects.glow) visualEffects.glow = true;
    if (item.visualEffects.particles) visualEffects.particles = true;
    if (item.visualEffects.size) visualEffects.size *= item.visualEffects.size;
    if (item.visualEffects.shape) visualEffects.shape = item.visualEffects.shape;
  });

  return { stats: baseStats, visual: visualEffects };
}