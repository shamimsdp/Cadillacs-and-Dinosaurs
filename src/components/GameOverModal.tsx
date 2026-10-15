/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { arcadeAudio } from '../game/audio';

interface GameOverModalProps {
  engine: GameEngine;
  credits: number;
  onContinue: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onInsertCoin: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  engine,
  credits,
  onContinue,
  onRestart,
  onTitle,
  onInsertCoin,
}) => {
  const isVictory = engine.isVictory;
  const isGameOver = engine.isGameOver;
  const [continueTimer, setContinueTimer] = useState<number>(9);

  useEffect(() => {
    if (isGameOver && !isVictory) {
      const interval = setInterval(() => {
        setContinueTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          arcadeAudio.playPunch(false);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isGameOver, isVictory]);

  if (!isGameOver && !isVictory) return null;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="max-w-md w-full bg-zinc-950 border-3 border-amber-500 p-6 rounded-md shadow-[0_0_35px_rgba(234,179,8,0.5)] flex flex-col items-center text-center">
        {isVictory ? (
          /* Victory Screen */
          <>
            <div className="text-yellow-400 text-sm font-bold tracking-widest uppercase mb-1">
              STAGE 1 CLEAR !
            </div>
            <h2 className="text-3xl font-black text-amber-400 tracking-wider mb-4 drop-shadow font-sans">
              VICE TERHUNE DEFEATED
            </h2>

            <div className="text-zinc-300 text-xs font-sans mb-6 leading-relaxed">
              You freed the captive velociraptors and halted the poacher operation across the ruined city! The Cadillac is revved up and roaring into the wild!
            </div>

            {/* Score & Stats Breakdown */}
            <div className="w-full bg-black/70 border border-zinc-800 p-3 rounded-sm mb-6 flex flex-col gap-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">FINAL SCORE</span>
                <span className="text-yellow-400 font-bold text-sm tabular-nums">
                  {engine.player.score.toString().padStart(6, '0')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">ENEMIES DEFEATED</span>
                <span className="text-white font-bold tabular-nums">{engine.player.kills}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">DINOS PACIFIED</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {engine.player.dinosPacified}
                </span>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={onRestart}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-sm rounded-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={onTitle}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-sm hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                TITLE MENU
              </button>
            </div>
          </>
        ) : (
          /* Arcade Game Over & Continue Countdown */
          <>
            <div className="text-red-500 text-sm font-bold tracking-widest uppercase mb-1">
              GAME OVER
            </div>

            {continueTimer > 0 ? (
              <>
                <h2 className="text-2xl font-black text-yellow-400 tracking-wider mb-2 font-sans">
                  CONTINUE ?
                </h2>
                {/* Big Giant Retro Arcade Digit */}
                <div className="text-7xl font-black text-amber-500 my-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                  {continueTimer}
                </div>

                <div className="text-xs text-zinc-400 mb-6">
                  {credits > 0 ? (
                    <span className="text-emerald-400 font-bold">1 CREDIT WILL BE USED</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">INSERT COIN TO CONTINUE</span>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {credits > 0 ? (
                    <button
                      onClick={onContinue}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-base rounded-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      PRESS START (CONTINUE)
                    </button>
                  ) : (
                    <button
                      onClick={onInsertCoin}
                      className="w-full py-3 bg-yellow-400 text-black font-black text-base rounded-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                    >
                      INSERT COIN
                    </button>
                  )}

                  <button
                    onClick={onTitle}
                    className="w-full py-2 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-xs rounded-sm transition-colors cursor-pointer"
                  >
                    GIVE UP / TITLE
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black text-red-500 tracking-wider mb-4 font-sans">
                  TIME OVER
                </h2>
                <div className="text-xs text-zinc-400 mb-6">
                  FINAL SCORE: {engine.player.score.toString().padStart(6, '0')}
                </div>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={onRestart}
                    className="flex-1 py-3 bg-yellow-500 text-black font-extrabold text-sm rounded-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    TRY AGAIN
                  </button>
                  <button
                    onClick={onTitle}
                    className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-sm hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    TITLE MENU
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
