/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  create3DBoss,
  create3DHero,
  create3DPoacher,
  create3DRaptor,
  RiggedCharacterModel,
} from '../game/threeModels';
import { CharacterId } from '../game/types';

export type ViewableCharacterId =
  | CharacterId
  | 'raptor'
  | 'enraged_raptor'
  | 'vice_boss'
  | 'poacher';

interface ThreeCharacterViewerProps {
  charId: ViewableCharacterId;
  height?: number | string;
  autoRotate?: boolean;
  showPoseControls?: boolean;
  showDetailsBadge?: boolean;
  onSelectCharacter?: (id: ViewableCharacterId) => void;
}

export const ThreeCharacterViewer: React.FC<ThreeCharacterViewerProps> = ({
  charId,
  height = 360,
  autoRotate = true,
  showPoseControls = true,
  showDetailsBadge = true,
  onSelectCharacter,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePose, setActivePose] = useState<string>('idle');
  const [isSpinning, setIsSpinning] = useState<boolean>(autoRotate);
  const [cameraZoom, setCameraZoom] = useState<'close' | 'medium' | 'full'>('medium');

  // Mutable refs to prevent WebGL teardown/recreation during state updates
  const activePoseRef = useRef<string>(activePose);
  activePoseRef.current = activePose;

  const isSpinningRef = useRef<boolean>(isSpinning);
  isSpinningRef.current = isSpinning;

  const charIdRef = useRef<ViewableCharacterId>(charId);
  charIdRef.current = charId;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentModelRef = useRef<RiggedCharacterModel | null>(null);

  const rotationYRef = useRef<number>(0);
  const targetRotationYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  // Helper to instantiate the correct 3D model
  const instantiateModel = useCallback((id: ViewableCharacterId): RiggedCharacterModel => {
    if (id === 'raptor') {
      return create3DRaptor(false);
    } else if (id === 'enraged_raptor') {
      return create3DRaptor(true);
    } else if (id === 'vice_boss') {
      return create3DBoss();
    } else if (id === 'poacher') {
      return create3DPoacher();
    } else {
      return create3DHero(id as CharacterId);
    }
  }, []);

  // Initialize Three.js Scene ONCE on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = container.clientWidth || 400;
    const heightPx = typeof height === 'number' ? height : container.clientHeight || 360;

    const camera = new THREE.PerspectiveCamera(40, width / heightPx, 0.1, 50);
    camera.position.set(0, 1.4, 4.3);
    camera.lookAt(0, 1.05, 0);
    cameraRef.current = camera;

    // 2. High-performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Studio Lighting & RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
    keyLight.position.set(3, 4.5, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Amber Rim Light (Capcom CPS-1 classic arcade style)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    rimLight.position.set(0, 3.5, -3.5);
    scene.add(rimLight);

    // 4. Ground Turntable Disc with Neon Edge
    const discGeo = new THREE.CylinderGeometry(1.45, 1.55, 0.05, 36);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.85,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.025;
    disc.receiveShadow = true;
    scene.add(disc);

    const ringGeo = new THREE.RingGeometry(1.47, 1.54, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.005;
    scene.add(ring);

    // 5. Initial Character Model
    const model = instantiateModel(charIdRef.current);
    scene.add(model.group);
    currentModelRef.current = model;

    // 6. Interaction Listeners
    const domElement = renderer.domElement;

    const onPointerDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.clientX;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;
      targetRotationYRef.current += dx * 0.012;
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    domElement.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Touch
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        lastMouseXRef.current = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.touches[0].clientX;
      targetRotationYRef.current += dx * 0.012;
    };
    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };
    domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // 7. Render Loop with silky smooth damping
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Auto rotation
      if (isSpinningRef.current && !isDraggingRef.current) {
        targetRotationYRef.current += delta * 0.6;
      }

      // Exponential damping
      rotationYRef.current = THREE.MathUtils.damp(
        rotationYRef.current,
        targetRotationYRef.current,
        10,
        delta
      );

      if (currentModelRef.current) {
        currentModelRef.current.group.rotation.y = rotationYRef.current;
        currentModelRef.current.updatePose(activePoseRef.current, elapsed, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = typeof height === 'number' ? height : container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElement.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      sceneRef.current = null;
      rendererRef.current = null;
      currentModelRef.current = null;
    };
  }, [height, instantiateModel]);

  // Cleanly swap model when charId changes without recreating WebGL context
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (currentModelRef.current) {
      scene.remove(currentModelRef.current.group);
    }

    const nextModel = instantiateModel(charId);
    nextModel.group.rotation.y = rotationYRef.current;
    scene.add(nextModel.group);
    currentModelRef.current = nextModel;
  }, [charId, instantiateModel]);

  // Adjust camera zoom preset smoothly
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    if (cameraZoom === 'close') {
      camera.position.set(0, 1.42, 2.6);
    } else if (cameraZoom === 'medium') {
      camera.position.set(0, 1.35, 3.8);
    } else {
      camera.position.set(0, 1.45, 5.0);
    }
    camera.lookAt(0, 1.05, 0);
  }, [cameraZoom]);

  const poses = [
    { id: 'idle', label: 'Combat Guard' },
    { id: 'walk', label: 'Walk' },
    { id: 'dash', label: 'Sprint' },
    { id: 'punch', label: 'Punch' },
    { id: 'jumpKick', label: 'Flying Kick' },
    { id: 'special', label: 'Special' },
  ];

  return (
    <div className="relative w-full flex flex-col items-center select-none font-mono">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none relative rounded-md overflow-hidden bg-gradient-to-b from-zinc-900/40 via-black/80 to-zinc-950 border border-zinc-800 shadow-2xl"
        style={{ height }}
      >
        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2 pointer-events-none z-10">
          <div className="text-[10px] text-yellow-300 font-bold tracking-wider uppercase bg-black/80 px-2 py-0.5 rounded-xs border border-yellow-500/50 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            3D WEBGL ENGINE · THREE.JS
          </div>
          <div className="hidden sm:block text-[9px] text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded-xs border border-zinc-800">
            DRAG TO ROTATE 360°
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Zoom switcher */}
          <div className="flex bg-black/80 border border-zinc-700 rounded-xs overflow-hidden text-[9px]">
            <button
              onClick={() => setCameraZoom('close')}
              className={`px-1.5 py-0.5 cursor-pointer font-bold ${
                cameraZoom === 'close' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Close-up View"
            >
              1X
            </button>
            <button
              onClick={() => setCameraZoom('medium')}
              className={`px-1.5 py-0.5 cursor-pointer font-bold ${
                cameraZoom === 'medium' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Medium View"
            >
              2X
            </button>
            <button
              onClick={() => setCameraZoom('full')}
              className={`px-1.5 py-0.5 cursor-pointer font-bold ${
                cameraZoom === 'full' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Wide View"
            >
              3X
            </button>
          </div>

          {/* Auto spin button */}
          <button
            onClick={() => setIsSpinning((prev) => !prev)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-xs border transition-colors cursor-pointer ${
              isSpinning
                ? 'bg-amber-500/25 text-yellow-300 border-amber-500/80 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                : 'bg-zinc-900/90 text-zinc-400 border-zinc-700 hover:text-white'
            }`}
          >
            {isSpinning ? 'SPIN: ON' : 'SPIN: OFF'}
          </button>
        </div>

        {/* Optional Character Quick-Picker Tabs inside 3D viewer */}
        {onSelectCharacter && (
          <div className="absolute bottom-12 left-2 right-2 flex justify-center gap-1 z-10 overflow-x-auto py-1">
            {[
              { id: 'mustapha', label: 'MUSTAPHA' },
              { id: 'jack', label: 'JACK' },
              { id: 'hannah', label: 'HANNAH' },
              { id: 'mess', label: 'MESS' },
              { id: 'raptor', label: 'RAPTOR' },
              { id: 'enraged_raptor', label: 'RAGE DINO' },
              { id: 'vice_boss', label: 'VICE (BOSS)' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCharacter(c.id as ViewableCharacterId)}
                className={`text-[9px] px-2 py-0.5 rounded-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                  charId === c.id
                    ? 'bg-yellow-400 text-black border-yellow-200 shadow-sm scale-105'
                    : 'bg-black/70 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Pose Switcher Dock */}
      {showPoseControls && (
        <div className="w-full flex items-center justify-between gap-1 p-1.5 bg-black/90 border border-zinc-800 rounded-b-md mt-1 z-10 overflow-x-auto">
          <div className="text-[10px] text-amber-400 font-bold px-1 hidden md:block whitespace-nowrap">
            3D ACTION POSE:
          </div>
          <div className="flex items-center gap-1 flex-1 justify-center md:justify-end">
            {poses.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePose(p.id)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-xs transition-all cursor-pointer whitespace-nowrap ${
                  activePose === p.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)] scale-105'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
