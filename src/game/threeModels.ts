/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CHARACTERS } from './characters';
import { CharacterId, EnemyType } from './types';

export interface RiggedCharacterModel {
  group: THREE.Group;
  root: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponSlot: THREE.Group;
  shadow: THREE.Mesh;
  charId?: CharacterId;
  enemyType?: EnemyType;
  updatePose: (pose: string, progress: number, facing: number) => void;
}

// Procedural materials cache
const matCache: Record<string, THREE.Material> = {};

function getMaterial(key: string, color: number | string, roughness = 0.6, metalness = 0.1): THREE.MeshStandardMaterial {
  const cacheKey = `${key}_${color}_${roughness}_${metalness}`;
  if (!matCache[cacheKey]) {
    matCache[cacheKey] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness,
      metalness,
    });
  }
  return matCache[cacheKey] as THREE.MeshStandardMaterial;
}

// Shared Shadow Geometry
const shadowGeo = new THREE.CircleGeometry(0.55, 16);
shadowGeo.rotateX(-Math.PI / 2);
const shadowMat = new THREE.MeshBasicMaterial({
  color: 0x0a0f1d,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
});

/**
 * Procedural Canvas Textures for Mustapha Cairo's action figure detailing
 */
let capPatchTexCache: THREE.CanvasTexture | null = null;
function getCapPatchTexture(): THREE.CanvasTexture {
  if (capPatchTexCache) return capPatchTexCache;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);

  // Outer dark forest green circular patch
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fillStyle = '#17471E';
  ctx.fill();

  // Stitched border rim
  ctx.beginPath();
  ctx.arc(128, 128, 114, 0, Math.PI * 2);
  ctx.strokeStyle = '#2A7236';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner gold embroidered ring
  ctx.beginPath();
  ctx.arc(128, 128, 92, 0, Math.PI * 2);
  ctx.strokeStyle = '#FACC15';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Inner green center circle
  ctx.beginPath();
  ctx.arc(128, 128, 86, 0, Math.PI * 2);
  ctx.fillStyle = '#1E5828';
  ctx.fill();

  // Central emblem: stylized winged star / C&D crest
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.moveTo(128, 52);
  ctx.lineTo(138, 95);
  ctx.lineTo(185, 95);
  ctx.lineTo(146, 120);
  ctx.lineTo(160, 168);
  ctx.lineTo(128, 140);
  ctx.lineTo(96, 168);
  ctx.lineTo(110, 120);
  ctx.lineTo(71, 95);
  ctx.lineTo(118, 95);
  ctx.closePath();
  ctx.fill();

  // Center crest gem
  ctx.beginPath();
  ctx.arc(128, 118, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#14532D';
  ctx.fill();

  capPatchTexCache = new THREE.CanvasTexture(canvas);
  capPatchTexCache.colorSpace = THREE.SRGBColorSpace;
  return capPatchTexCache;
}

let strapTexCache: THREE.CanvasTexture | null = null;
function getSnapbackStrapTexture(): THREE.CanvasTexture {
  if (strapTexCache) return strapTexCache;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#452611';
  ctx.fillRect(0, 0, 128, 32);

  // Adjustment holes
  ctx.fillStyle = '#180B04';
  for (let x = 16; x < 115; x += 14) {
    ctx.beginPath();
    ctx.arc(x, 16, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  strapTexCache = new THREE.CanvasTexture(canvas);
  strapTexCache.colorSpace = THREE.SRGBColorSpace;
  return strapTexCache;
}

let faceTexCache: THREE.CanvasTexture | null = null;
function getMustaphaFaceTexture(): THREE.CanvasTexture {
  if (faceTexCache) return faceTexCache;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base warm tan skin gradient
  const grad = ctx.createRadialGradient(256, 256, 60, 256, 256, 250);
  grad.addColorStop(0, '#CA8852');
  grad.addColorStop(0.7, '#BD7D48');
  grad.addColorStop(1, '#965C32');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Cheekbone contour shading
  ctx.fillStyle = 'rgba(120, 60, 25, 0.22)';
  ctx.beginPath();
  ctx.ellipse(140, 290, 45, 70, -0.2, 0, Math.PI * 2);
  ctx.ellipse(372, 290, 45, 70, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Sclera, Iris, Pupils & Eyeliner
  [-1, 1].forEach((dir) => {
    const cx = 256 + dir * 85;
    const cy = 205;

    // Eye socket shadow
    ctx.fillStyle = 'rgba(50, 22, 10, 0.32)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 48, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sclera White
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 38, 20, dir * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Dark Brown Iris
    ctx.fillStyle = '#3A1E0E';
    ctx.beginPath();
    ctx.arc(cx + dir * 4, cy, 15, 0, Math.PI * 2);
    ctx.fill();

    // Black Pupil
    ctx.fillStyle = '#050302';
    ctx.beginPath();
    ctx.arc(cx + dir * 4, cy, 8, 0, Math.PI * 2);
    ctx.fill();

    // Specular Catchlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + dir * 4 - 3, cy - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Dark Eyeliner
    ctx.strokeStyle = '#150C07';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 1, 40, 20, dir * 0.08, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();

    // Strong Dark Eyebrow
    ctx.fillStyle = '#140E0C';
    ctx.beginPath();
    ctx.moveTo(cx - dir * 46, cy - 30);
    ctx.quadraticCurveTo(cx, cy - 44, cx + dir * 46, cy - 32);
    ctx.quadraticCurveTo(cx, cy - 34, cx - dir * 46, cy - 30);
    ctx.fill();
  });

  // Nose Bridge & Nostrils
  ctx.strokeStyle = 'rgba(105, 50, 22, 0.45)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(250, 215);
  ctx.lineTo(248, 288);
  ctx.lineTo(256, 302);
  ctx.stroke();

  ctx.fillStyle = '#4E220D';
  ctx.beginPath();
  ctx.ellipse(244, 305, 7, 4, -0.3, 0, Math.PI * 2);
  ctx.ellipse(268, 305, 7, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Mustapha's Signature Trimmed Black Mustache
  ctx.fillStyle = '#110C0A';
  ctx.beginPath();
  ctx.moveTo(256, 318);
  ctx.bezierCurveTo(230, 314, 175, 326, 160, 346);
  ctx.bezierCurveTo(185, 360, 230, 343, 256, 333);
  ctx.bezierCurveTo(282, 343, 327, 360, 352, 346);
  ctx.bezierCurveTo(337, 326, 282, 314, 256, 318);
  ctx.fill();

  // Lips
  ctx.strokeStyle = '#854224';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(220, 362);
  ctx.quadraticCurveTo(256, 366, 292, 362);
  ctx.stroke();

  // Trimmed Goatee on Chin & Jawline Beard
  ctx.fillStyle = '#120D0B';
  // Chin Goatee
  ctx.beginPath();
  ctx.moveTo(234, 385);
  ctx.lineTo(278, 385);
  ctx.lineTo(270, 442);
  ctx.lineTo(242, 442);
  ctx.closePath();
  ctx.fill();

  // Jawline beard framing
  ctx.beginPath();
  ctx.moveTo(110, 300);
  ctx.quadraticCurveTo(140, 420, 256, 465);
  ctx.quadraticCurveTo(372, 420, 402, 300);
  ctx.quadraticCurveTo(378, 440, 256, 485);
  ctx.quadraticCurveTo(134, 440, 110, 300);
  ctx.fill();

  faceTexCache = new THREE.CanvasTexture(canvas);
  faceTexCache.colorSpace = THREE.SRGBColorSpace;
  return faceTexCache;
}

/**
 * High-Fidelity 3D Mustapha Cairo Collectible Figurine Model:
 * 1. 6-Panel Structured Baseball Cap (Pale Khaki dome #F1DE9E, Dark Forest-Green Visor #1E5428,
 *    circular embroidered crest patch, rear keyhole arch with snapback strap).
 * 2. Sculpted Heroic Head & Face (Determined gaze, trimmed black mustache, jawline beard, athletic chin).
 * 3. Safari Olive-Green Short-Sleeve Shirt (#3B783F with open V-collar lapels, button placket,
 *    left breast pocket with flap & button, and thick rolled sleeve cuffs).
 * 4. Powerful Bare Muscular Arms (Deltoid caps, peak biceps, forearm taper, sculpted clenched fists).
 * 5. Sturdy Dark Brown Leather Belt with Metallic Chrome Buckle & Prong.
 * 6. Mustard-Yellow Safari Trousers (#DEB43E with rear patch pockets and realistic knee/crotch folds).
 * 7. Tall Saddle-Brown Riding Boots (#653A1C with flared cuffs, ankle creases, contoured toe, lug sole & heel).
 * 8. Signature Beat-'Em-Up Boxer Combat Stance (Left chin guard, right jab guard, wide athletic stance).
 */
export function create3DMustaphaDetailed(): RiggedCharacterModel {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  // Contact Ground Shadow
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  shadow.scale.set(1.25, 1, 0.95);
  group.add(shadow);

  // PBR Stylized Materials
  const skinMat = getMaterial('mustapha_skin_hd', 0xbd7d48, 0.48, 0.02);
  const shirtMat = getMaterial('mustapha_shirt_hd', 0x3b783f, 0.60, 0.03);
  const shirtTrimMat = getMaterial('mustapha_shirtrim_hd', 0x2e6332, 0.55, 0.03);
  const buttonMat = getMaterial('mustapha_btn_hd', 0x1b4520, 0.32, 0.05);
  const capCrownMat = getMaterial('mustapha_cap_crown', 0xf1de9e, 0.62, 0.02);
  const capVisorMat = getMaterial('mustapha_cap_visor', 0x1e5428, 0.42, 0.04);
  const beltMat = getMaterial('mustapha_belt_hd', 0x4a2812, 0.40, 0.08);
  const buckleMat = getMaterial('mustapha_buckle_hd', 0xe2e8f0, 0.18, 0.92);
  const pantsMat = getMaterial('mustapha_pants_hd', 0xdeb43e, 0.64, 0.03);
  const pantsShadowMat = getMaterial('mustapha_pants_shadow', 0xc5992e, 0.68, 0.03);
  const bootMat = getMaterial('mustapha_boot_hd', 0x653a1c, 0.38, 0.08);
  const bootCuffMat = getMaterial('mustapha_boot_cuff', 0x542e15, 0.42, 0.08);
  const bootSoleMat = getMaterial('mustapha_boot_sole', 0x20150d, 0.80, 0.05);
  const hairMat = getMaterial('mustapha_hair_hd', 0x140e0c, 0.85, 0.05);

  // 1. Torso & Safari Shirt with Sculpted V-Taper
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.22, 0.46, 20),
    shirtMat
  );
  torso.scale.set(1.08, 1, 0.76);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torso.position.y = 1.10;
  root.add(torso);

  // Sculpted Pectoral Muscles under Shirt
  const leftPec = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 16, 12),
    shirtMat
  );
  leftPec.scale.set(1.15, 0.92, 0.75);
  leftPec.position.set(-0.11, 0.08, 0.13);
  torso.add(leftPec);

  const rightPec = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 16, 12),
    shirtMat
  );
  rightPec.scale.set(1.15, 0.92, 0.75);
  rightPec.position.set(0.11, 0.08, 0.13);
  torso.add(rightPec);

  // V-Neck Open Chest Inset
  const vNeckSkin = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.18, 16),
    skinMat
  );
  vNeckSkin.rotation.z = Math.PI;
  vNeckSkin.position.set(0, 0.14, 0.145);
  torso.add(vNeckSkin);

  // Open Collar Wings / Notched Lapels
  const leftLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.11, 0.022),
    shirtTrimMat
  );
  leftLapel.rotation.set(-0.24, 0.35, -0.42);
  leftLapel.position.set(-0.14, 0.20, 0.15);
  leftLapel.castShadow = true;
  torso.add(leftLapel);

  const rightLapel = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.11, 0.022),
    shirtTrimMat
  );
  rightLapel.rotation.set(-0.24, -0.35, 0.42);
  rightLapel.position.set(0.14, 0.20, 0.15);
  rightLapel.castShadow = true;
  torso.add(rightLapel);

  // Collar Back Band
  const collarBack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
    shirtTrimMat
  );
  collarBack.position.set(0, 0.22, 0);
  torso.add(collarBack);

  // Button Placket Strip
  const placket = new THREE.Mesh(
    new THREE.BoxGeometry(0.048, 0.36, 0.016),
    shirtTrimMat
  );
  placket.position.set(0, -0.04, 0.17);
  torso.add(placket);

  // 3 Domed Tonal Green Buttons
  [-0.14, -0.04, 0.06].forEach((yPos) => {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.01, 12),
      buttonMat
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, yPos, 0.18);
    torso.add(btn);
  });

  // Left Breast Pocket with Flap & Button (on character's left chest)
  const pocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.11, 0.018),
    shirtTrimMat
  );
  pocket.position.set(0.135, 0.07, 0.165);
  torso.add(pocket);

  const pocketFlap = new THREE.Mesh(
    new THREE.BoxGeometry(0.10, 0.028, 0.024),
    shirtMat
  );
  pocketFlap.position.set(0.135, 0.128, 0.168);
  torso.add(pocketFlap);

  const pocketBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.008, 10),
    buttonMat
  );
  pocketBtn.rotation.x = Math.PI / 2;
  pocketBtn.position.set(0.135, 0.125, 0.182);
  torso.add(pocketBtn);

  // Rolled Short Sleeve Cuffs (Thick Fabric Toruses on Shoulders)
  const leftSleeveCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.024, 10, 20),
    shirtTrimMat
  );
  leftSleeveCuff.rotation.x = Math.PI / 2;
  leftSleeveCuff.position.set(-0.29, 0.14, 0);
  torso.add(leftSleeveCuff);

  const rightSleeveCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.024, 10, 20),
    shirtTrimMat
  );
  rightSleeveCuff.rotation.x = Math.PI / 2;
  rightSleeveCuff.position.set(0.29, 0.14, 0);
  torso.add(rightSleeveCuff);

  // Sturdy Leather Belt & Chrome Buckle
  const belt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.23, 0.088, 20),
    beltMat
  );
  belt.scale.set(1.08, 1, 0.78);
  belt.position.y = -0.26;
  torso.add(belt);

  // 4 Belt Loops
  [-0.14, -0.06, 0.06, 0.14].forEach((xPos) => {
    const loop = new THREE.Mesh(
      new THREE.BoxGeometry(0.016, 0.092, 0.012),
      pantsMat
    );
    loop.position.set(xPos, -0.26, 0.175);
    torso.add(loop);
  });

  // Rectangular Metallic Silver Buckle
  const buckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.135, 0.105, 0.026),
    buckleMat
  );
  buckle.position.set(0, -0.26, 0.182);
  torso.add(buckle);

  const buckleInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.055, 0.028),
    beltMat
  );
  buckleInner.position.set(0, -0.26, 0.183);
  torso.add(buckleInner);

  const buckleTongue = new THREE.Mesh(
    new THREE.BoxGeometry(0.012, 0.065, 0.032),
    buckleMat
  );
  buckleTongue.position.set(0, -0.26, 0.184);
  torso.add(buckleTongue);

  // 2. Sculpted Head, Face & 6-Panel Baseball Cap
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.40, 0.02);
  torso.add(headGroup);

  // Muscular Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.18, 18),
    skinMat
  );
  neck.position.set(0, -0.09, 0.01);
  neck.rotation.x = 0.06;
  neck.castShadow = true;
  headGroup.add(neck);

  // Sculpted Cranium with Face Canvas Texture
  const faceMat = new THREE.MeshStandardMaterial({
    map: getMustaphaFaceTexture(),
    roughness: 0.48,
    metalness: 0.02,
  });

  const cranium = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.14, 0.12, 10, 20),
    faceMat
  );
  cranium.position.set(0, 0.04, 0.01);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // 3D Masculine Nose Bridge
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.03, 0.075, 8),
    skinMat
  );
  nose.rotation.x = -0.3;
  nose.position.set(0, 0.02, 0.165);
  headGroup.add(nose);

  // 3D Mustapha Trimmed Black Mustache
  const mustache = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.024, 0.09, 6, 12),
    hairMat
  );
  mustache.rotation.z = Math.PI / 2;
  mustache.position.set(0, -0.016, 0.165);
  headGroup.add(mustache);

  // 3D Chin Goatee & Jawline Beard
  const chinGoatee = new THREE.Mesh(
    new THREE.BoxGeometry(0.075, 0.055, 0.04),
    hairMat
  );
  chinGoatee.position.set(0, -0.068, 0.135);
  headGroup.add(chinGoatee);

  // Ears
  [-0.155, 0.155].forEach((xPos) => {
    const ear = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.026, 0.045, 6, 10),
      skinMat
    );
    ear.position.set(xPos, 0.02, -0.01);
    headGroup.add(ear);
  });

  // Black Hair at Nape & Temples
  const hairBack = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55),
    hairMat
  );
  hairBack.position.set(0, 0.02, -0.02);
  headGroup.add(hairBack);

  // Baseball Cap Dome (Pale Khaki 6-Panel Dome)
  const capCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.176, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.52),
    capCrownMat
  );
  capCrown.scale.set(1.02, 0.94, 1.08);
  capCrown.position.set(0, 0.08, -0.01);
  capCrown.castShadow = true;
  headGroup.add(capCrown);

  // Squatchee Top Button on Cap Apex
  const capButton = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 0.012, 12),
    capCrownMat
  );
  capButton.position.set(0, 0.248, -0.01);
  headGroup.add(capButton);

  // Downward-Curved Duckbill Baseball Visor (Forest Green)
  const capVisor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.195, 0.195, 0.018, 24, 1, false, -Math.PI * 0.42, Math.PI * 0.84),
    capVisorMat
  );
  capVisor.scale.set(1.0, 1.0, 1.3);
  capVisor.rotation.x = -0.20;
  capVisor.position.set(0, 0.078, 0.145);
  capVisor.castShadow = true;
  headGroup.add(capVisor);

  // Front Circular Emblem Patch on Cap Forehead
  const patchMat = new THREE.MeshBasicMaterial({
    map: getCapPatchTexture(),
    transparent: true,
    depthWrite: false,
  });
  const capPatch = new THREE.Mesh(
    new THREE.CircleGeometry(0.046, 24),
    patchMat
  );
  capPatch.position.set(0, 0.145, 0.165);
  capPatch.rotation.x = -0.12;
  headGroup.add(capPatch);

  // Rear Keyhole Arch Opening with Brown Snapback Strap
  const strapMat = new THREE.MeshBasicMaterial({
    map: getSnapbackStrapTexture(),
    transparent: true,
  });
  const capStrap = new THREE.Mesh(
    new THREE.PlaneGeometry(0.11, 0.024),
    strapMat
  );
  capStrap.position.set(0, 0.055, -0.18);
  capStrap.rotation.y = Math.PI;
  headGroup.add(capStrap);

  // 3. Muscular Bare Arms & Clenched Fists
  // Left Arm (High Chin Guard)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.30, 0.18, 0);
  torso.add(leftArm);

  const leftDeltoid = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    skinMat
  );
  leftDeltoid.scale.set(1.1, 1.25, 1.05);
  leftDeltoid.position.set(0, -0.04, 0);
  leftArm.add(leftDeltoid);

  const leftBicep = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.19, 10, 18),
    skinMat
  );
  leftBicep.position.set(0, -0.12, 0);
  leftBicep.castShadow = true;
  leftArm.add(leftBicep);

  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.22, 0);
  leftArm.add(leftForearm);

  const leftForearmMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.088, 0.07, 0.23, 16),
    skinMat
  );
  leftForearmMesh.position.set(0, -0.11, 0);
  leftForearmMesh.castShadow = true;
  leftForearm.add(leftForearmMesh);

  // Sculpted Clenched Fist with Defined Knuckles & Folded Fingers
  const leftFist = new THREE.Group();
  leftFist.position.set(0, -0.24, 0);
  leftForearm.add(leftFist);

  const leftFistPalm = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.088, 0.082),
    skinMat
  );
  leftFistPalm.castShadow = true;
  leftFist.add(leftFistPalm);

  [-0.035, -0.012, 0.012, 0.035].forEach((xPos) => {
    const knuckle = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 8, 8),
      skinMat
    );
    knuckle.position.set(xPos, 0.035, 0.032);
    leftFist.add(knuckle);
  });

  const leftThumb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.024, 0.045, 6, 10),
    skinMat
  );
  leftThumb.rotation.z = -Math.PI / 4;
  leftThumb.position.set(0.045, -0.01, 0.036);
  leftFist.add(leftThumb);

  // Right Arm (Forward Jab Guard)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.30, 0.18, 0);
  torso.add(rightArm);

  const rightDeltoid = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 12),
    skinMat
  );
  rightDeltoid.scale.set(1.1, 1.25, 1.05);
  rightDeltoid.position.set(0, -0.04, 0);
  rightArm.add(rightDeltoid);

  const rightBicep = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.09, 0.19, 10, 18),
    skinMat
  );
  rightBicep.position.set(0, -0.12, 0);
  rightBicep.castShadow = true;
  rightArm.add(rightBicep);

  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.22, 0);
  rightArm.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.088, 0.07, 0.23, 16),
    skinMat
  );
  rightForearmMesh.position.set(0, -0.11, 0);
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightFist = new THREE.Group();
  rightFist.position.set(0, -0.24, 0);
  rightForearm.add(rightFist);

  const rightFistPalm = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.088, 0.082),
    skinMat
  );
  rightFistPalm.castShadow = true;
  rightFist.add(rightFistPalm);

  [-0.035, -0.012, 0.012, 0.035].forEach((xPos) => {
    const knuckle = new THREE.Mesh(
      new THREE.SphereGeometry(0.016, 8, 8),
      skinMat
    );
    knuckle.position.set(xPos, 0.035, 0.032);
    rightFist.add(knuckle);
  });

  const rightThumb = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.024, 0.045, 6, 10),
    skinMat
  );
  rightThumb.rotation.z = Math.PI / 4;
  rightThumb.position.set(-0.045, -0.01, 0.036);
  rightFist.add(rightThumb);

  const weaponSlot = new THREE.Group();
  weaponSlot.position.set(0, -0.24, 0.05);
  rightForearm.add(weaponSlot);

  // 4. Pelvis & Dual Rear Pockets (Mustard-Yellow Safari Trousers)
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.20, 0.22, 20),
    pantsMat
  );
  pelvis.scale.set(1.08, 1, 0.78);
  pelvis.position.y = -0.38;
  pelvis.castShadow = true;
  torso.add(pelvis);

  // Left & Right Rear Patch Pockets
  const leftRearPocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.10, 0.015),
    pantsShadowMat
  );
  leftRearPocket.position.set(-0.11, -0.38, -0.165);
  torso.add(leftRearPocket);

  const rightRearPocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.095, 0.10, 0.015),
    pantsShadowMat
  );
  rightRearPocket.position.set(0.11, -0.38, -0.165);
  torso.add(rightRearPocket);

  // 5. Left & Right Legs with Knee Folds & Tall Riding Boots
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, -0.45, 0);
  torso.add(leftLeg);

  // Muscular Thigh
  const leftThigh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.108, 0.24, 10, 18),
    pantsMat
  );
  leftThigh.position.set(0, -0.13, 0);
  leftThigh.castShadow = true;
  leftLeg.add(leftThigh);

  // Knee Folds
  const leftKneeFold = new THREE.Mesh(
    new THREE.TorusGeometry(0.104, 0.018, 8, 18),
    pantsShadowMat
  );
  leftKneeFold.rotation.x = Math.PI / 2;
  leftKneeFold.position.set(0, -0.24, 0);
  leftLeg.add(leftKneeFold);

  // Tall Riding Boot Shaft (Saddle Brown)
  const leftBootShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.098, 0.38, 18),
    bootMat
  );
  leftBootShaft.position.set(0, -0.39, 0.01);
  leftBootShaft.castShadow = true;
  leftLeg.add(leftBootShaft);

  // Flared Boot Cuff
  const leftBootCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.116, 0.02, 10, 20),
    bootCuffMat
  );
  leftBootCuff.rotation.x = Math.PI / 2;
  leftBootCuff.position.set(0, -0.21, 0.01);
  leftLeg.add(leftBootCuff);

  // Boot Foot, Soles, and Raised Heel
  const leftBootFoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.115, 0.24),
    bootMat
  );
  leftBootFoot.position.set(0, -0.57, 0.065);
  leftBootFoot.castShadow = true;
  leftLeg.add(leftBootFoot);

  const leftBootSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.135, 0.038, 0.26),
    bootSoleMat
  );
  leftBootSole.position.set(0, -0.63, 0.065);
  leftLeg.add(leftBootSole);

  const leftBootHeel = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.038, 0.085),
    bootSoleMat
  );
  leftBootHeel.position.set(0, -0.63, -0.025);
  leftLeg.add(leftBootHeel);

  // Right Leg
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, -0.45, 0);
  torso.add(rightLeg);

  const rightThigh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.108, 0.24, 10, 18),
    pantsMat
  );
  rightThigh.position.set(0, -0.13, 0);
  rightThigh.castShadow = true;
  rightLeg.add(rightThigh);

  const rightKneeFold = new THREE.Mesh(
    new THREE.TorusGeometry(0.104, 0.018, 8, 18),
    pantsShadowMat
  );
  rightKneeFold.rotation.x = Math.PI / 2;
  rightKneeFold.position.set(0, -0.24, 0);
  rightLeg.add(rightKneeFold);

  const rightBootShaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.098, 0.38, 18),
    bootMat
  );
  rightBootShaft.position.set(0, -0.39, 0.01);
  rightBootShaft.castShadow = true;
  rightLeg.add(rightBootShaft);

  const rightBootCuff = new THREE.Mesh(
    new THREE.TorusGeometry(0.116, 0.02, 10, 20),
    bootCuffMat
  );
  rightBootCuff.rotation.x = Math.PI / 2;
  rightBootCuff.position.set(0, -0.21, 0.01);
  rightLeg.add(rightBootCuff);

  const rightBootFoot = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.115, 0.24),
    bootMat
  );
  rightBootFoot.position.set(0, -0.57, 0.065);
  rightBootFoot.castShadow = true;
  rightLeg.add(rightBootFoot);

  const rightBootSole = new THREE.Mesh(
    new THREE.BoxGeometry(0.135, 0.038, 0.26),
    bootSoleMat
  );
  rightBootSole.position.set(0, -0.63, 0.065);
  rightLeg.add(rightBootSole);

  const rightBootHeel = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.038, 0.085),
    bootSoleMat
  );
  rightBootHeel.position.set(0, -0.63, -0.025);
  rightLeg.add(rightBootHeel);

  // 6. Kinematic Pose Animation Engine
  const updatePose = (pose: string, progress: number, facing: number) => {
    // When facing is 0 (Viewer/Select Gallery mode), orient directly front toward camera
    if (facing === 0) {
      root.rotation.y = 0;
    } else {
      root.rotation.y = facing > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    }

    root.position.set(0, 0, 0);
    root.rotation.x = 0;
    root.rotation.z = 0;

    if (pose === 'walk') {
      const step = Math.sin(progress * Math.PI * 2);
      leftLeg.rotation.set(step * 0.55, 0, 0);
      rightLeg.rotation.set(-step * 0.55, 0, 0);
      leftArm.rotation.set(-step * 0.45, 0, 0.15);
      rightArm.rotation.set(step * 0.45, 0, -0.15);
      leftForearm.rotation.set(0.3, 0, 0);
      rightForearm.rotation.set(0.3, 0, 0);
      torso.rotation.set(0, step * 0.1, 0);
      torso.position.y = 1.10 + Math.abs(step) * 0.04;
      headGroup.rotation.set(0, -step * 0.08, 0);
    } else if (pose === 'dash') {
      const step = Math.sin(progress * Math.PI * 4);
      torso.rotation.set(0.35, 0, 0);
      leftLeg.rotation.set(step * 0.85, 0, 0);
      rightLeg.rotation.set(-step * 0.85, 0, 0);
      leftArm.rotation.set(-step * 0.75, 0, 0.2);
      rightArm.rotation.set(step * 0.75, 0, -0.2);
      leftForearm.rotation.set(0.6, 0, 0);
      rightForearm.rotation.set(0.6, 0, 0);
      torso.position.y = 1.00 + Math.abs(step) * 0.06;
      headGroup.rotation.set(-0.25, 0, 0);
    } else if (pose === 'punch' || pose === 'punchFinish') {
      // Explosive Right Straight Hook with Left Chin Guard
      torso.rotation.set(0, -0.35, 0);
      rightArm.rotation.set(-Math.PI * 0.48, 0.25, 0);
      rightForearm.rotation.set(-0.15, 0, 0);
      leftArm.rotation.set(-0.85, 0.45, -0.3);
      leftForearm.rotation.set(-0.7, 0.35, 0);
      leftLeg.rotation.set(0.2, 0, -0.1);
      rightLeg.rotation.set(-0.35, 0, 0.15);
      torso.position.y = 1.08;
      headGroup.rotation.set(0, 0.3, 0);
    } else if (pose === 'jumpKick' || pose === 'dashAttack') {
      // Flying Dropkick / Slide
      torso.rotation.set(0.25, 0, 0);
      rightLeg.rotation.set(-Math.PI * 0.45, 0, 0.1);
      leftLeg.rotation.set(Math.PI * 0.35, 0, -0.15);
      rightArm.rotation.set(-0.4, 0, 0);
      leftArm.rotation.set(0.6, 0, 0);
      headGroup.rotation.set(-0.15, 0, 0);
    } else if (pose === 'special') {
      // 360 Whirlwind Somersault Kick
      root.rotation.y += progress * Math.PI * 8;
      leftArm.rotation.set(0, 0, Math.PI * 0.45);
      rightArm.rotation.set(0, 0, -Math.PI * 0.45);
      leftLeg.rotation.set(-0.4, 0, 0);
      rightLeg.rotation.set(0.4, 0, 0);
      torso.position.y = 1.18;
    } else if (pose === 'knockdown') {
      root.rotation.z = Math.PI * 0.5;
      root.position.y = -0.75;
    } else if (pose === 'hurt') {
      torso.rotation.set(-0.3, 0, 0);
      headGroup.rotation.set(-0.25, 0, 0);
      leftArm.rotation.set(-0.3, 0, 0.3);
      rightArm.rotation.set(-0.3, 0, -0.3);
    } else {
      // SIGNATURE BOXER COMBAT STANCE (Exact 90%+ match to reference figurine)
      const breath = Math.sin(Date.now() / 420) * 0.015;
      torso.position.y = 1.10 + breath;
      torso.rotation.set(0, 0.22, 0); // Heroic 3/4 torso turn opening chest

      // Left Arm: High Guard defending chin & cheek at eye level
      leftArm.rotation.set(-0.82 + breath, 0.45, -0.38);
      leftForearm.rotation.set(-0.95, 0.35, 0);

      // Right Arm: Forward Jab threat at mid-chest
      rightArm.rotation.set(-0.48 - breath, -0.24, 0.16);
      rightForearm.rotation.set(-0.75, 0, 0);

      // Wide athletic combat leg stance with flexed knees
      leftLeg.rotation.set(0.16, 0, -0.14);
      rightLeg.rotation.set(-0.18, 0, 0.14);

      // Head turned facing opponent/viewer directly
      headGroup.rotation.set(0, -0.28, 0);
    }
  };

  return {
    group,
    root,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponSlot,
    shadow,
    charId: 'mustapha',
    updatePose,
  };
}

/**
 * Creates a composite 3D character model matching Three.js directives (3-12 parts)
 */
export function create3DHero(charId: CharacterId): RiggedCharacterModel {
  if (charId === 'mustapha') {
    return create3DMustaphaDetailed();
  }

  const char = CHARACTERS[charId];
  const isMess = charId === 'mess';
  const scale = isMess ? 1.25 : 1.05;

  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  // Soft Contact Ground Shadow
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  shadow.scale.set(scale * 1.1, 1, scale * 0.7);
  group.add(shadow);

  // Materials
  const skinMat = getMaterial(`skin_${charId}`, char.skinColor, 0.7, 0.05);
  const shirtMat = getMaterial(`shirt_${charId}`, char.shirtColor, 0.65, 0.1);
  const pantsMat = getMaterial(`pants_${charId}`, char.pantsColor, 0.7, 0.05);
  const accentMat = getMaterial(`accent_${charId}`, char.accentColor, 0.5, 0.2);
  const hairMat = getMaterial(`hair_${charId}`, char.hairColor, 0.8, 0.1);
  const beltMat = getMaterial('belt', 0x27170a, 0.4, 0.3);
  const buckleMat = getMaterial('buckle', 0xf59e0b, 0.25, 0.8);

  // 1. Torso & Upper Body
  const torsoW = (isMess ? 0.75 : 0.52) * scale;
  const torsoH = (isMess ? 0.85 : 0.72) * scale;
  const torsoD = (isMess ? 0.48 : 0.34) * scale;
  const torsoGeo = new THREE.BoxGeometry(torsoW, torsoH, torsoD);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  torso.position.y = 1.15 * scale;
  root.add(torso);

  // Belt & Buckle
  const beltGeo = new THREE.BoxGeometry(torsoW * 1.02, 0.12 * scale, torsoD * 1.02);
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.position.y = -torsoH * 0.42;
  torso.add(beltMesh);

  const buckleGeo = new THREE.BoxGeometry(0.14 * scale, 0.14 * scale, 0.04 * scale);
  const buckleMesh = new THREE.Mesh(buckleGeo, buckleMat);
  buckleMesh.position.set(0, -torsoH * 0.42, torsoD * 0.52);
  torso.add(buckleMesh);

  // 2. Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, torsoH * 0.6 + 0.2 * scale, 0);
  torso.add(headGroup);

  const headSize = (isMess ? 0.36 : 0.3) * scale;
  const headGeo = new THREE.BoxGeometry(headSize, headSize * 1.15, headSize);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Character Hair / Hat
  if (charId === 'jack') {
    // Mechanic Flat Cap with visor
    const capGeo = new THREE.BoxGeometry(headSize * 1.12, 0.12 * scale, headSize * 1.15);
    const capMesh = new THREE.Mesh(capGeo, accentMat);
    capMesh.position.y = headSize * 0.55;
    capMesh.castShadow = true;
    headGroup.add(capMesh);

    const visorGeo = new THREE.BoxGeometry(headSize * 0.85, 0.04 * scale, 0.2 * scale);
    const visorMesh = new THREE.Mesh(visorGeo, accentMat);
    visorMesh.position.set(0, headSize * 0.52, headSize * 0.55);
    headGroup.add(visorMesh);
  } else if (charId === 'hannah') {
    // Hannah's Purple flowing hair
    const hairGeo = new THREE.BoxGeometry(headSize * 1.15, headSize * 1.4, headSize * 1.2);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.08 * scale, -0.06 * scale);
    headGroup.add(hairMesh);
  } else {
    // Mess dark flattop
    const hairGeo = new THREE.BoxGeometry(headSize * 1.05, 0.14 * scale, headSize * 1.05);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = headSize * 0.6;
    headGroup.add(hairMesh);
  }

  // 3. Left & Right Arms
  const armW = (isMess ? 0.24 : 0.16) * scale;
  const armL = (isMess ? 0.65 : 0.58) * scale;
  const armGeo = new THREE.BoxGeometry(armW, armL, armW);

  // Left Arm Group (pivot at shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(-torsoW * 0.56, torsoH * 0.35, 0);
  torso.add(leftArm);

  const leftArmMesh = new THREE.Mesh(armGeo, isMess ? skinMat : shirtMat);
  leftArmMesh.position.y = -armL * 0.5;
  leftArmMesh.castShadow = true;
  leftArm.add(leftArmMesh);

  // Left Fist
  const fistGeo = new THREE.BoxGeometry(armW * 1.1, armW * 1.1, armW * 1.1);
  const leftFist = new THREE.Mesh(fistGeo, skinMat);
  leftFist.position.y = -armL;
  leftArm.add(leftFist);

  // Right Arm Group
  const rightArm = new THREE.Group();
  rightArm.position.set(torsoW * 0.56, torsoH * 0.35, 0);
  torso.add(rightArm);

  const rightArmMesh = new THREE.Mesh(armGeo, isMess ? skinMat : shirtMat);
  rightArmMesh.position.y = -armL * 0.5;
  rightArmMesh.castShadow = true;
  rightArm.add(rightArmMesh);

  const rightFist = new THREE.Mesh(fistGeo, skinMat);
  rightFist.position.y = -armL;
  rightArm.add(rightFist);

  // Weapon Slot inside right hand
  const weaponSlot = new THREE.Group();
  weaponSlot.position.set(0, -armL, 0.1);
  rightArm.add(weaponSlot);

  // 4. Left & Right Legs
  const legW = (isMess ? 0.26 : 0.18) * scale;
  const legL = (isMess ? 0.75 : 0.68) * scale;
  const legGeo = new THREE.BoxGeometry(legW, legL, legW);
  const bootGeo = new THREE.BoxGeometry(legW * 1.15, 0.22 * scale, legW * 1.45);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-torsoW * 0.26, -torsoH * 0.45, 0);
  torso.add(leftLeg);

  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -legL * 0.5;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const leftBoot = new THREE.Mesh(bootGeo, accentMat);
  leftBoot.position.set(0, -legL, 0.05 * scale);
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(torsoW * 0.26, -torsoH * 0.45, 0);
  torso.add(rightLeg);

  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -legL * 0.5;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightBoot = new THREE.Mesh(bootGeo, accentMat);
  rightBoot.position.set(0, -legL, 0.05 * scale);
  rightBoot.castShadow = true;
  rightLeg.add(rightBoot);

  // Pose updater with procedural kinematics
  const updatePose = (pose: string, progress: number, facing: number) => {
    // Face direction: 0 = front facing in viewer/select screen, >0 = right, <0 = left
    root.rotation.y = facing === 0 ? 0 : (facing > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
    root.position.set(0, 0, 0);
    root.rotation.x = 0;
    root.rotation.z = 0;

    // Reset base limb rotations
    leftArm.rotation.set(0, 0, 0.15);
    rightArm.rotation.set(0, 0, -0.15);
    leftLeg.rotation.set(0, 0, 0);
    rightLeg.rotation.set(0, 0, 0);
    torso.rotation.set(0, 0, 0);

    if (pose === 'walk') {
      const step = Math.sin(progress * Math.PI * 2);
      leftLeg.rotation.x = step * 0.55;
      rightLeg.rotation.x = -step * 0.55;
      leftArm.rotation.x = -step * 0.45;
      rightArm.rotation.x = step * 0.45;
      torso.position.y = (1.15 + Math.abs(step) * 0.04) * scale;
    } else if (pose === 'dash') {
      const step = Math.sin(progress * Math.PI * 4);
      torso.rotation.x = 0.35; // Leaning forward sprint
      leftLeg.rotation.x = step * 0.85;
      rightLeg.rotation.x = -step * 0.85;
      leftArm.rotation.x = -step * 0.75;
      rightArm.rotation.x = step * 0.75;
      torso.position.y = (1.05 + Math.abs(step) * 0.06) * scale;
    } else if (pose === 'punch' || pose === 'punchFinish') {
      // Powerful punch thrust
      rightArm.rotation.x = -Math.PI * 0.5;
      rightArm.rotation.y = 0.2;
      leftArm.rotation.x = 0.3;
      torso.rotation.y = -0.3;
      torso.position.y = 1.15 * scale;
    } else if (pose === 'jumpKick' || pose === 'dashAttack') {
      // Iconic Flying Kick / Slide
      torso.rotation.x = 0.25;
      rightLeg.rotation.x = -Math.PI * 0.45; // Extended kick leg
      leftLeg.rotation.x = Math.PI * 0.35; // Bent tuck leg
      rightArm.rotation.x = -0.4;
      leftArm.rotation.x = 0.6;
    } else if (pose === 'special') {
      // 360 Tornado Whirlwind / Ground Pound
      root.rotation.y += progress * Math.PI * 8;
      leftArm.rotation.z = Math.PI * 0.45;
      rightArm.rotation.z = -Math.PI * 0.45;
      leftLeg.rotation.x = -0.4;
      rightLeg.rotation.x = 0.4;
    } else if (pose === 'knockdown') {
      root.rotation.z = Math.PI * 0.5;
      root.position.y = -0.8 * scale;
    } else if (pose === 'hurt') {
      torso.rotation.x = -0.3;
      headGroup.rotation.x = -0.25;
    } else {
      // Idle breathing
      const breath = Math.sin(Date.now() / 350) * 0.02;
      torso.position.y = (1.15 + breath) * scale;
      leftArm.rotation.x = 0.15 + breath * 2;
      rightArm.rotation.x = 0.15 - breath * 2;
    }
  };

  return {
    group,
    root,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponSlot,
    shadow,
    charId,
    updatePose,
  };
}

/**
 * Creates 3D Velociraptor Dinosaur Model
 */
export function create3DRaptor(isEnraged = false): RiggedCharacterModel {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  shadow.scale.set(1.4, 1, 0.9);
  group.add(shadow);

  const skinColor = isEnraged ? 0xdc2626 : 0x65a30d;
  const bellyColor = isEnraged ? 0xfef08a : 0xbef264;
  const raptorSkinMat = getMaterial(`raptor_${isEnraged}`, skinColor, 0.55, 0.1);
  const bellyMat = getMaterial(`raptor_belly_${isEnraged}`, bellyColor, 0.6, 0.05);
  const toothMat = getMaterial('raptor_teeth', 0xffffff, 0.2, 0.1);
  const eyeMat = getMaterial(`raptor_eye_${isEnraged}`, isEnraged ? 0xff0000 : 0xf59e0b, 0.1, 0.9);

  // 1. Sleek Dinosaur Body
  const bodyGeo = new THREE.ConeGeometry(0.42, 1.2, 8);
  bodyGeo.rotateZ(Math.PI * 0.5);
  const torso = new THREE.Mesh(bodyGeo, raptorSkinMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  root.add(torso);

  // Underbelly
  const bellyGeo = new THREE.BoxGeometry(0.85, 0.25, 0.38);
  const bellyMesh = new THREE.Mesh(bellyGeo, bellyMat);
  bellyMesh.position.set(-0.1, -0.15, 0);
  torso.add(bellyMesh);

  // 2. Head with toothy snout & yellow/red slit eye
  const headGroup = new THREE.Group();
  headGroup.position.set(0.65, 0.25, 0);
  torso.add(headGroup);

  const skullGeo = new THREE.BoxGeometry(0.55, 0.32, 0.32);
  const skullMesh = new THREE.Mesh(skullGeo, raptorSkinMat);
  skullMesh.position.x = 0.2;
  skullMesh.castShadow = true;
  headGroup.add(skullMesh);

  const snoutGeo = new THREE.BoxGeometry(0.45, 0.2, 0.24);
  const snoutMesh = new THREE.Mesh(snoutGeo, raptorSkinMat);
  snoutMesh.position.set(0.65, -0.04, 0);
  headGroup.add(snoutMesh);

  // Teeth
  const teethGeo = new THREE.BoxGeometry(0.38, 0.05, 0.22);
  const teethMesh = new THREE.Mesh(teethGeo, toothMat);
  teethMesh.position.set(0.65, -0.14, 0);
  headGroup.add(teethMesh);

  // Glowing Eye
  const eyeGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(0.3, 0.08, 0.18);
  headGroup.add(leftEye);
  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.3, 0.08, -0.18);
  headGroup.add(rightEye);

  // 3. Whip Tail
  const tailGroup = new THREE.Group();
  tailGroup.position.set(-0.6, 0.05, 0);
  torso.add(tailGroup);

  const tailGeo = new THREE.ConeGeometry(0.2, 1.4, 6);
  tailGeo.rotateZ(-Math.PI * 0.5);
  const tailMesh = new THREE.Mesh(tailGeo, raptorSkinMat);
  tailMesh.position.x = -0.7;
  tailMesh.castShadow = true;
  tailGroup.add(tailMesh);

  // 4. Raptor Forearms / Grasping Claws
  const clawArmGeo = new THREE.BoxGeometry(0.35, 0.08, 0.08);
  const leftArm = new THREE.Group();
  leftArm.position.set(0.35, -0.15, 0.22);
  torso.add(leftArm);
  const leftClaw = new THREE.Mesh(clawArmGeo, raptorSkinMat);
  leftClaw.position.x = 0.15;
  leftArm.add(leftClaw);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, -0.15, -0.22);
  torso.add(rightArm);
  const rightClaw = new THREE.Mesh(clawArmGeo, raptorSkinMat);
  rightClaw.position.x = 0.15;
  rightArm.add(rightClaw);

  // 5. Powerful Hind Legs with Sickle Claw
  const thighGeo = new THREE.BoxGeometry(0.22, 0.55, 0.2);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.15, -0.3, 0.24);
  torso.add(leftLeg);
  const leftLegMesh = new THREE.Mesh(thighGeo, raptorSkinMat);
  leftLegMesh.position.y = -0.28;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  // Sickle toe claw
  const clawGeo = new THREE.ConeGeometry(0.06, 0.22, 4);
  clawGeo.rotateX(Math.PI * 0.5);
  const clawMesh = new THREE.Mesh(clawGeo, getMaterial('talon', 0x1e293b, 0.3, 0.6));
  clawMesh.position.set(0.12, -0.55, 0);
  leftLeg.add(clawMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(-0.15, -0.3, -0.24);
  torso.add(rightLeg);
  const rightLegMesh = new THREE.Mesh(thighGeo, raptorSkinMat);
  rightLegMesh.position.y = -0.28;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const rightClawMesh = clawMesh.clone();
  rightLeg.add(rightClawMesh);

  const weaponSlot = new THREE.Group();

  const updatePose = (pose: string, progress: number, facing: number) => {
    root.rotation.y = facing >= 0 ? 0 : Math.PI;
    root.position.set(0, 0, 0);
    root.rotation.z = 0;

    // Tail swishing
    tailGroup.rotation.y = Math.sin(Date.now() / 150) * 0.35;

    if (pose === 'walk' || pose === 'dash') {
      const step = Math.sin(progress * Math.PI * 3);
      leftLeg.rotation.z = step * 0.6;
      rightLeg.rotation.z = -step * 0.6;
      headGroup.rotation.z = Math.sin(progress * Math.PI * 3) * 0.15;
    } else if (pose === 'attack') {
      headGroup.rotation.z = -0.4;
      tailGroup.rotation.y = 0.8;
      torso.position.y = 1.1;
    } else if (pose === 'knockdown') {
      root.rotation.z = Math.PI * 0.5;
      root.position.y = -0.5;
    } else {
      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      headGroup.rotation.z = 0;
    }
  };

  return {
    group,
    root,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponSlot,
    shadow,
    enemyType: 'raptor',
    updatePose,
  };
}

/**
 * Creates 3D Boss Vice Terhune Model (with blonde spiky hair, fur mantle, purple armor, revolvers)
 */
export function create3DBoss(): RiggedCharacterModel {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  shadow.scale.set(1.2, 1, 0.8);
  group.add(shadow);

  const armorMat = getMaterial('vice_armor', 0x7c3aed, 0.45, 0.2);
  const pantsMat = getMaterial('vice_pants', 0xa78bfa, 0.6, 0.1);
  const furMat = getMaterial('vice_fur', 0x0f172a, 0.9, 0.05);
  const hairMat = getMaterial('vice_hair', 0xfacc15, 0.4, 0.2);
  const skinMat = getMaterial('vice_skin', 0xfed7aa, 0.7, 0.05);
  const gunMat = getMaterial('vice_revolver', 0x475569, 0.25, 0.8);

  // 1. Torso & Fur Mantle
  const torsoGeo = new THREE.BoxGeometry(0.68, 0.8, 0.4);
  const torso = new THREE.Mesh(torsoGeo, armorMat);
  torso.position.y = 1.25;
  torso.castShadow = true;
  root.add(torso);

  // Fur mantle on shoulders
  const furGeo = new THREE.SphereGeometry(0.24, 8, 8);
  const leftFur = new THREE.Mesh(furGeo, furMat);
  leftFur.position.set(-0.36, 0.35, 0);
  torso.add(leftFur);
  const rightFur = new THREE.Mesh(furGeo, furMat);
  rightFur.position.set(0.36, 0.35, 0);
  torso.add(rightFur);

  // 2. Head & Spiky Blonde Hair
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.65, 0);
  torso.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.32, 0.35, 0.32);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Spikes
  for (let i = -2; i <= 2; i++) {
    const spikeGeo = new THREE.ConeGeometry(0.08, 0.3, 4);
    const spikeMesh = new THREE.Mesh(spikeGeo, hairMat);
    spikeMesh.position.set(i * 0.07, 0.25, 0);
    spikeMesh.rotation.z = -i * 0.15;
    headGroup.add(spikeMesh);
  }

  // 3. Arms & Twin Revolvers
  const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 0.28, 0);
  torso.add(leftArm);
  const leftArmMesh = new THREE.Mesh(armGeo, armorMat);
  leftArmMesh.position.y = -0.32;
  leftArm.add(leftArmMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 0.28, 0);
  torso.add(rightArm);
  const rightArmMesh = new THREE.Mesh(armGeo, armorMat);
  rightArmMesh.position.y = -0.32;
  rightArm.add(rightArmMesh);

  // Revolvers in hand
  const revolverGeo = new THREE.BoxGeometry(0.08, 0.14, 0.3);
  const rightGun = new THREE.Mesh(revolverGeo, gunMat);
  rightGun.position.set(0, -0.65, 0.12);
  rightArm.add(rightGun);

  // 4. Legs
  const legGeo = new THREE.BoxGeometry(0.2, 0.75, 0.2);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.18, -0.4, 0);
  torso.add(leftLeg);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.38;
  leftLegMesh.castShadow = true;
  leftLeg.add(leftLegMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.18, -0.4, 0);
  torso.add(rightLeg);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.38;
  rightLegMesh.castShadow = true;
  rightLeg.add(rightLegMesh);

  const weaponSlot = new THREE.Group();

  const updatePose = (pose: string, progress: number, facing: number) => {
    root.rotation.y = facing >= 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    root.position.set(0, 0, 0);
    root.rotation.z = 0;

    if (pose === 'walk' || pose === 'dash') {
      const step = Math.sin(progress * Math.PI * 2);
      leftLeg.rotation.x = step * 0.6;
      rightLeg.rotation.x = -step * 0.6;
    } else if (pose === 'attack' || pose === 'shoot') {
      rightArm.rotation.x = -Math.PI * 0.5;
    } else if (pose === 'knockdown') {
      root.rotation.z = Math.PI * 0.5;
      root.position.y = -0.8;
    } else {
      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      rightArm.rotation.x = 0;
    }
  };

  return {
    group,
    root,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponSlot,
    shadow,
    enemyType: 'vice_boss',
    updatePose,
  };
}

/**
 * Creates 3D Standard Poacher / Thug
 */
export function create3DPoacher(): RiggedCharacterModel {
  const group = new THREE.Group();
  const root = new THREE.Group();
  group.add(root);

  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.02;
  shadow.scale.set(1.0, 1, 0.7);
  group.add(shadow);

  const skinMat = getMaterial('poacher_skin', 0xfcd34d, 0.7, 0.05);
  const vestMat = getMaterial('poacher_vest', 0x475569, 0.65, 0.1);
  const pantsMat = getMaterial('poacher_pants', 0x2563eb, 0.7, 0.05);
  const bandMat = getMaterial('poacher_band', 0xef4444, 0.4, 0.1);

  const torsoGeo = new THREE.BoxGeometry(0.5, 0.68, 0.32);
  const torso = new THREE.Mesh(torsoGeo, vestMat);
  torso.position.y = 1.1;
  torso.castShadow = true;
  root.add(torso);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.55, 0);
  torso.add(headGroup);

  const headGeo = new THREE.BoxGeometry(0.28, 0.3, 0.28);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headGroup.add(headMesh);

  // Red Headband
  const bandGeo = new THREE.BoxGeometry(0.3, 0.08, 0.3);
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.position.y = 0.08;
  headGroup.add(bandMesh);

  const armGeo = new THREE.BoxGeometry(0.15, 0.55, 0.15);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.32, 0.22, 0);
  torso.add(leftArm);
  const leftArmMesh = new THREE.Mesh(armGeo, skinMat);
  leftArmMesh.position.y = -0.28;
  leftArm.add(leftArmMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.32, 0.22, 0);
  torso.add(rightArm);
  const rightArmMesh = new THREE.Mesh(armGeo, skinMat);
  rightArmMesh.position.y = -0.28;
  rightArm.add(rightArmMesh);

  const legGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, -0.34, 0);
  torso.add(leftLeg);
  const leftLegMesh = new THREE.Mesh(legGeo, pantsMat);
  leftLegMesh.position.y = -0.32;
  leftLeg.add(leftLegMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, -0.34, 0);
  torso.add(rightLeg);
  const rightLegMesh = new THREE.Mesh(legGeo, pantsMat);
  rightLegMesh.position.y = -0.32;
  rightLeg.add(rightLegMesh);

  const weaponSlot = new THREE.Group();

  const updatePose = (pose: string, progress: number, facing: number) => {
    root.rotation.y = facing >= 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    root.position.set(0, 0, 0);
    root.rotation.z = 0;

    if (pose === 'walk') {
      const step = Math.sin(progress * Math.PI * 2);
      leftLeg.rotation.x = step * 0.5;
      rightLeg.rotation.x = -step * 0.5;
    } else if (pose === 'attack') {
      rightArm.rotation.x = -Math.PI * 0.45;
    } else if (pose === 'knockdown') {
      root.rotation.z = Math.PI * 0.5;
      root.position.y = -0.7;
    } else {
      leftLeg.rotation.set(0, 0, 0);
      rightLeg.rotation.set(0, 0, 0);
      rightArm.rotation.x = 0;
    }
  };

  return {
    group,
    root,
    torso,
    head: headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponSlot,
    shadow,
    enemyType: 'poacher',
    updatePose,
  };
}
