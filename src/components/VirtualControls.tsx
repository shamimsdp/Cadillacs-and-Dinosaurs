/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { inputManager } from '../game/controls';

interface VirtualControlsProps {
  onInsertCoin: () => void;
  onStart: () => void;
  onExit: () => void;
  onOption: () => void;
  visible?: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onInsertCoin,
  onStart,
  onExit,
  onOption,
  visible = true,
}) => {
  const stickBaseRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Handle D-pad stick movement
  const handleStickMove = useCallback((clientX: number, clientY: number) => {
    if (!stickBaseRef.current) return;
    const rect = stickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const maxRadius = rect.width * 0.42;

    const distance = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(rawDy, rawDx);

    const nx = Math.cos(angle) * (clampedDist / maxRadius);
    const ny = Math.sin(angle) * (clampedDist / maxRadius);

    setStickPos({
      x: Math.cos(angle) * clampedDist,
      y: Math.sin(angle) * clampedDist,
    });

    inputManager.setVirtualDirection(nx, ny);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleStickMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleStickMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setStickPos({ x: 0, y: 0 });
    inputManager.resetVirtualDirection();
  };

  // Mouse fallback for joystick dragging
  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setStickPos({ x: 0, y: 0 });
        inputManager.resetVirtualDirection();
      }
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3">
      {/* Top Bar Header Buttons (Matching user screenshots: EXIT, COINS, OPTION, START) */}
      <div className="flex justify-between items-center w-full px-2">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onExit}
            className="px-3 py-1 bg-gradient-to-b from-zinc-200 to-zinc-400 text-zinc-900 font-black text-xs rounded-sm border-2 border-zinc-600 shadow-md hover:brightness-110 active:scale-95 transition-transform"
          >
            EXIT
          </button>
          <button
            onClick={onInsertCoin}
            className="px-3 py-1 bg-gradient-to-b from-zinc-200 to-zinc-400 text-zinc-900 font-black text-xs rounded-sm border-2 border-zinc-600 shadow-md hover:brightness-110 active:scale-95 transition-transform flex items-center gap-1"
          >
            COINS
          </button>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOption}
            className="px-3 py-1 bg-gradient-to-b from-zinc-200 to-zinc-400 text-zinc-900 font-black text-xs rounded-sm border-2 border-zinc-600 shadow-md hover:brightness-110 active:scale-95 transition-transform"
          >
            OPTION
          </button>
          <button
            onClick={onStart}
            className="px-3 py-1 bg-gradient-to-b from-amber-300 to-amber-500 text-zinc-950 font-black text-xs rounded-sm border-2 border-amber-600 shadow-md hover:brightness-110 active:scale-95 transition-transform"
          >
            START
          </button>
        </div>
      </div>

      {/* Bottom Controls: D-Pad Joystick & Action Buttons A, B, C */}
      <div className="flex justify-between items-end w-full pb-2 px-2">
        {/* Joystick Base (Matching screenshots: double circle rim with red round knob) */}
        <div
          ref={stickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleStickMove(e.clientX, e.clientY);
          }}
          onMouseMove={(e) => {
            if (isDragging) handleStickMove(e.clientX, e.clientY);
          }}
          className="w-32 h-32 rounded-full border-4 border-zinc-400/80 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center relative pointer-events-auto shadow-2xl touch-none cursor-grab active:cursor-grabbing"
        >
          {/* Inner ring */}
          <div className="w-24 h-24 rounded-full border border-zinc-400/40 pointer-events-none" />

          {/* Red Thumb Knob */}
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-2 border-red-300 shadow-[0_4px_12px_rgba(220,38,38,0.7)] absolute pointer-events-none transition-transform duration-75"
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          >
            {/* Top highlight */}
            <div className="w-10 h-6 rounded-full bg-red-400/50 mx-auto mt-1 blur-[1px]" />
          </div>
        </div>

        {/* Action Buttons: A (Blue), B (Green), C (Magenta) exactly as in screenshots */}
        <div className="relative w-44 h-40 pointer-events-auto">
          {/* C Button: Top Right (Magenta / Purple) - Special */}
          <button
            onMouseDown={() => inputManager.setVirtualButton('special', true)}
            onMouseUp={() => inputManager.setVirtualButton('special', false)}
            onTouchStart={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('special', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('special', false);
            }}
            className="absolute top-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-800 border-3 border-fuchsia-200 shadow-[0_4px_14px_rgba(192,38,211,0.6)] flex items-center justify-center font-black text-2xl text-white active:scale-90 transition-transform cursor-pointer"
          >
            C
          </button>

          {/* B Button: Bottom Right (Green) - Jump */}
          <button
            onMouseDown={() => inputManager.setVirtualButton('jump', true)}
            onMouseUp={() => inputManager.setVirtualButton('jump', false)}
            onTouchStart={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('jump', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('jump', false);
            }}
            className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-700 border-3 border-green-200 shadow-[0_4px_14px_rgba(34,197,94,0.6)] flex items-center justify-center font-black text-2xl text-white active:scale-90 transition-transform cursor-pointer"
          >
            B
          </button>

          {/* A Button: Bottom Left (Blue) - Attack / Pick Up */}
          <button
            onMouseDown={() => inputManager.setVirtualButton('attack', true)}
            onMouseUp={() => inputManager.setVirtualButton('attack', false)}
            onTouchStart={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('attack', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              inputManager.setVirtualButton('attack', false);
            }}
            className="absolute bottom-2 left-2 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-800 border-3 border-blue-200 shadow-[0_4px_14px_rgba(59,130,246,0.6)] flex items-center justify-center font-black text-2xl text-white active:scale-90 transition-transform cursor-pointer"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
};
