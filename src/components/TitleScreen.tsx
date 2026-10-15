/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CHARACTERS } from '../game/characters';
import { CharacterId } from '../game/types';
import { arcadeAudio } from '../game/audio';

interface TitleScreenProps {
  onStartGame: (selectedChar: CharacterId) => void;
  credits: number;
  onInsertCoin: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  credits,
  onInsertCoin,
  isMuted,
  onToggleMute,
}) => {
  const [selectedChar, setSelectedChar] = useState<CharacterId>('mustapha');
  const [showSelect, setShowSelect] = useState(false);

  const characterKeys: CharacterId[] = ['mustapha', 'jack', 'hannah', 'mess'];
  const char = CHARACTERS[selectedChar];

  const handleStart = () => {
    if (credits <= 0) {
      onInsertCoin();
    }
    if (!showSelect) {
      setShowSelect(true);
      arcadeAudio.playPunch(true);
    } else {
      arcadeAudio.playCoin();
      arcadeAudio.startBGM();
      onStartGame(selectedChar);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden bg-radial from-slate-900 via-zinc-950 to-black text-white font-mono">
      {/* Background Animated Prehistoric Sky & Silhouette */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header Strip */}
      <div className="w-full flex justify-between items-center z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-red-700 text-white font-bold px-2 py-0.5 rounded-xs tracking-wider">
            CAPCOM 1993
          </span>
          <span className="text-zinc-400">CPS-1 ARCADE CLONE</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-600 rounded-xs font-bold transition-colors cursor-pointer text-xs"
          >
            {isMuted ? 'UNMUTE AUDIO' : 'AUDIO ON'}
          </button>
          <button
            onClick={onInsertCoin}
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xs border-2 border-yellow-200 shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            + INSERT COIN
          </button>
          <span className="text-yellow-400 font-bold bg-black/80 px-2 py-1 border border-yellow-500/50 rounded-xs">
            CREDIT {credits.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {!showSelect ? (
        /* Title Logo & Main Title Showcase */
        <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-3xl">
          {/* Japanese Subtitle */}
          <div className="text-amber-400 text-sm tracking-[0.3em] font-bold mb-2 uppercase drop-shadow">
            キャディラックス 恐竜新世紀
          </div>

          {/* Bespoke Retro Arcade SVG Title Lockup */}
          <div className="relative mb-6">
            <svg
              viewBox="0 0 680 140"
              className="w-full max-w-[620px] drop-shadow-[0_8px_20px_rgba(234,179,8,0.4)]"
            >
              <defs>
                <linearGradient id="titleGold" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBEB" />
                  <stop offset="30%" stopColor="#FDE047" />
                  <stop offset="70%" stopColor="#EAB308" />
                  <stop offset="100%" stopColor="#854D0E" />
                </linearGradient>
                <linearGradient id="dinoRed" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FEE2E2" />
                  <stop offset="35%" stopColor="#EF4444" />
                  <stop offset="75%" stopColor="#B91C1C" />
                  <stop offset="100%" stopColor="#450A0A" />
                </linearGradient>
              </defs>

              {/* CADILLACS */}
              <text
                x="340"
                y="55"
                textAnchor="middle"
                fontSize="56"
                fontWeight="900"
                fontFamily="'Teko', 'Impact', sans-serif"
                letterSpacing="4"
                fill="url(#titleGold)"
                stroke="#000"
                strokeWidth="6"
                paintOrder="stroke fill"
              >
                CADILLACS
              </text>

              {/* & */}
              <text
                x="340"
                y="85"
                textAnchor="middle"
                fontSize="28"
                fontWeight="900"
                fontFamily="'Teko', sans-serif"
                fill="#FEF08A"
                stroke="#000"
                strokeWidth="4"
              >
                AND
              </text>

              {/* DINOSAURS */}
              <text
                x="340"
                y="130"
                textAnchor="middle"
                fontSize="62"
                fontWeight="900"
                fontFamily="'Teko', 'Impact', sans-serif"
                letterSpacing="5"
                fill="url(#dinoRed)"
                stroke="#000"
                strokeWidth="7"
                paintOrder="stroke fill"
              >
                DINOSAURS
              </text>
            </svg>
          </div>

          <div className="text-zinc-300 text-sm max-w-lg mb-8 leading-relaxed font-sans">
            Post-apocalyptic 26th Century Earth. Savage poachers are hunting dinosaurs across the ruins of New York. Join Jack Tenrec and his crew in their 1953 Cadillac to restore order!
          </div>

          {/* Primary Start CTA Button */}
          <button
            onClick={handleStart}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-lg tracking-wider rounded-md border-2 border-yellow-200 shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            {credits > 0 ? 'PRESS TO SELECT HERO' : 'INSERT COIN / START'}
          </button>

          <div className="text-xs text-yellow-300/80 mt-4 tracking-widest font-mono">
            PRESS [ENTER] OR [SPACE] TO PLAY
          </div>
        </div>
      ) : (
        /* Character Select Screen */
        <div className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-4xl">
          <h2 className="text-2xl font-black text-yellow-400 tracking-widest mb-6 uppercase text-center drop-shadow">
            PLAYER SELECT
          </h2>

          {/* 4 Characters Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-6">
            {characterKeys.map((cKey) => {
              const c = CHARACTERS[cKey];
              const isSelected = selectedChar === cKey;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChar(cKey);
                    arcadeAudio.playPunch(false);
                  }}
                  className={`flex flex-col items-center p-3 rounded-md border-2 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'border-yellow-400 bg-amber-950/50 shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-105'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/60'
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-sm border-2 border-black flex items-center justify-center font-extrabold text-2xl text-black mb-2 shadow"
                    style={{ backgroundColor: c.portraitColor }}
                  >
                    {c.id.substring(0, 3).toUpperCase()}
                  </div>
                  <div className="font-bold text-sm text-yellow-300 font-sans">{c.name}</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-1">{c.title}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Character Profile & Stat Readouts */}
          <div className="w-full bg-zinc-950/80 border-2 border-amber-600/60 p-4 rounded-md flex flex-col md:flex-row gap-6 items-center">
            <div className="flex flex-col items-center md:items-start flex-1">
              <div className="text-xl font-black text-yellow-400 font-sans">{char.name}</div>
              <div className="text-xs text-amber-500 font-bold mb-2">{char.title}</div>
              <div className="text-xs text-zinc-300 font-sans leading-relaxed mb-3">
                {char.bio}
              </div>
              <div className="text-xs text-yellow-300">
                <span className="font-bold text-amber-400">SPECIAL CRASH: </span>
                {char.specialName}
              </div>
            </div>

            {/* Stat Bars */}
            <div className="w-full md:w-64 flex flex-col gap-2 bg-black/60 p-3 rounded-sm border border-zinc-800 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>POWER</span>
                  <span className="text-amber-400 font-bold">{char.power} / 5</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(char.power / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>AGILITY</span>
                  <span className="text-amber-400 font-bold">{char.agility} / 5</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(char.agility / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>REACH</span>
                  <span className="text-amber-400 font-bold">{char.reach} / 5</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-blue-400"
                    style={{ width: `${(char.reach / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>MAX HP</span>
                  <span className="text-emerald-400 font-bold">{char.maxHp}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-xs overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(char.maxHp / 130) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm rounded-sm border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                DEPLOY HERO ➔
              </button>
              <button
                onClick={() => setShowSelect(false)}
                className="px-4 py-1.5 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-sm hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                BACK TO TITLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Instructions Single Flat Line */}
      <div className="w-full text-center text-[11px] text-zinc-500 z-10">
        WASD/Arrows Move · J / Space Attack & Pickup · K Jump · L Special Crash · Shift Dash · Esc Pause
      </div>
    </div>
  );
};
