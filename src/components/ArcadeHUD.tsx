/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CHARACTERS } from '../game/characters';
import { GameEngine } from '../game/engine';

interface ArcadeHUDProps {
  engine: GameEngine;
  credits: number;
  highScore: number;
  crtFilter: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleCrt: () => void;
  onPause: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  engine,
  credits,
  highScore,
  crtFilter,
  isMuted,
  onToggleMute,
  onToggleCrt,
  onPause,
}) => {
  const player = engine.player;
  const char = CHARACTERS[player.charId];
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));

  // Determine target enemy for the top bar (Boss priority, or highest HP enemy being fought)
  const targetEnemy =
    engine.targetBoss && engine.targetBoss.hp > 0
      ? engine.targetBoss
      : engine.enemies.find((e) => e.hp > 0 && e.hitstunTimer > 0) || engine.enemies[0];

  const enemyHpPercent = targetEnemy ? Math.max(0, Math.min(100, (targetEnemy.hp / targetEnemy.maxHp) * 100)) : 0;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-3 font-mono">
      {/* Top Bar Row */}
      <div className="flex items-start justify-between w-full">
        {/* Player 1 Cluster */}
        <div className="flex items-center gap-3 bg-black/65 backdrop-blur-xs border-2 border-amber-500/80 p-2 rounded-sm shadow-lg pointer-events-auto">
          {/* Character Avatar Box */}
          <div
            className="w-12 h-12 border-2 border-yellow-400 flex items-center justify-center font-bold text-lg text-black overflow-hidden relative shadow-inner"
            style={{ backgroundColor: char.portraitColor }}
          >
            <span className="text-xs uppercase tracking-tighter text-white drop-shadow font-extrabold">
              {char.id.substring(0, 3)}
            </span>
            <div className="absolute bottom-0 right-0 bg-black/80 text-[10px] text-amber-300 px-1 font-bold">
              1P
            </div>
          </div>

          {/* Player Name, Life Bar & Score */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-yellow-300 tracking-wider uppercase font-sans">
                {char.name.split(' ')[0]}
              </span>
              <span className="text-zinc-200 text-[11px] tabular-nums font-bold">
                SCORE: {player.score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Health Bar (Classic Capcom yellow/orange/red gauge) */}
            <div className="w-full h-4 bg-zinc-950 border border-amber-600/70 relative p-0.5 rounded-xs overflow-hidden">
              <div
                className="h-full transition-all duration-75"
                style={{
                  width: `${hpPercent}%`,
                  background:
                    hpPercent > 50
                      ? 'linear-gradient(180deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)'
                      : hpPercent > 25
                      ? 'linear-gradient(180deg, #F97316 0%, #EA580C 50%, #C2410C 100%)'
                      : 'linear-gradient(180deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                }}
              />
              {/* Segmented notches */}
              <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="border-r border-black/50 h-full" />
                ))}
              </div>
            </div>

            {/* Sub-status: Lives & Weapon */}
            <div className="flex items-center justify-between text-[11px] text-zinc-300">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold">REST</span>
                <span className="text-white font-extrabold tabular-nums">x{player.lives}</span>
              </div>
              {player.heldWeapon ? (
                <div className="flex items-center gap-1.5 text-yellow-300 font-bold bg-amber-950/60 px-1.5 py-0.5 border border-amber-500/50 rounded-xs">
                  <span className="uppercase text-[10px] tracking-wide">{player.heldWeapon.type}</span>
                  <span className="text-white tabular-nums">[{player.heldWeapon.ammo}]</span>
                </div>
              ) : (
                <span className="text-zinc-400 text-[10px]">FISTS READY</span>
              )}
            </div>
          </div>
        </div>

        {/* Center Target Enemy Health Bar (if active) */}
        {targetEnemy && targetEnemy.hp > 0 && (
          <div className="flex flex-col items-center bg-black/75 border border-red-500/80 px-4 py-1.5 rounded-sm shadow-md animate-fade-in pointer-events-none min-w-[200px]">
            <div className="flex items-center justify-between w-full text-[11px] font-bold text-red-400 uppercase tracking-widest mb-1">
              <span>{targetEnemy.name}</span>
              <span className="text-zinc-300 text-[10px] tabular-nums">{targetEnemy.hp} HP</span>
            </div>
            <div className="w-full h-3 bg-zinc-950 border border-red-800/80 p-0.5 rounded-xs overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-75"
                style={{ width: `${enemyHpPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Top Right: High Score, Credits & Cabinet Buttons */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="bg-black/65 border border-zinc-700 px-2.5 py-1 rounded-sm text-right">
            <div className="text-[10px] text-zinc-400 tracking-wider">HI-SCORE</div>
            <div className="text-xs font-bold text-amber-300 tabular-nums">
              {highScore.toString().padStart(6, '0')}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-yellow-400 font-bold bg-black/60 px-2 py-0.5 border border-yellow-600/40 rounded-xs">
              CREDIT {credits.toString().padStart(2, '0')}
            </span>

            {/* Quick Action Buttons */}
            <button
              onClick={onToggleMute}
              className="px-2 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xs text-[10px] font-bold transition-colors cursor-pointer"
              title="Toggle Audio"
            >
              {isMuted ? 'UNMUTE' : 'AUDIO'}
            </button>
            <button
              onClick={onToggleCrt}
              className={`px-2 py-1 rounded-xs text-[10px] font-bold transition-colors cursor-pointer border ${
                crtFilter
                  ? 'bg-amber-600 text-black border-amber-400'
                  : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="CRT Scanlines"
            >
              CRT
            </button>
            <button
              onClick={onPause}
              className="px-2 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xs text-[10px] font-bold transition-colors cursor-pointer"
            >
              PAUSE
            </button>
          </div>
        </div>
      </div>

      {/* Blinking Arcade "GO! ➔" prompt when section is cleared */}
      {engine.goPromptTimer > 0 && (
        <div className="self-center mb-16 flex items-center gap-3 bg-black/70 px-6 py-2 border-2 border-yellow-400 rounded-md animate-bounce pointer-events-none">
          <span className="text-3xl font-black text-yellow-300 tracking-widest drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]">
            GO !
          </span>
          <span className="text-3xl font-black text-amber-400 animate-pulse">➔➔</span>
        </div>
      )}

      {/* Bottom control hints (desktop only, discreet single line) */}
      <div className="hidden md:flex justify-between items-center text-[11px] text-zinc-400 bg-black/50 px-3 py-1 rounded-sm border border-zinc-800/80">
        <div>
          <span className="text-yellow-400 font-bold">MOVE:</span> WASD / Arrows ·{' '}
          <span className="text-yellow-400 font-bold">ATTACK/PICKUP:</span> J / Space ·{' '}
          <span className="text-yellow-400 font-bold">JUMP:</span> K ·{' '}
          <span className="text-yellow-400 font-bold">SPECIAL:</span> L / C (or J+K) ·{' '}
          <span className="text-yellow-400 font-bold">DASH:</span> Double-tap or Shift
        </div>
        <div className="text-zinc-500">CAPCOM 1993 · BELT-SCROLL 2.5D</div>
      </div>
    </div>
  );
};
