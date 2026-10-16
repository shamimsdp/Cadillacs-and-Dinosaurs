/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { arcadeAudio } from './audio';
import { CHARACTERS } from './characters';
import { inputManager } from './controls';
import {
  ActionState,
  CharacterId,
  DestructibleProp,
  EnemyEntity,
  EnemyType,
  InputState,
  Particle,
  PlayerEntity,
  Projectile,
  WeaponItem,
  WeaponType,
} from './types';

export class GameEngine {
  public player: PlayerEntity;
  public enemies: EnemyEntity[] = [];
  public items: WeaponItem[] = [];
  public props: DestructibleProp[] = [];
  public particles: Particle[] = [];
  public projectiles: Projectile[] = [];

  public cameraX: number = 0;
  public stageWidth: number = 2800;
  public viewportW: number = 800;
  public viewportH: number = 480;

  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isVictory: boolean = false;

  public hitstopTimer: number = 0; // Freeze frame on heavy impacts
  public screenShake: number = 0;
  public screenShakeMax: number = 0;
  public screenShakeDuration: number = 0;
  public screenShakeTimer: number = 0;
  public goPromptTimer: number = 0;
  public lockedCamera: boolean = false;
  public sectionIndex: number = 0;
  public targetBoss: EnemyEntity | null = null;

  // Real-time Hit Combo Counter
  public hitCombo: number = 0;
  public hitComboTimer: number = 0;
  public hitComboTotalDamage: number = 0;
  public maxHitCombo: number = 0;

  // Wave definitions along the stage
  private waveCheckpoints = [
    { x: 500, triggered: false, enemies: [{ type: 'poacher', x: 750, z: 340 }, { type: 'poacher', x: 820, z: 410 }] },
    { x: 1000, triggered: false, enemies: [{ type: 'poacher', x: 1250, z: 320 }, { type: 'butcher', x: 1320, z: 400 }, { type: 'raptor', x: 1380, z: 360 }] },
    { x: 1600, triggered: false, enemies: [{ type: 'poacher', x: 1850, z: 300 }, { type: 'butcher', x: 1920, z: 380 }, { type: 'raptor', x: 1980, z: 420 }, { type: 'poacher', x: 2020, z: 350 }] },
    { x: 2200, triggered: false, enemies: [{ type: 'vice_boss', x: 2550, z: 360 }, { type: 'raptor', x: 2620, z: 410 }] },
  ];

  constructor(charId: CharacterId = 'mustapha') {
    this.player = this.createPlayer(charId);
    this.initPropsAndItems();
  }

  /**
   * Triggers camera shake with customizable intensity and duration
   * @param intensity Max displacement in pixels
   * @param duration Duration of shake in seconds
   */
  public triggerScreenShake(intensity: number, duration: number = 0.3) {
    this.screenShakeMax = Math.max(this.screenShakeMax, intensity);
    this.screenShakeDuration = Math.max(this.screenShakeDuration, duration);
    this.screenShakeTimer = Math.max(this.screenShakeTimer, duration);
    this.screenShake = this.screenShakeMax;
  }

  public reset(charId?: CharacterId) {
    if (charId) {
      this.player = this.createPlayer(charId);
    } else {
      this.player = this.createPlayer(this.player.charId);
    }
    this.enemies = [];
    this.items = [];
    this.props = [];
    this.particles = [];
    this.projectiles = [];
    this.cameraX = 0;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.hitstopTimer = 0;
    this.screenShake = 0;
    this.screenShakeMax = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTimer = 0;
    this.hitCombo = 0;
    this.hitComboTimer = 0;
    this.hitComboTotalDamage = 0;
    this.maxHitCombo = 0;
    this.lockedCamera = false;
    this.targetBoss = null;
    inputManager.reset();

    // Reset checkpoints
    this.waveCheckpoints.forEach((wp) => (wp.triggered = false));
    this.initPropsAndItems();
  }

  private createPlayer(charId: CharacterId): PlayerEntity {
    const char = CHARACTERS[charId];
    return {
      id: 'player_1',
      charId,
      x: 120,
      z: 360,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      facing: 1,
      hp: char.maxHp,
      maxHp: char.maxHp,
      state: 'idle',
      stateTimer: 0,
      width: 40,
      height: 70,
      hitstunTimer: 0,
      invincibleTimer: 0,
      heldWeapon: null,
      comboCount: 0,
      comboResetTimer: 0,
      grabbedTargetId: null,
      score: 0,
      lives: 2,
      kills: 0,
      dinosPacified: 0,
      respawnTimer: 0,
    };
  }

  private initPropsAndItems() {
    // Initial Barrels & Crates along the stage
    this.props = [
      { id: 'prop_1', x: 420, z: 310, y: 0, type: 'barrel', hp: 15, contents: 'food_burger' },
      { id: 'prop_2', x: 460, z: 420, y: 0, type: 'crate', hp: 15, contents: 'pistol' },
      { id: 'prop_3', x: 920, z: 350, y: 0, type: 'drum', hp: 20, contents: 'knife' },
      { id: 'prop_4', x: 1200, z: 290, y: 0, type: 'crate', hp: 15, contents: 'shotgun' },
      { id: 'prop_5', x: 1550, z: 440, y: 0, type: 'barrel', hp: 15, contents: 'food_meat' },
      { id: 'prop_6', x: 2100, z: 330, y: 0, type: 'drum', hp: 20, contents: 'uzi' },
      { id: 'prop_7', x: 2350, z: 410, y: 0, type: 'crate', hp: 15, contents: 'food_meat' },
    ];

    // Initial items on ground
    this.items = [
      { id: 'item_init_1', type: 'pipe', x: 260, z: 380, y: 0, vy: 0, ammo: 10 },
      { id: 'item_init_2', type: 'treasure_gold', x: 300, z: 320, y: 0, vy: 0, ammo: 0, isTreasure: true, points: 1000 },
    ];
  }

  // Main 60FPS Update Tick
  public update(dt: number, input: InputState) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;

    // Ensure valid dt
    const safeDt = Math.max(0.001, Math.min(isNaN(dt) ? 0.016 : dt, 0.05));

    // Simulation Hitstop (Impact Freeze-frame) - safely ticks down
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - safeDt);
      // Still decay screen shake while in hitstop
      if (this.screenShakeTimer > 0) {
        this.screenShakeTimer = Math.max(0, this.screenShakeTimer - safeDt);
        const ratio = Math.max(0, this.screenShakeTimer / Math.max(0.01, this.screenShakeDuration));
        this.screenShake = this.screenShakeMax * ratio;
      }
      return;
    }

    // Camera Shake Decay with duration-based smoothing
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= safeDt;
      const ratio = Math.max(0, this.screenShakeTimer / Math.max(0.01, this.screenShakeDuration));
      this.screenShake = this.screenShakeMax * ratio;
      if (this.screenShakeTimer <= 0) {
        this.screenShake = 0;
        this.screenShakeMax = 0;
        this.screenShakeDuration = 0;
      }
    } else {
      this.screenShake = 0;
    }

    // Real-time Hit Combo Decay
    if (this.hitComboTimer > 0) {
      this.hitComboTimer -= safeDt;
      if (this.hitComboTimer <= 0) {
        this.hitCombo = 0;
        this.hitComboTotalDamage = 0;
      }
    }

    // Checkpoint Triggering
    for (const wp of this.waveCheckpoints) {
      if (!wp.triggered && this.player.x >= wp.x) {
        wp.triggered = true;
        this.lockedCamera = true;
        wp.enemies.forEach((ed, idx) => {
          this.spawnEnemy(ed.type as EnemyType, ed.x, ed.z, idx * 0.2);
        });
      }
    }

    // Check if wave cleared to unlock camera and trigger "GO! ->"
    // Checks that all enemies are cleared or defeated (hp <= 0)
    const activeEnemies = this.enemies.filter((e) => e.hp > 0);
    if (this.lockedCamera && activeEnemies.length === 0) {
      this.lockedCamera = false;
      this.enemies = []; // Purge any remaining dead records to avoid ghost traps
      this.goPromptTimer = 3.5;
      arcadeAudio.playGoPrompt();
    }

    if (this.goPromptTimer > 0) {
      this.goPromptTimer -= safeDt;
    }

    // Update Player
    this.updatePlayer(safeDt, input);

    // Update Enemies (consistently with safeDt to prevent NaN or huge dt hanging)
    this.updateEnemies(safeDt);

    // Update Projectiles
    this.updateProjectiles(safeDt);

    // Update Items
    this.updateItems(safeDt);

    // Update Particles
    this.updateParticles(safeDt);

    // Camera Follow Clamped
    this.updateCamera();
  }

  private updatePlayer(dt: number, input: InputState) {
    const p = this.player;
    const char = CHARACTERS[p.charId];

    // Timers
    if (p.hitstunTimer > 0) p.hitstunTimer -= dt;
    if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboCount = 0;
    }

    // In-simulation Respawn handling
    if (p.respawnTimer > 0) {
      p.respawnTimer -= dt;
      if (p.respawnTimer <= 0) {
        if (p.lives >= 0 && !this.isGameOver) {
          p.hp = p.maxHp;
          p.invincibleTimer = 2.5;
          p.state = 'idle';
          p.stateTimer = 0;
          p.y = 0;
          p.vy = 0;
          this.spawnComicText(p.x, p.z - 50, '1 UP!');
        }
      }
    }

    // State Machine
    const canMove = ['idle', 'walk', 'dash'].includes(p.state) && p.hitstunTimer <= 0 && p.hp > 0;

    if (canMove) {
      // Movement
      let moveX = 0;
      let moveZ = 0;
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;
      if (input.up) moveZ -= 1;
      if (input.down) moveZ += 1;

      // Facing
      if (moveX !== 0) p.facing = moveX > 0 ? 1 : -1;

      const isDashing = input.dash || p.state === 'dash';
      const speed = char.speed * (isDashing ? 1.7 : 1.0);

      p.vx = moveX * speed * 45;
      p.vz = moveZ * (speed * 0.75) * 45;

      p.state = isDashing && (moveX !== 0 || moveZ !== 0) ? 'dash' : moveX !== 0 || moveZ !== 0 ? 'walk' : 'idle';

      // Grab proximity check (Capcom signature beat 'em up grab)
      if (p.state === 'walk' && !p.heldWeapon) {
        for (const e of this.enemies) {
          if (
            e.hp > 0 &&
            Math.abs(e.x - p.x) < 28 &&
            Math.abs(e.z - p.z) < 14 &&
            e.enemyType !== 'raptor' &&
            e.state !== 'knockdown'
          ) {
            p.state = 'grab';
            p.grabbedTargetId = e.id;
            p.stateTimer = 0.8;
            e.state = 'hurt';
            e.hitstunTimer = 1.0;
            break;
          }
        }
      }

      // Actions
      if (input.justSpecial) {
        this.performMegacrash(p);
      } else if (input.justJump) {
        this.performJump(p);
      } else if (input.justAttack) {
        if (p.state === 'dash') {
          this.performDashAttack(p);
        } else {
          this.performAttack(p);
        }
      }
    } else if (p.state === 'grab') {
      p.stateTimer -= dt;
      p.vx = 0;
      p.vz = 0;
      const grabbedEnemy = this.enemies.find((e) => e.id === p.grabbedTargetId);
      if (!grabbedEnemy || grabbedEnemy.hp <= 0 || p.stateTimer <= 0) {
        p.state = 'idle';
        p.grabbedTargetId = null;
      } else {
        grabbedEnemy.x = p.x + p.facing * 20;
        grabbedEnemy.z = p.z;
        if (input.justAttack) {
          // Throw or knee strike
          if (input.left || input.right) {
            // BACK THROW!
            this.performThrow(p, grabbedEnemy);
          } else {
            // Knee bash
            this.performKneeStrike(p, grabbedEnemy);
          }
        }
      }
    } else if (['punch1', 'punch2', 'punch3', 'punchFinish', 'dashAttack', 'shoot', 'throw', 'attack'].includes(p.state)) {
      p.stateTimer -= dt;
      p.vx *= 0.85;
      p.vz *= 0.85;
      if (p.stateTimer <= 0) {
        p.state = 'idle';
      }
    } else if (['jump', 'jumpAttack'].includes(p.state)) {
      // Jump Physics
      p.vy += -650 * dt; // Gravity
      p.y += p.vy * dt;
      if (input.justAttack && p.state === 'jump') {
        p.state = 'jumpAttack';
        p.stateTimer = 0.35;
        arcadeAudio.playPunch(true);
        this.checkAttackCollision(p, 36, 18, 18, true);
      }
      if (p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        p.state = 'idle';
        this.spawnDust(p.x, p.z);
      }
    } else if (p.state === 'special') {
      p.stateTimer -= dt;
      p.vx *= 0.9;
      p.vz *= 0.9;
      if (p.stateTimer <= 0) {
        p.state = 'idle';
      }
    } else if (p.state === 'hurt') {
      p.stateTimer -= dt;
      p.vx *= 0.8;
      p.vz *= 0.8;
      if (p.stateTimer <= 0) {
        p.state = 'idle';
      }
    } else if (p.state === 'knockdown') {
      p.stateTimer -= dt;
      p.vy += -600 * dt;
      p.y = Math.max(0, p.y + p.vy * dt);
      p.vx *= 0.92;
      if (p.stateTimer <= 0 && p.y <= 0) {
        p.y = 0;
        p.vy = 0;
        if (p.hp <= 0 && p.lives >= 0) {
          // Waiting for respawn timer to trigger 1-UP
          p.state = 'knockdown';
          p.stateTimer = 0.5;
        } else if (p.hp > 0) {
          p.state = 'getup';
          p.stateTimer = 0.4;
          p.invincibleTimer = 1.2;
        }
      }
    } else if (p.state === 'getup') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'idle';
      }
    }

    // Integrate Position
    p.x += p.vx * dt;
    p.z += p.vz * dt;

    // Boundary Clamping (2.5D floor bounds)
    p.z = Math.max(260, Math.min(460, p.z));
    const minCameraLeft = this.cameraX;
    const maxCameraRight = this.lockedCamera ? this.cameraX + this.viewportW - p.width : this.stageWidth - p.width;
    p.x = Math.max(minCameraLeft + 20, Math.min(maxCameraRight, p.x));
  }

  private performAttack(p: PlayerEntity) {
    // Check if standing over a weapon/item to pick up
    const nearbyItemIndex = this.items.findIndex(
      (item) => Math.abs(item.x - p.x) < 36 && Math.abs(item.z - p.z) < 24 && item.y <= 10
    );

    if (nearbyItemIndex !== -1) {
      const item = this.items[nearbyItemIndex];
      this.items.splice(nearbyItemIndex, 1);
      this.pickupItem(p, item);
      return;
    }

    // If holding a firearm, shoot!
    if (p.heldWeapon && ['pistol', 'shotgun', 'uzi'].includes(p.heldWeapon.type)) {
      this.shootWeapon(p);
      return;
    }

    // Melee attack / Combo chain
    p.comboResetTimer = 0.7;
    const combo = p.comboCount % 4;
    p.comboCount++;

    const isFinisher = combo === 3;
    const isHeavy = Boolean(isFinisher || (p.heldWeapon && p.heldWeapon.type === 'pipe'));

    p.state = isFinisher ? 'punchFinish' : ('punch' + (combo + 1) as ActionState);
    p.stateTimer = isFinisher ? 0.35 : 0.22;

    arcadeAudio.playPunch(isHeavy);
    const damage = isFinisher ? 24 : 12;
    this.checkAttackCollision(p, 42, 22, damage, isFinisher);

    // Prop destruction check
    this.checkPropCollision(p.x + p.facing * 30, p.z, 30, damage);
  }

  private shootWeapon(p: PlayerEntity) {
    if (!p.heldWeapon) return;
    const type = p.heldWeapon.type;
    p.state = 'shoot';
    p.stateTimer = type === 'uzi' ? 0.12 : 0.25;

    arcadeAudio.playGunshot(type as 'pistol' | 'shotgun' | 'uzi');
    this.triggerScreenShake(type === 'shotgun' ? 12 : type === 'uzi' ? 3 : 6, type === 'shotgun' ? 0.35 : 0.18);

    // Spawn Projectile
    const bulletSpeed = 650 * p.facing;
    if (type === 'shotgun') {
      // 3 Spread Pellets
      for (let s = -1; s <= 1; s++) {
        this.projectiles.push({
          id: 'proj_' + Math.random(),
          x: p.x + p.facing * 28,
          z: p.z + s * 14,
          y: 28,
          vx: bulletSpeed,
          vz: s * 40,
          vy: 0,
          ownerId: p.id,
          isPlayer: true,
          type: 'shotgun_pellet',
          damage: 35,
          pierce: 3,
          life: 0.8,
        });
      }
    } else {
      this.projectiles.push({
        id: 'proj_' + Math.random(),
        x: p.x + p.facing * 28,
        z: p.z,
        y: 28,
        vx: bulletSpeed,
        vz: 0,
        vy: 0,
        ownerId: p.id,
        isPlayer: true,
        type: 'bullet',
        damage: type === 'uzi' ? 16 : 28,
        pierce: type === 'uzi' ? 1 : 2,
        life: 1.0,
      });
    }

    // Decrement Ammo
    p.heldWeapon.ammo--;
    if (p.heldWeapon.ammo <= 0) {
      // Out of ammo: throw empty gun at enemies!
      this.projectiles.push({
        id: 'proj_thrown_' + Math.random(),
        x: p.x,
        z: p.z,
        y: 25,
        vx: p.facing * 350,
        vz: 0,
        vy: 120,
        ownerId: p.id,
        isPlayer: true,
        type: 'rock',
        damage: 18,
        pierce: 1,
        life: 1.2,
      });
      p.heldWeapon = null;
    }
  }

  private performDashAttack(p: PlayerEntity) {
    p.state = 'dashAttack';
    p.stateTimer = 0.4;
    p.vx = p.facing * 260;
    arcadeAudio.playPunch(true);
    this.triggerScreenShake(9, 0.3);
    this.checkAttackCollision(p, 50, 24, 25, true);
    this.spawnDust(p.x, p.z);
  }

  private performJump(p: PlayerEntity) {
    p.state = 'jump';
    p.vy = 360;
    arcadeAudio.playJump();
    this.spawnDust(p.x, p.z);
  }

  private performMegacrash(p: PlayerEntity) {
    p.state = 'special';
    p.stateTimer = 0.55;
    p.invincibleTimer = 0.65;
    this.hitstopTimer = 0.05;

    arcadeAudio.playSpecial();
    // Character special move initial burst shake
    this.triggerScreenShake(12, 0.4);

    // Shockwave particle
    this.particles.push({
      id: 'p_' + Math.random(),
      x: p.x,
      y: p.z,
      z: p.z,
      vx: 0,
      vy: 0,
      life: 0.45,
      maxLife: 0.45,
      type: 'shockwave',
    });

    let didHit = false;
    // Clears all enemies in radius
    for (const e of this.enemies) {
      if (e.hp > 0 && Math.abs(e.x - p.x) < 85 && Math.abs(e.z - p.z) < 40) {
        didHit = true;
        this.damageEnemy(e, 35, true, e.x > p.x ? 1 : -1);
      }
    }

    // Health sacrifice and massive finisher shake on connect
    if (didHit) {
      this.triggerScreenShake(18, 0.55);
      if (p.hp > 10) {
        p.hp = Math.max(1, p.hp - CHARACTERS[p.charId].specialCost);
      }
    }
  }

  private performThrow(p: PlayerEntity, target: EnemyEntity) {
    p.state = 'throw';
    p.stateTimer = 0.4;
    p.grabbedTargetId = null;

    arcadeAudio.playKnockdown();
    this.triggerScreenShake(12, 0.4);
    this.hitstopTimer = 0.04;

    const throwDir = -p.facing;
    target.facing = throwDir as 1 | -1;
    target.vx = throwDir * 380;
    target.vy = 260;
    target.y = 20;
    target.state = 'knockdown';
    target.stateTimer = 1.0;
    this.damageEnemy(target, 32, true, throwDir);

    // Collateral damage to other enemies in path
    for (const other of this.enemies) {
      if (other.id !== target.id && Math.abs(other.x - p.x) < 80 && Math.abs(other.z - p.z) < 25) {
        this.damageEnemy(other, 25, true, throwDir);
      }
    }
  }

  private performKneeStrike(p: PlayerEntity, target: EnemyEntity) {
    arcadeAudio.playPunch(true);
    this.hitstopTimer = 0.03;
    this.damageEnemy(target, 16, false, p.facing);
    p.stateTimer = 0.4;
  }

  private pickupItem(p: PlayerEntity, item: WeaponItem) {
    arcadeAudio.playPickup(Boolean(item.isFood));

    if (item.isFood) {
      const heal = item.type === 'food_meat' ? 50 : item.type === 'food_burger' ? 30 : 15;
      p.hp = Math.min(p.maxHp, p.hp + heal);
      this.spawnComicText(p.x, p.z - 40, 'HEALTH +!');
    } else if (item.isTreasure) {
      const pts = item.points || 1000;
      p.score += pts;
      this.spawnComicText(p.x, p.z - 40, `+${pts}`);
    } else {
      // Weapon equipped
      const ammoCount = item.type === 'shotgun' ? 3 : item.type === 'uzi' ? 18 : item.type === 'pistol' ? 6 : 10;
      p.heldWeapon = {
        type: item.type,
        ammo: ammoCount,
      };
      this.spawnComicText(p.x, p.z - 40, item.type.toUpperCase() + '!');
    }
  }

  private checkAttackCollision(
    attacker: PlayerEntity,
    reachX: number,
    reachZ: number,
    damage: number,
    isKnockdown: boolean
  ) {
    const hitboxX = attacker.x + attacker.facing * (reachX / 2);
    const hitboxZ = attacker.z;

    let hitAny = false;

    for (const enemy of this.enemies) {
      if (enemy.hp <= 0 || enemy.invincibleTimer > 0) continue;

      const dx = Math.abs(enemy.x - hitboxX);
      const dz = Math.abs(enemy.z - hitboxZ);

      if (dx < reachX && dz < reachZ) {
        hitAny = true;
        this.damageEnemy(enemy, damage, isKnockdown, attacker.facing);
      }
    }

    if (hitAny) {
      this.hitstopTimer = isKnockdown ? 0.06 : 0.03;
      if (isKnockdown) {
        this.triggerScreenShake(7, 0.25);
      }
    }
  }

  private checkPropCollision(x: number, z: number, radius: number, damage: number) {
    for (let i = this.props.length - 1; i >= 0; i--) {
      const prop = this.props[i];
      if (Math.abs(prop.x - x) < radius && Math.abs(prop.z - z) < radius) {
        prop.hp -= damage;
        arcadeAudio.playBarrelBreak();
        this.triggerScreenShake(6, 0.2);
        // Wood splinter particles
        for (let s = 0; s < 6; s++) {
          this.particles.push({
            id: 'p_wood_' + Math.random(),
            x: prop.x,
            y: prop.z - 15,
            z: prop.z,
            vx: (Math.random() - 0.5) * 160,
            vy: -Math.random() * 150,
            life: 0.5,
            maxLife: 0.5,
            type: 'wood',
          });
        }
        if (prop.hp <= 0) {
          // Drop item
          this.items.push({
            id: 'item_' + Math.random(),
            type: prop.contents,
            x: prop.x,
            z: prop.z,
            y: 20,
            vy: 80,
            ammo: 10,
            isFood: ['food_meat', 'food_burger', 'food_drink'].includes(prop.contents),
            isTreasure: ['treasure_gold', 'treasure_gem'].includes(prop.contents),
          });
          this.props.splice(i, 1);
        }
        break;
      }
    }
  }

  private damageEnemy(enemy: EnemyEntity, damage: number, isKnockdown: boolean, knockDir: number) {
    enemy.hp -= damage;
    enemy.hitstunTimer = 0.28;

    // Real-time Hit Combo Tracking
    if (this.hitComboTimer > 0) {
      this.hitCombo++;
      this.hitComboTotalDamage += damage;
    } else {
      this.hitCombo = 1;
      this.hitComboTotalDamage = damage;
    }
    this.hitComboTimer = 2.0; // 2.0s window for rapid succession hits
    this.maxHitCombo = Math.max(this.maxHitCombo, this.hitCombo);

    // Dynamic arcade score bonus on combos
    if (this.hitCombo >= 2) {
      const comboBonus = Math.floor(damage * 0.25 * this.hitCombo);
      this.player.score += comboBonus;
      // Show combo milestone floating comic text every 5 hits
      if (this.hitCombo % 5 === 0) {
        this.spawnComicText(enemy.x, enemy.z - 65, `${this.hitCombo} HITS!`);
      }
    }

    // High-impact boss hits & knockdown screen shake
    if (enemy.enemyType === 'vice_boss') {
      if (isKnockdown) {
        this.triggerScreenShake(16, 0.45);
      } else {
        this.triggerScreenShake(7, 0.25);
      }
    } else if (isKnockdown) {
      this.triggerScreenShake(6, 0.22);
    }

    // Sparks & Comic Text
    this.spawnHitspark(enemy.x, enemy.z - 35, isKnockdown);

    if (enemy.hp <= 0 || isKnockdown) {
      enemy.state = 'knockdown';
      enemy.stateTimer = 0.9;
      enemy.vx = knockDir * 240;
      enemy.vy = 200;
      arcadeAudio.playKnockdown();
    } else {
      enemy.state = 'hurt';
      enemy.stateTimer = 0.25;
      enemy.vx = knockDir * 60;
    }

    // Raptor Rage transition
    if (enemy.enemyType === 'raptor' && !enemy.enraged && enemy.hp < enemy.maxHp * 0.7) {
      enemy.enraged = true;
      enemy.aiState = 'enraged';
      arcadeAudio.playDinoRoar(true);
      this.triggerScreenShake(10, 0.4);
      this.spawnComicText(enemy.x, enemy.z - 50, 'ENRAGED!');
    }

    if (enemy.hp <= 0) {
      enemy.hp = 0;
      this.player.score += enemy.points;
      this.player.kills++;
      if (enemy.enemyType === 'raptor') {
        this.player.dinosPacified++;
      }
      if (enemy.enemyType === 'vice_boss') {
        this.isVictory = true;
        this.triggerScreenShake(24, 0.85);
      }
    }
  }

  // Spawn Enemy helper
  public spawnEnemy(type: EnemyType, x: number, z: number, delay: number = 0) {
    let maxHp = 60;
    let name = 'POACHER';
    let pts = 500;
    let width = 36;
    let height = 65;

    if (type === 'butcher') {
      maxHp = 130;
      name = 'GNEISS';
      pts = 1000;
      width = 46;
      height = 70;
    } else if (type === 'raptor') {
      maxHp = 110;
      name = 'VELOCIRAPTOR';
      pts = 1500;
      width = 50;
      height = 55;
      arcadeAudio.playDinoRoar(false);
    } else if (type === 'vice_boss') {
      maxHp = 260;
      name = 'VICE TERHUNE';
      pts = 10000;
      width = 44;
      height = 72;
    }

    const enemy: EnemyEntity = {
      id: 'enemy_' + Math.random(),
      enemyType: type,
      name,
      x,
      z,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      facing: -1,
      hp: maxHp,
      maxHp,
      state: 'idle',
      stateTimer: 0,
      width,
      height,
      hitstunTimer: delay,
      invincibleTimer: 0,
      aiTimer: delay,
      aiState: 'approach',
      attackCooldown: 1.0,
      points: pts,
    };

    if (type === 'vice_boss') {
      this.targetBoss = enemy;
    }

    this.enemies.push(enemy);
  }

  // Update Enemies AI & Physics
  private updateEnemies(dt: number) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Dead removal: any enemy with hp <= 0 that finished falling or whose stateTimer expired
      if (e.hp <= 0) {
        if ((e.state === 'knockdown' && e.stateTimer <= 0.1) || e.state === 'idle' || e.stateTimer <= 0) {
          this.spawnDust(e.x, e.z);
          // Possible item drop
          if (Math.random() < 0.35) {
            const drops: WeaponType[] = ['food_burger', 'knife', 'treasure_gem', 'pistol'];
            const dropType = drops[Math.floor(Math.random() * drops.length)];
            this.items.push({
              id: 'item_drop_' + Math.random(),
              type: dropType,
              x: e.x,
              z: e.z,
              y: 10,
              vy: 60,
              ammo: 6,
              isFood: dropType.startsWith('food_'),
              isTreasure: dropType.startsWith('treasure_'),
            });
          }
          this.enemies.splice(i, 1);
          continue;
        }
      }

      // Physics integration
      if (e.y > 0 || e.vy !== 0) {
        e.vy += -600 * dt;
        e.y += e.vy * dt;
        if (e.y <= 0) {
          e.y = 0;
          e.vy = 0;
          this.spawnDust(e.x, e.z);
        }
      }

      // Knockdown / Getup states
      if (e.state === 'knockdown') {
        e.stateTimer -= dt;
        e.vx *= 0.92;
        if (e.stateTimer <= 0 && e.y <= 0 && e.hp > 0) {
          e.y = 0;
          e.vy = 0;
          e.state = 'getup';
          e.stateTimer = 0.4;
          e.invincibleTimer = 0.8;
        }
        e.x += e.vx * dt;
        continue;
      }

      if (e.state === 'getup') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) e.state = 'idle';
        continue;
      }

      if (e.state === 'hurt') {
        e.stateTimer -= dt;
        e.vx *= 0.85;
        e.x += e.vx * dt;
        if (e.stateTimer <= 0) e.state = 'idle';
        continue;
      }

      if (e.state === 'attack') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) e.state = 'idle';
        continue;
      }

      // AI Behavior
      e.aiTimer -= dt;
      e.attackCooldown -= dt;

      const dx = p.x - e.x;
      const dz = p.z - e.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      e.facing = dx > 0 ? 1 : -1;

      // Enemy speed
      const speed = e.enemyType === 'raptor' ? (e.enraged ? 140 : 90) : e.enemyType === 'vice_boss' ? 110 : 70;

      if (dist < 42 && Math.abs(dz) < 18 && e.attackCooldown <= 0 && p.state !== 'knockdown' && p.invincibleTimer <= 0) {
        // Strike Player!
        e.state = 'attack';
        e.stateTimer = 0.35;
        e.attackCooldown = e.enemyType === 'raptor' ? 1.2 : 1.8;
        e.vx = 0;
        e.vz = 0;

        // Perform attack against player
        this.damagePlayer(
          e.enemyType === 'vice_boss' ? 24 : e.enemyType === 'raptor' ? 20 : 12,
          e.facing,
          e.enemyType === 'vice_boss'
        );
      } else {
        // Move towards player or flank along Z
        const targetZ = p.z + (Math.sin(e.id.charCodeAt(6) || 1) > 0 ? 12 : -12);
        const zDiff = targetZ - e.z;

        e.vx = (dx > 30 ? 1 : dx < -30 ? -1 : 0) * speed;
        e.vz = (Math.abs(zDiff) > 8 ? Math.sign(zDiff) : 0) * (speed * 0.7);

        e.state = e.vx !== 0 || e.vz !== 0 ? 'walk' : 'idle';
        e.x += e.vx * dt;
        e.z += e.vz * dt;
      }

      // Clamp to arena
      e.z = Math.max(260, Math.min(460, e.z));
      e.x = Math.max(this.cameraX + 10, Math.min(this.cameraX + this.viewportW - 20, e.x));
    }
  }

  private damagePlayer(damage: number, knockDir: number, isBoss: boolean = false) {
    const p = this.player;
    if (p.invincibleTimer > 0 || p.state === 'special' || p.hp <= 0) return;

    p.hp -= damage;
    p.hitstunTimer = 0.3;
    if (isBoss) {
      this.triggerScreenShake(15, 0.45);
    } else {
      this.triggerScreenShake(7, 0.25);
    }
    arcadeAudio.playPunch(true);
    this.spawnHitspark(p.x, p.z - 30, true);

    if (p.hp <= 0) {
      p.hp = 0;
      p.state = 'knockdown';
      p.stateTimer = 1.2;
      p.vx = knockDir * 200;
      p.vy = 220;
      p.lives--;

      if (p.lives < 0) {
        this.isGameOver = true;
      } else {
        // In-simulation respawn timer
        p.respawnTimer = 1.4;
      }
    } else {
      p.state = 'hurt';
      p.stateTimer = 0.25;
      p.vx = knockDir * 60;
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.z += proj.vz * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Collision with enemies
      if (proj.isPlayer) {
        for (const enemy of this.enemies) {
          if (
            enemy.hp > 0 &&
            Math.abs(enemy.x - proj.x) < 28 &&
            Math.abs(enemy.z - proj.z) < 20 &&
            Math.abs(enemy.y - proj.y) < 35
          ) {
            this.damageEnemy(enemy, proj.damage, true, Math.sign(proj.vx));
            proj.pierce--;
            if (proj.pierce <= 0) break;
          }
        }
      }

      if (proj.life <= 0 || proj.pierce <= 0 || proj.x < this.cameraX - 50 || proj.x > this.cameraX + this.viewportW + 50) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateItems(dt: number) {
    for (const item of this.items) {
      if (item.y > 0 || item.vy !== 0) {
        item.vy += -500 * dt;
        item.y += item.vy * dt;
        if (item.y <= 0) {
          item.y = 0;
          item.vy = 0;
        }
      }
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateCamera() {
    if (this.lockedCamera) return;

    // Follow player smoothly
    const targetCamX = this.player.x - this.viewportW * 0.35;
    const maxCamX = this.stageWidth - this.viewportW;
    this.cameraX = Math.max(this.cameraX, Math.min(maxCamX, targetCamX));
  }

  // Particle & FX Helpers
  public spawnHitspark(x: number, y: number, isBig: boolean = false) {
    this.particles.push({
      id: 'spark_' + Math.random(),
      x,
      y,
      z: y,
      vx: 0,
      vy: 0,
      life: 0.22,
      maxLife: 0.22,
      type: 'hitspark',
      color: isBig ? '#FDE047' : '#FFFFFF',
    });

    if (isBig) {
      const comics = ['POW!', 'WHAM!', 'CRASH!', 'BOOM!'];
      const chosen = comics[Math.floor(Math.random() * comics.length)];
      this.spawnComicText(x, y - 20, chosen);
    }
  }

  public spawnComicText(x: number, y: number, text: string) {
    this.particles.push({
      id: 'text_' + Math.random(),
      x,
      y,
      z: y,
      vx: (Math.random() - 0.5) * 30,
      vy: -60,
      life: 0.6,
      maxLife: 0.6,
      type: 'comic_text',
      text,
    });
  }

  public spawnDust(x: number, z: number) {
    for (let d = 0; d < 3; d++) {
      this.particles.push({
        id: 'dust_' + Math.random(),
        x: x + (Math.random() - 0.5) * 20,
        y: z,
        z,
        vx: (Math.random() - 0.5) * 40,
        vy: -15,
        life: 0.35,
        maxLife: 0.35,
        type: 'smoke',
      });
    }
  }
}
