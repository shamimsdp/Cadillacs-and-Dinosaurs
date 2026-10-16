/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { backgroundRenderer } from '../game/background';
import { inputManager } from '../game/controls';
import { GameEngine } from '../game/engine';
import { spriteRenderer } from '../game/sprites';

interface ArcadeCanvasProps {
  engine: GameEngine;
  crtFilter: boolean;
  onStateChange?: () => void;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({
  engine,
  crtFilter,
  onStateChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const stateUpdateCounterRef = useRef<number>(0);
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution: 800x480 standard 16:9 arcade view
    canvas.width = 800;
    canvas.height = 480;

    let isRunning = true;

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const rawDt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;
      // Clamp frame delta time between 1ms and 50ms to prevent hanging on tab-switches or 0-deltas
      const dt = Math.max(0.001, Math.min(isNaN(rawDt) ? 0.016 : rawDt, 0.05));

      // Poll inputs
      const input = inputManager.poll();

      // Update simulation
      engine.update(dt, input);

      // Render Frame
      ctx.save();

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply screen shake
      if (engine.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * engine.screenShake * 1.5;
        const shakeY = (Math.random() - 0.5) * engine.screenShake * 1.5;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Parallax Background
      backgroundRenderer.draw(ctx, engine.cameraX, canvas.width, canvas.height);

      // 2. Depth Sort All World Entities (Player, Enemies, Props, Items) by Z
      type Sortable =
        | { type: 'player'; obj: typeof engine.player; z: number }
        | { type: 'enemy'; obj: (typeof engine.enemies)[0]; z: number }
        | { type: 'prop'; obj: (typeof engine.props)[0]; z: number }
        | { type: 'item'; obj: (typeof engine.items)[0]; z: number };

      const renderQueue: Sortable[] = [];

      renderQueue.push({ type: 'player', obj: engine.player, z: engine.player.z });

      engine.enemies.forEach((enemy) => {
        renderQueue.push({ type: 'enemy', obj: enemy, z: enemy.z });
      });

      engine.props.forEach((prop) => {
        renderQueue.push({ type: 'prop', obj: prop, z: prop.z });
      });

      engine.items.forEach((item) => {
        renderQueue.push({ type: 'item', obj: item, z: item.z });
      });

      // Sort by Z depth ascending so objects further away (smaller Z) are drawn first
      renderQueue.sort((a, b) => a.z - b.z);

      // Render in sorted order
      for (const item of renderQueue) {
        if (item.type === 'player') {
          spriteRenderer.drawPlayer(ctx, item.obj, engine.cameraX);
        } else if (item.type === 'enemy') {
          spriteRenderer.drawEnemy(ctx, item.obj, engine.cameraX);
        } else if (item.type === 'prop') {
          spriteRenderer.drawDestructible(ctx, item.obj, engine.cameraX);
        } else if (item.type === 'item') {
          spriteRenderer.drawItem(ctx, item.obj, engine.cameraX);
        }
      }

      // 3. Draw Projectiles (Bullets, pellets, thrown objects)
      for (const proj of engine.projectiles) {
        const screenX = proj.x - engine.cameraX;
        const screenY = proj.z - proj.y;
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.fillStyle = '#FDE047';
        ctx.strokeStyle = '#EA580C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 4. Draw Particles (Comic Text, Hitsparks, Dust, Shockwaves)
      for (const particle of engine.particles) {
        spriteRenderer.drawParticle(ctx, particle, engine.cameraX);
      }

      ctx.restore();

      // Periodically trigger light React state sync (every ~4 frames)
      stateUpdateCounterRef.current++;
      if (stateUpdateCounterRef.current % 4 === 0 && onStateChangeRef.current) {
        onStateChangeRef.current();
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [engine]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain image-rendering-pixelated shadow-2xl"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* CRT Scanline Shader Overlay */}
      {crtFilter && (
        <div
          className="absolute inset-0 pointer-events-none z-15"
          style={{
            background:
              'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))',
            backgroundSize: '100% 3px, 6px 100%',
          }}
        />
      )}
    </div>
  );
};
