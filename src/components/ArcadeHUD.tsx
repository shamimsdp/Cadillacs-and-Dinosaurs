/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CHARACTERS } from '../game/characters';
import { GameEngine } from '../game/engine';
import { HeroPortrait } from './HeroPortrait';

interface ArcadeHUDProps {
  engine: GameEngine;
  credits: number;
  highScore: number;
  crtFilter: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleCrt: () => void;
  onPause: () => void;
  onOpen3DViewer?: () => void;
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
  onOpen3DViewer,
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
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between p-2.5 sm:p-3 font-mono">
      {/* Top Bar Row */}
      <div className="flex items-start justify-between w-full">
        {/* Player 1 Cluster */}
        <div className="flex items-center gap-2.5 bg-black/75 backdrop-blur-xs border-2 border-amber-500/80 p-2 rounded-sm shadow-xl pointer-events-auto">
          {/* Character 3D-styled Vector Avatar Box */}
          <div className="relative">
            <HeroPortrait charId={player.charId} size={48} className="rounded-xs border-amber-400" />
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[9px] px-1 font-black rounded-xs shadow-xs">
              1P
            </div>
          </div>

          {/* Player Name, Life Bar & Score */}
          <div className="flex flex-col gap-1 min-w-[140px] sm:min-w-[170px]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-yellow-300 tracking-wider uppercase font-sans">
                {char.name.split(' ')[0]}
              </span>
              <span className="text-zinc-200 text-[11px] tabular-nums font-bold">
                {player.score.toString().padStart(6, '0')}
              </span>
            </div>

            {/* Health Bar (Classic Capcom yellow/orange/red gauge) */}
            <div className="w-full h-3.5 sm:h-4 bg-zinc-950 border border-amber-600/70 relative p-0.5 rounded-xs overflow-hidden">
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
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-300">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold">LIVES</span>
                <span className="text-white font-extrabold tabular-nums">x{player.lives}</span>
              </div>
              {player.heldWeapon ? (
                <div className="flex items-center gap-1.5 text-yellow-300 font-bold bg-amber-950/70 px-1.5 py-0.2 border border-amber-500/50 rounded-xs">
                  <span className="uppercase text-[9px] tracking-wide">{player.heldWeapon.type}</span>
                  <span className="text-white tabular-nums">[{player.heldWeapon.ammo}]</span>
                </div>
              ) : (
                <span className="text-zinc-400 text-[9px]">FISTS READY</span>
              )}
            </div>
          </div>
        </div>

        {/* Center Target Enemy Health Bar (if active) */}
        {targetEnemy && targetEnemy.hp > 0 && (
          <div className="flex items-center gap-2 bg-black/80 border-2 border-red-500/80 px-3 py-1.5 rounded-sm shadow-xl animate-fade-in pointer-events-none min-w-[200px] sm:min-w-[240px]">
            {/* Enemy Portrait if boss or raptor */}
            {(targetEnemy.enemyType === 'vice_boss' || targetEnemy.enemyType === 'raptor') && (
              <HeroPortrait
                charId={targetEnemy.enemyType === 'vice_boss' ? 'vice_boss' : targetEnemy.enraged ? 'enraged_raptor' : 'raptor'}
                size={34}
                className="rounded-xs border-red-500"
              />
            )}
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-bold text-red-400 uppercase tracking-widest">
                <span>{targetEnemy.name}</span>
                <span className="text-zinc-300 tabular-nums">{targetEnemy.hp} HP</span>
              </div>
              <div className="w-full h-3 bg-zinc-950 border border-red-800/80 p-0.5 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 transition-all duration-75"
                  style={{ width: `${enemyHpPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Top Right: High Score, Credits & Cabinet Buttons */}
        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="bg-black/75 border border-zinc-700 px-2.5 py-0.5 rounded-sm text-right">
            <div className="text-[9px] text-zinc-400 tracking-wider">HI-SCORE</div>
            <div className="text-xs font-bold text-amber-300 tabular-nums">
              {highScore.toString().padStart(6, '0')}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-yellow-400 font-bold bg-black/70 px-1.5 py-0.5 border border-yellow-600/40 rounded-xs">
              CREDIT {credits.toString().padStart(2, '0')}
            </span>

            {/* 3D Hero View Toggle */}
            {onOpen3DViewer && (
              <button
                onClick={onOpen3DViewer}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/60 rounded-xs text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                title="Inspect 3D Characters"
              >
                <span>🌐</span> 3D HERO
              </button>
            )}

            {/* Quick Action Buttons */}
            <button
              onClick={onToggleMute}
              className="px-1.5 py-0.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xs text-[10px] font-bold transition-colors cursor-pointer"
              title="Toggle Audio"
            >
              {isMuted ? 'MUTE' : 'AUDIO'}
            </button>
            <button
              onClick={onToggleCrt}
              className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold transition-colors cursor-pointer border ${
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
              className="px-2 py-0.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xs text-[10px] font-bold transition-colors cursor-pointer"
            >
              PAUSE
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Hit Combo Counter */}
      {engine.hitCombo >= 2 && (
        <div
          key={engine.hitCombo}
          className="absolute top-24 right-4 flex flex-col items-end pointer-events-none z-20 animate-fade-in"
        >
          {/* Main Combo Cluster with Capcom arcade styling */}
          <div className="bg-black/85 backdrop-blur-xs border-2 border-yellow-400 rounded-sm p-2 px-3 shadow-[0_0_20px_rgba(250,204,21,0.5)] flex flex-col items-end text-right">
            {/* Tier label badge */}
            <div
              className="text-[9px] tracking-widest font-black uppercase mb-0.5 px-1.5 py-0.5 rounded-xs border text-white drop-shadow"
              style={{
                backgroundColor:
                  engine.hitCombo >= 15
                    ? '#7C3AED'
                    : engine.hitCombo >= 10
                    ? '#DC2626'
                    : engine.hitCombo >= 6
                    ? '#EA580C'
                    : engine.hitCombo >= 4
                    ? '#CA8A04'
                    : '#15803D',
                borderColor:
                  engine.hitCombo >= 15
                    ? '#C084FC'
                    : engine.hitCombo >= 10
                    ? '#F87171'
                    : engine.hitCombo >= 6
                    ? '#FB923C'
                    : '#FDE047',
              }}
            >
              {engine.hitCombo >= 15
                ? 'DINOSAUR EXTINCTION!'
                : engine.hitCombo >= 10
                ? 'RAMPAGE STRIKE!'
                : engine.hitCombo >= 6
                ? 'COMBO MASTER!'
                : engine.hitCombo >= 4
                ? 'SUPER CHAIN!'
                : 'HIT COMBO!'}
            </div>

            {/* Hit Count Row with Big Teko Arcade Digits */}
            <div className="flex items-baseline gap-1 font-sans">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)] tracking-tight">
                {engine.hitCombo}
              </span>
              <span className="text-sm sm:text-base font-black text-yellow-200 tracking-wider">
                HITS
              </span>
            </div>

            {/* Total Damage and Combo Timer Decay Bar */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-zinc-300 font-bold tabular-nums">
                +{engine.hitComboTotalDamage} DMG
              </span>
              <div className="w-16 h-1.5 bg-zinc-900 border border-zinc-700 rounded-xs overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-75"
                  style={{
                    width: `${Math.max(0, Math.min(100, (engine.hitComboTimer / 2.0) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flashing "GO! ->" Wave Prompt */}
      {engine.goPromptTimer > 0 && (
        <div className="self-center mb-8 pointer-events-none animate-pulse">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-6 py-2 rounded-sm border-2 border-yellow-200 shadow-[0_0_25px_rgba(234,179,8,0.8)] font-black text-2xl tracking-widest drop-shadow font-sans">
            <span>GO !</span>
            <span className="text-3xl animate-bounce">➔</span>
          </div>
        </div>
      )}

      {/* Bottom Spacer for on-screen touch controls */}
      <div className="h-24 sm:h-20 pointer-events-none" />
    </div>
  );
};
