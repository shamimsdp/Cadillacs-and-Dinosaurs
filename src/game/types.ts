/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CharacterId = 'jack' | 'hannah' | 'mustapha' | 'mess';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  bio: string;
  speed: number;
  maxHp: number;
  power: number; // 1-5 scale
  agility: number; // 1-5 scale
  reach: number;
  specialCost: number; // hp cost on connect
  specialName: string;
  portraitColor: string;
  shirtColor: string;
  pantsColor: string;
  accentColor: string;
  skinColor: string;
  hairColor: string;
}

export type ActionState =
  | 'idle'
  | 'walk'
  | 'dash'
  | 'attack'
  | 'punch1'
  | 'punch2'
  | 'punch3'
  | 'punchFinish'
  | 'dashAttack'
  | 'jump'
  | 'jumpAttack'
  | 'special'
  | 'grab'
  | 'throw'
  | 'shoot'
  | 'hurt'
  | 'knockdown'
  | 'getup';

export type WeaponType =
  | 'knife'
  | 'pipe'
  | 'pistol'
  | 'shotgun'
  | 'uzi'
  | 'grenade'
  | 'food_meat'
  | 'food_burger'
  | 'food_drink'
  | 'treasure_gold'
  | 'treasure_gem';

export interface WeaponItem {
  id: string;
  type: WeaponType;
  x: number;
  z: number;
  y: number;
  vy: number;
  ammo: number; // For guns: shots remaining
  isFood?: boolean;
  isTreasure?: boolean;
  healAmount?: number;
  points?: number;
}

export type EnemyType = 'poacher' | 'butcher' | 'raptor' | 'vice_boss';

export interface Entity {
  id: string;
  x: number; // Horizontal axis in world (0 .. stageWidth)
  z: number; // Depth along floor (280 .. 470)
  y: number; // Elevation off floor (0 = grounded)
  vx: number;
  vz: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  hp: number;
  maxHp: number;
  state: ActionState;
  stateTimer: number;
  width: number;
  height: number;
  hitstunTimer: number;
  invincibleTimer: number;
  groundY?: number;
}

export interface PlayerEntity extends Entity {
  charId: CharacterId;
  heldWeapon: {
    type: WeaponType;
    ammo: number;
  } | null;
  comboCount: number;
  comboResetTimer: number;
  grabbedTargetId: string | null;
  score: number;
  lives: number;
  kills: number;
  dinosPacified: number;
}

export interface EnemyEntity extends Entity {
  enemyType: EnemyType;
  name: string;
  aiTimer: number;
  aiState: 'patrol' | 'approach' | 'windup' | 'attack' | 'retreat' | 'enraged' | 'idle';
  attackCooldown: number;
  enraged?: boolean; // For raptor
  points: number;
  targetX?: number;
  targetZ?: number;
}

export interface DestructibleProp {
  id: string;
  x: number;
  z: number;
  y: number;
  type: 'barrel' | 'crate' | 'drum';
  hp: number;
  contents: WeaponType;
}

export interface Particle {
  id: string;
  x: number;
  y: number; // screen-space or world (x, z - y)
  z: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  type: 'hitspark' | 'spark' | 'smoke' | 'wood' | 'bloodless_star' | 'comic_text' | 'shell' | 'muzzle' | 'shockwave';
  color?: string;
  text?: string;
  scale?: number;
}

export interface Projectile {
  id: string;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  ownerId: string;
  isPlayer: boolean;
  type: 'bullet' | 'shotgun_pellet' | 'grenade' | 'rock';
  damage: number;
  pierce: number;
  life: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  attack: boolean;
  jump: boolean;
  special: boolean;
  dash: boolean;
  justAttack: boolean;
  justJump: boolean;
  justSpecial: boolean;
}

export type GameScreen = 'title' | 'select' | 'playing' | 'paused' | 'continue' | 'gameover' | 'victory';
