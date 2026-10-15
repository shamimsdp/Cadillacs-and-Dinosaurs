/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CHARACTERS } from './characters';
import {
  CharacterId,
  DestructibleProp,
  EnemyEntity,
  Particle,
  PlayerEntity,
  WeaponItem,
} from './types';

// Procedural 16-Bit CPS-1 Arcade Sprite Renderer
export class ArcadeSpriteRenderer {
  // Draw ground shadow with perspective ellipse
  public drawShadow(ctx: CanvasRenderingContext2D, x: number, z: number, radius: number = 24, alpha: number = 0.35) {
    ctx.save();
    ctx.translate(x, z);
    ctx.scale(1, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }

  // Draw Player Character
  public drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerEntity,
    cameraX: number
  ) {
    const screenX = player.x - cameraX;
    const screenY = player.z - player.y;
    const facing = player.facing;
    const char = CHARACTERS[player.charId];

    // Shadow
    this.drawShadow(ctx, screenX, player.z, player.width * 0.5, 0.4);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(facing, 1);

    // Hit flash tint
    if (player.hitstunTimer > 0 && Math.floor(player.hitstunTimer * 30) % 2 === 0) {
      ctx.filter = 'brightness(2.5) contrast(1.5)';
    }

    // Invincibility blink
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const animCycle = (Date.now() / 150) % 4;

    switch (player.state) {
      case 'idle':
        this.renderHumanoid(ctx, char, 'idle', 0);
        break;
      case 'walk':
        this.renderHumanoid(ctx, char, 'walk', animCycle);
        break;
      case 'dash':
        this.renderHumanoid(ctx, char, 'dash', animCycle);
        break;
      case 'punch1':
      case 'punch2':
      case 'punch3':
        this.renderHumanoid(ctx, char, 'punch', player.stateTimer);
        break;
      case 'punchFinish':
        this.renderHumanoid(ctx, char, 'punchFinish', player.stateTimer);
        break;
      case 'dashAttack':
        this.renderHumanoid(ctx, char, 'dashAttack', player.stateTimer);
        break;
      case 'jump':
      case 'jumpAttack':
        this.renderHumanoid(ctx, char, player.state === 'jumpAttack' ? 'jumpKick' : 'jump', player.stateTimer);
        break;
      case 'special':
        this.renderHumanoid(ctx, char, 'special', player.stateTimer);
        break;
      case 'grab':
      case 'throw':
        this.renderHumanoid(ctx, char, player.state === 'throw' ? 'throw' : 'grab', player.stateTimer);
        break;
      case 'hurt':
        this.renderHumanoid(ctx, char, 'hurt', player.stateTimer);
        break;
      case 'knockdown':
        this.renderHumanoid(ctx, char, 'knockdown', player.stateTimer);
        break;
      case 'getup':
        this.renderHumanoid(ctx, char, 'getup', player.stateTimer);
        break;
      case 'shoot':
        this.renderHumanoid(ctx, char, 'shoot', player.stateTimer, player.heldWeapon?.type);
        break;
      default:
        this.renderHumanoid(ctx, char, 'idle', 0);
    }

    // Held Melee Weapon rendering in hand
    if (player.heldWeapon && ['knife', 'pipe'].includes(player.heldWeapon.type) && player.state !== 'knockdown') {
      this.drawHeldWeapon(ctx, player.heldWeapon.type);
    }

    ctx.restore();
  }

  // Draw Held Weapon in Hand
  private drawHeldWeapon(ctx: CanvasRenderingContext2D, weaponType: string) {
    ctx.save();
    if (weaponType === 'knife') {
      ctx.fillStyle = '#CBD5E1';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, -35);
      ctx.lineTo(38, -37);
      ctx.lineTo(36, -33);
      ctx.lineTo(22, -32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Handle
      ctx.fillStyle = '#78350F';
      ctx.fillRect(18, -35, 5, 4);
    } else if (weaponType === 'pipe') {
      ctx.fillStyle = '#94A3B8';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(18, -48, 5, 36);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Render Humanoid Fighter (Jack, Hannah, Mustapha, Mess)
  private renderHumanoid(
    ctx: CanvasRenderingContext2D,
    char: typeof CHARACTERS[CharacterId],
    pose: string,
    progress: number,
    gunType?: string
  ) {
    const isMess = char.id === 'mess';
    const scale = isMess ? 1.25 : 1.05;
    const bodyW = (isMess ? 30 : 22) * scale;
    const legW = (isMess ? 12 : 9) * scale;

    ctx.save();

    // Specific Action Poses
    if (pose === 'knockdown') {
      // Knocked flat on back / belly
      ctx.translate(0, -12);
      ctx.rotate(-Math.PI / 2);
    } else if (pose === 'hurt') {
      ctx.translate(-6, -2);
      ctx.rotate(-0.1);
    }

    // 1. Legs / Boots
    ctx.fillStyle = char.pantsColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;

    if (pose === 'jumpKick' || pose === 'dashAttack') {
      // Flying Dropkick / Slide
      ctx.save();
      // Forward extended leg
      ctx.fillRect(0, -32, 36 * scale, legW);
      ctx.strokeRect(0, -32, 36 * scale, legW);
      // Boot
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(32 * scale, -34, 12, 12);
      ctx.strokeRect(32 * scale, -34, 12, 12);
      // Back bent leg
      ctx.fillStyle = char.pantsColor;
      ctx.fillRect(-18, -26, 18, legW);
      ctx.strokeRect(-18, -26, 18, legW);
      ctx.restore();
    } else if (pose === 'walk') {
      const step = Math.sin(progress * Math.PI);
      // Left leg
      ctx.fillRect(-8 + step * 8, -30, legW, 30);
      ctx.strokeRect(-8 + step * 8, -30, legW, 30);
      // Right leg
      ctx.fillRect(4 - step * 8, -30, legW, 30);
      ctx.strokeRect(4 - step * 8, -30, legW, 30);
      // Boots
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(-9 + step * 8, -8, legW + 3, 10);
      ctx.fillRect(3 - step * 8, -8, legW + 3, 10);
    } else if (pose === 'special') {
      // Whirlwind / Somersault / Ground Pound
      const spinAngle = (progress * Math.PI * 4);
      ctx.rotate(Math.sin(spinAngle) * 0.2);
      ctx.fillRect(-16, -34, 32, 14);
      ctx.strokeRect(-16, -34, 32, 14);
      // Legs splayed
      ctx.fillRect(-28, -28, 16, legW);
      ctx.fillRect(12, -28, 16, legW);
    } else {
      // Standing / Idle legs
      ctx.fillRect(-9, -32, legW, 32);
      ctx.strokeRect(-9, -32, legW, 32);
      ctx.fillRect(3, -32, legW, 32);
      ctx.strokeRect(3, -32, legW, 32);

      // Boots
      ctx.fillStyle = char.accentColor;
      ctx.fillRect(-10, -6, legW + 3, 8);
      ctx.strokeRect(-10, -6, legW + 3, 8);
      ctx.fillRect(2, -6, legW + 3, 8);
      ctx.strokeRect(2, -6, legW + 3, 8);
    }

    // 2. Torso & Clothes
    ctx.fillStyle = char.shirtColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;

    const torsoH = isMess ? 38 : 32;
    const torsoY = -32 - torsoH;

    // Muscular / Fitted Torso
    ctx.beginPath();
    ctx.roundRect(-bodyW / 2, torsoY, bodyW, torsoH, [4, 4, 1, 1]);
    ctx.fill();
    ctx.stroke();

    // Muscle chest / detail
    if (isMess || char.id === 'hannah') {
      ctx.fillStyle = char.skinColor;
      // Neck / Cleavage / Chest opening
      ctx.beginPath();
      ctx.moveTo(-6, torsoY);
      ctx.lineTo(6, torsoY);
      ctx.lineTo(0, torsoY + 12);
      ctx.closePath();
      ctx.fill();
    } else if (char.id === 'mustapha') {
      // Suspenders
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-bodyW / 4, torsoY);
      ctx.lineTo(-bodyW / 4, torsoY + torsoH);
      ctx.moveTo(bodyW / 4, torsoY);
      ctx.lineTo(bodyW / 4, torsoY + torsoH);
      ctx.stroke();
    }

    // Belt
    ctx.fillStyle = '#451A03';
    ctx.fillRect(-bodyW / 2, -34, bodyW, 5);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-3, -34, 6, 5); // Buckle

    // 3. Head & Hair / Cap
    const headSize = (isMess ? 16 : 14) * scale;
    const headY = torsoY - headSize;

    // Head base
    ctx.fillStyle = char.skinColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, headY + headSize / 2, headSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair / Cap
    if (char.id === 'mustapha' || char.id === 'jack') {
      // Flat mechanic cap with visor
      ctx.fillStyle = char.accentColor;
      ctx.strokeStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(0, headY + 3, headSize / 2 + 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cap brim
      ctx.fillRect(2, headY + 4, 9, 3);
    } else if (char.id === 'hannah') {
      // Long flowing purple hair
      ctx.fillStyle = char.hairColor;
      ctx.beginPath();
      ctx.moveTo(-headSize / 2 - 2, headY + 2);
      ctx.lineTo(headSize / 2 + 2, headY + 2);
      ctx.lineTo(headSize / 2 + 4, headY + headSize + 12);
      ctx.lineTo(-headSize / 2 - 4, headY + headSize + 12);
      ctx.closePath();
      ctx.fill();
    } else {
      // Mess flattop
      ctx.fillStyle = char.hairColor;
      ctx.fillRect(-headSize / 2, headY - 3, headSize, 6);
    }

    // Eyes / Band / Beard
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(3, headY + headSize / 2 - 1, 2.5, 2.5);

    // 4. Arms & Punching Fists
    ctx.fillStyle = isMess ? char.skinColor : char.shirtColor;
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;

    if (pose === 'punch' || pose === 'punchFinish') {
      // Extended striking arm
      const reach = (pose === 'punchFinish' ? 38 : 28) * scale;
      ctx.beginPath();
      ctx.rect(4, torsoY + 6, reach, 9 * scale);
      ctx.fill();
      ctx.stroke();

      // Fist with glove/accent
      ctx.fillStyle = char.skinColor;
      ctx.beginPath();
      ctx.arc(4 + reach, torsoY + 10, 6 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (pose === 'shoot') {
      // Gun aiming stance
      ctx.beginPath();
      ctx.rect(4, torsoY + 6, 24, 7);
      ctx.fill();
      ctx.stroke();

      // Gun graphic
      this.drawGunInHand(ctx, 28, torsoY + 6, gunType || 'pistol');
    } else {
      // Idle / ready arms (guard)
      ctx.beginPath();
      ctx.rect(2, torsoY + 8, 14 * scale, 8 * scale);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = char.skinColor;
      ctx.beginPath();
      ctx.arc(16 * scale, torsoY + 12, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Gun model when shooting
  private drawGunInHand(ctx: CanvasRenderingContext2D, x: number, y: number, gunType: string) {
    ctx.save();
    ctx.translate(x, y);

    if (gunType === 'shotgun') {
      // Long barrel pump shotgun
      ctx.fillStyle = '#78350F'; // Wood stock
      ctx.fillRect(-6, 2, 10, 5);
      ctx.fillStyle = '#334155'; // Steel barrel
      ctx.fillRect(4, 0, 24, 4);
      ctx.fillRect(6, 4, 10, 3); // Pump
    } else if (gunType === 'uzi') {
      // Compact submachine gun with mag
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, -1, 16, 7);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(4, 6, 4, 10); // Magazine
    } else {
      // Colt .45 Pistol
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 12, 5);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(0, 5, 4, 6); // Grip
    }

    // Muzzle flash on shoot
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    const tipX = gunType === 'shotgun' ? 30 : gunType === 'uzi' ? 18 : 14;
    ctx.arc(tipX, 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(tipX, 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw Enemies (Poacher Thug, Butcher, Velociraptor, Boss Vice Terhune)
  public drawEnemy(
    ctx: CanvasRenderingContext2D,
    enemy: EnemyEntity,
    cameraX: number
  ) {
    const screenX = enemy.x - cameraX;
    const screenY = enemy.z - enemy.y;
    const facing = enemy.facing;

    // Shadow
    this.drawShadow(ctx, screenX, enemy.z, enemy.width * 0.55, 0.4);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.scale(facing, 1);

    // Hit flash tint
    if (enemy.hitstunTimer > 0 && Math.floor(enemy.hitstunTimer * 30) % 2 === 0) {
      ctx.filter = 'brightness(2.8) contrast(1.4)';
    }

    if (enemy.enemyType === 'raptor') {
      this.renderVelociraptor(ctx, enemy);
    } else if (enemy.enemyType === 'vice_boss') {
      this.renderViceBoss(ctx, enemy);
    } else if (enemy.enemyType === 'butcher') {
      this.renderButcher(ctx, enemy);
    } else {
      this.renderPoacher(ctx, enemy);
    }

    ctx.restore();
  }

  // Render Velociraptor Dinosaur (Green / Calm vs Red / Enraged)
  private renderVelociraptor(ctx: CanvasRenderingContext2D, raptor: EnemyEntity) {
    const isEnraged = raptor.enraged || raptor.aiState === 'enraged';
    const mainColor = isEnraged ? '#DC2626' : '#65A30D'; // Blood red vs Jungle green
    const bellyColor = isEnraged ? '#FEF08A' : '#BEF264';
    const eyeColor = isEnraged ? '#FEF08A' : '#F59E0B';

    ctx.save();

    if (raptor.state === 'knockdown') {
      ctx.translate(0, -10);
      ctx.rotate(-Math.PI / 2.2);
    }

    // 1. Long Whip Tail
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(-18, -32);
    ctx.quadraticCurveTo(-45, -45 + Math.sin(Date.now() / 120) * 8, -65, -30);
    ctx.quadraticCurveTo(-42, -26, -16, -24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Powerful Raptor Legs with Sickle Claw
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    // Thigh
    ctx.ellipse(-6, -22, 10, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Lower leg & claw
    ctx.fillRect(-6, -14, 7, 14);
    ctx.strokeRect(-6, -14, 7, 14);

    // Sharp talons / sickle toe claw
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(1, -2);
    ctx.lineTo(12, -1);
    ctx.lineTo(8, -8);
    ctx.closePath();
    ctx.fill();

    // 3. Sleek Dinosaur Body & Underbelly
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.ellipse(4, -34, 24, 15, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Underbelly stripes
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.ellipse(6, -30, 16, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Forearms / Sharp Grasping Claws
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.rect(14, -30, 12, 5);
    ctx.fill();
    ctx.stroke();
    // Three claws
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(25, -32, 5, 2);
    ctx.fillRect(26, -29, 6, 2);
    ctx.fillRect(25, -26, 5, 2);

    // 5. Extended Tooth-Filled Snout & Head
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(14, -44);
    ctx.lineTo(38, -40); // Upper snout
    ctx.lineTo(38, -33);
    ctx.lineTo(24, -33); // Open jaw
    ctx.lineTo(36, -28); // Lower jaw
    ctx.lineTo(20, -26);
    ctx.lineTo(10, -36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp White Teeth
    ctx.fillStyle = '#FFFFFF';
    for (let t = 24; t <= 36; t += 3) {
      ctx.fillRect(t, -35, 1.8, 3.5);
      ctx.fillRect(t, -31, 1.8, 3);
    }

    // Ferocious Slit Eye
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(20, -40, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(19.5, -42, 1.5, 4);

    // Spines / Frills down neck
    ctx.fillStyle = '#1E293B';
    for (let s = 0; s < 4; s++) {
      ctx.fillRect(4 + s * 4, -48 + s * 3, 3, 4);
    }

    ctx.restore();
  }

  // Render Stage 1 Boss: Vice Terhune
  private renderViceBoss(ctx: CanvasRenderingContext2D, boss: EnemyEntity) {
    ctx.save();

    if (boss.state === 'knockdown') {
      ctx.translate(0, -10);
      ctx.rotate(-Math.PI / 2);
    }

    const scale = 1.15;
    const bodyW = 26 * scale;

    // Legs
    ctx.fillStyle = '#A78BFA'; // Lavender purple combat trousers
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.fillRect(-10, -32, 10, 32);
    ctx.strokeRect(-10, -32, 10, 32);
    ctx.fillRect(2, -32, 10, 32);
    ctx.strokeRect(2, -32, 10, 32);

    // Silver spiked knee pads & combat boots
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-11, -22, 12, 6);
    ctx.fillRect(1, -22, 12, 6);
    ctx.fillStyle = '#334155';
    ctx.fillRect(-11, -6, 12, 8);
    ctx.fillRect(1, -6, 12, 8);

    // Torso: Spiky black fur mantle & purple armor harness
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(-bodyW / 2, -66, bodyW, 34);
    ctx.strokeRect(-bodyW / 2, -66, bodyW, 34);

    // Black feathered/fur shoulder pad
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-bodyW / 2, -64, 12, 0, Math.PI * 2);
    ctx.arc(bodyW / 2, -64, 12, 0, Math.PI * 2);
    ctx.fill();

    // Bare muscled chest with X-straps
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.moveTo(-6, -66);
    ctx.lineTo(6, -66);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bodyW / 2, -66);
    ctx.lineTo(bodyW / 2, -34);
    ctx.moveTo(bodyW / 2, -66);
    ctx.lineTo(-bodyW / 2, -34);
    ctx.stroke();

    // Head: Spiky blonde hair, scar, smirk
    ctx.fillStyle = '#FED7AA';
    ctx.beginPath();
    ctx.arc(0, -74, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Iconic spiky blonde anime hairstyle
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -74);
    ctx.lineTo(-12, -88);
    ctx.lineTo(-4, -82);
    ctx.lineTo(2, -92);
    ctx.lineTo(8, -82);
    ctx.lineTo(13, -87);
    ctx.lineTo(10, -74);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Vice's Twin Handguns or Punch
    ctx.fillStyle = '#475569';
    if (boss.state === 'attack' || boss.state === 'shoot') {
      ctx.fillRect(10, -58, 22, 6);
      ctx.fillRect(8, -52, 4, 8); // Revolver grip
      // Muzzle flash
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(33, -55, 8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(10, -56, 12, 8);
    }

    ctx.restore();
  }

  // Render Fat Heavy Brawler (Butcher / Gneiss)
  private renderButcher(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
    ctx.save();

    if (enemy.state === 'knockdown') {
      ctx.translate(0, -10);
      ctx.rotate(-Math.PI / 2);
    }

    // Huge belly & broad stance
    ctx.fillStyle = '#38BDF8'; // Striped blue pants
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.fillRect(-18, -30, 16, 30);
    ctx.strokeRect(-18, -30, 16, 30);
    ctx.fillRect(2, -30, 16, 30);
    ctx.strokeRect(2, -30, 16, 30);

    // Boots
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-19, -8, 18, 10);
    ctx.fillRect(1, -8, 18, 10);

    // Massive belly shirt (Pink / Lavender)
    ctx.fillStyle = '#F472B6';
    ctx.beginPath();
    ctx.ellipse(0, -48, 26, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Thick skull & bushy dark beard
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(0, -72, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bushy Black Beard
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(2, -66, 9, 0, Math.PI);
    ctx.fill();

    // Cleaver or Punch
    if (enemy.state === 'attack') {
      ctx.fillStyle = '#94A3B8';
      ctx.strokeStyle = '#0F172A';
      ctx.fillRect(18, -58, 18, 14);
      ctx.strokeRect(18, -58, 18, 14);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(12, -54, 7, 5);
    } else {
      ctx.fillStyle = '#FCD34D';
      ctx.beginPath();
      ctx.arc(16, -48, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render Standard Thug / Poacher
  private renderPoacher(ctx: CanvasRenderingContext2D, enemy: EnemyEntity) {
    ctx.save();

    if (enemy.state === 'knockdown') {
      ctx.translate(0, -8);
      ctx.rotate(-Math.PI / 2);
    }

    // Jeans
    ctx.fillStyle = '#2563EB';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.fillRect(-8, -28, 8, 28);
    ctx.strokeRect(-8, -28, 8, 28);
    ctx.fillRect(1, -28, 8, 28);
    ctx.strokeRect(1, -28, 8, 28);

    // Boots
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-9, -6, 10, 7);
    ctx.fillRect(0, -6, 10, 7);

    // Vest (Green or Brown)
    ctx.fillStyle = '#4B5563';
    ctx.fillRect(-10, -56, 20, 28);
    ctx.strokeRect(-10, -56, 20, 28);

    // Bare chest
    ctx.fillStyle = '#FDE047';
    ctx.fillRect(-3, -56, 6, 16);

    // Head with Mohawk / Headband
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(0, -64, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Headband
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-8, -68, 16, 4);

    // Attack pose
    if (enemy.state === 'attack') {
      ctx.fillStyle = '#FDE047';
      ctx.fillRect(6, -48, 18, 6);
      ctx.strokeRect(6, -48, 18, 6);
    }

    ctx.restore();
  }

  // Draw Ground Items (Weapons, Food, Treasure)
  public drawItem(ctx: CanvasRenderingContext2D, item: WeaponItem, cameraX: number) {
    const screenX = item.x - cameraX;
    const screenY = item.z - item.y;

    // Shadow
    this.drawShadow(ctx, screenX, item.z, 14, 0.3);

    ctx.save();
    ctx.translate(screenX, screenY);

    // Slight floating bounce
    const bounce = Math.sin(Date.now() / 200 + item.x) * 2;
    ctx.translate(0, bounce);

    switch (item.type) {
      case 'pistol':
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-8, -6, 16, 7);
        ctx.strokeRect(-8, -6, 16, 7);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-6, 0, 5, 8);
        break;
      case 'shotgun':
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-14, -4, 28, 6);
        ctx.strokeRect(-14, -4, 28, 6);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-14, -2, 8, 8);
        break;
      case 'uzi':
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-9, -6, 18, 8);
        ctx.fillRect(-3, 2, 4, 10);
        break;
      case 'knife':
        ctx.fillStyle = '#E2E8F0';
        ctx.fillRect(-10, -3, 20, 5);
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-10, -2, 6, 3);
        break;
      case 'pipe':
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(-16, -3, 32, 5);
        break;
      case 'grenade':
        ctx.fillStyle = '#15803D';
        ctx.beginPath();
        ctx.arc(0, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-2, -9, 4, 3);
        break;
      case 'food_meat': // Giant Roast Chicken / T-Bone
        ctx.fillStyle = '#991B1B';
        ctx.beginPath();
        ctx.ellipse(0, -6, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8, -7, 6, 4);
        ctx.fillRect(12, -9, 3, 3);
        ctx.fillRect(12, -4, 3, 3);
        break;
      case 'food_burger':
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, -7, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#78350F';
        ctx.fillRect(-8, -7, 16, 4);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(-8, -3, 16, 4);
        break;
      case 'food_drink':
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(-5, -12, 10, 14);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-5, -6, 10, 3);
        break;
      case 'treasure_gold':
        ctx.fillStyle = '#FACC15';
        ctx.strokeStyle = '#B45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      case 'treasure_gem':
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(8, -6);
        ctx.lineTo(0, 0);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  // Draw Destructible Barrels / Crates
  public drawDestructible(ctx: CanvasRenderingContext2D, prop: DestructibleProp, cameraX: number) {
    const screenX = prop.x - cameraX;
    const screenY = prop.z - prop.y;

    this.drawShadow(ctx, screenX, prop.z, 20, 0.4);

    ctx.save();
    ctx.translate(screenX, screenY);

    if (prop.type === 'crate') {
      // Capcom wooden crate with cross braces
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.fillRect(-18, -36, 36, 36);
      ctx.strokeRect(-18, -36, 36, 36);

      ctx.fillStyle = '#78350F';
      ctx.fillRect(-14, -32, 28, 28);

      // Diagonal cross brace
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-14, -32);
      ctx.lineTo(14, -4);
      ctx.moveTo(14, -32);
      ctx.lineTo(-14, -4);
      ctx.stroke();
    } else if (prop.type === 'drum') {
      // Blue metal oil drum
      ctx.fillStyle = '#2563EB';
      ctx.strokeStyle = '#1E3A8A';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -42, 32, 42, [4, 4, 2, 2]);
      ctx.fill();
      ctx.stroke();

      // Metal ridges
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-15, -28);
      ctx.lineTo(15, -28);
      ctx.moveTo(-15, -14);
      ctx.lineTo(15, -14);
      ctx.stroke();
    } else {
      // Wooden Barrel with iron bands
      ctx.fillStyle = '#92400E';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -22, 18, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iron rings
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -32, 15, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(0, -12, 15, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Particles (Comic Hitsparks, Dust, Splinters, Text)
  public drawParticle(ctx: CanvasRenderingContext2D, p: Particle, cameraX: number) {
    const screenX = p.x - cameraX;
    const screenY = p.y;
    const progress = p.life / p.maxLife; // 1 down to 0

    ctx.save();
    ctx.translate(screenX, screenY);

    if (p.type === 'comic_text' && p.text) {
      // Comic book "POW!", "WHAM!" popup
      const scale = 1.0 + (1 - progress) * 0.4;
      ctx.scale(scale, scale);
      ctx.font = '900 22px "Chakra Petch", "Impact", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FEF08A';
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      ctx.strokeText(p.text, 0, 0);
      ctx.fillText(p.text, 0, 0);
    } else if (p.type === 'hitspark' || p.type === 'bloodless_star') {
      // Capcom multi-point star spark
      ctx.fillStyle = p.color || '#FACC15';
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.5;
      const radius = (12 * (1 - progress * 0.4));
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? radius : radius * 0.38;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (p.type === 'shockwave') {
      // Megacrash ground expanding ring
      ctx.strokeStyle = `rgba(250, 204, 21, ${progress})`;
      ctx.lineWidth = 4;
      ctx.scale(1, 0.4);
      ctx.beginPath();
      ctx.arc(0, 0, (1 - progress) * 90, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === 'wood') {
      // Wood splinter flying
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-3, -3, 6 * progress, 3);
    } else if (p.type === 'smoke') {
      ctx.fillStyle = `rgba(148, 163, 184, ${progress * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, 0, 10 * (2 - progress), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export const spriteRenderer = new ArcadeSpriteRenderer();
