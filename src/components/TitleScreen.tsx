/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CHARACTERS } from '../game/characters';
import { CharacterId } from '../game/types';
import { arcadeAudio } from '../game/audio';
import { HeroPortrait } from './HeroPortrait';
import { ThreeCharacterViewer, ViewableCharacterId } from './ThreeCharacterViewer';

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
  const [show3DGallery, setShow3DGallery] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<ViewableCharacterId>('mustapha');

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
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-6 select-none overflow-hidden bg-radial from-slate-900 via-zinc-950 to-black text-white font-mono">
      {/* Background Animated Prehistoric Sky & Dot Matrix */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Header Strip */}
      <div className="w-full flex justify-between items-center z-10 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-red-700 text-white font-bold px-2 py-0.5 rounded-xs tracking-wider shadow-sm">
            CAPCOM 1993
          </span>
          <span className="text-zinc-400 hidden sm:inline">CPS-1 ARCADE CLONE</span>
          <span className="bg-emerald-950 text-emerald-400 border border-emerald-600/50 px-2 py-0.5 rounded-xs text-[10px] font-bold">
            3D WEBGL ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShow3DGallery(true)}
            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-yellow-300 border border-amber-500/60 rounded-xs font-bold transition-all cursor-pointer text-xs flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px]">🌐</span> 3D ROSTER
          </button>
          <button
            onClick={onToggleMute}
            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-600 rounded-xs font-bold transition-colors cursor-pointer text-xs"
          >
            {isMuted ? 'MUTE: ON' : 'AUDIO: ON'}
          </button>
          <button
            onClick={onInsertCoin}
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold rounded-xs border-2 border-yellow-200 shadow-md active:scale-95 transition-transform cursor-pointer"
          >
            + COIN
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
          <div className="relative mb-4">
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

          <div className="text-zinc-300 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed font-sans px-2">
            26th Century Earth. Savage poachers hunt dinosaurs across Manhattan ruins. Join Jack, Mustapha, Hannah, and Mess in their 1953 Cadillac to fight back!
          </div>

          {/* Quick Roster Preview Strip with HeroPortraits */}
          <div className="flex items-center gap-3 mb-6 bg-black/60 p-2 rounded-md border border-zinc-800">
            {characterKeys.map((k) => {
              const h = CHARACTERS[k];
              return (
                <div key={k} className="flex flex-col items-center gap-1">
                  <HeroPortrait charId={k} size={48} className="rounded-xs" />
                  <span className="text-[10px] text-zinc-300 font-bold uppercase">{h.name.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>

          {/* Primary Start CTA Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black font-black text-base sm:text-lg tracking-wider rounded-md border-2 border-yellow-200 shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              {credits > 0 ? 'PRESS TO SELECT HERO' : 'INSERT COIN / START'}
            </button>
            <button
              onClick={() => setShow3DGallery(true)}
              className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-yellow-300 font-bold text-xs sm:text-sm rounded-md border border-zinc-700 transition-colors cursor-pointer"
            >
              INSPECT 3D MODELS
            </button>
          </div>

          <div className="text-[11px] text-yellow-300/80 mt-4 tracking-widest font-mono">
            PRESS [ENTER] OR [SPACE] TO PLAY · [5] FOR COIN
          </div>
        </div>
      ) : (
        /* Character Select Screen with LIVE 3D WebGL Three.js character viewer */
        <div className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-5xl">
          <div className="flex items-center justify-between w-full mb-3 px-2">
            <h2 className="text-xl sm:text-2xl font-black text-yellow-400 tracking-widest uppercase drop-shadow">
              PLAYER SELECT · 3D HERO VIEW
            </h2>
            <button
              onClick={() => setShowSelect(false)}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xs border border-zinc-700 transition-colors cursor-pointer"
            >
              BACK
            </button>
          </div>

          {/* 4 Characters Cards with Vector Portraits & Role Tags */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full mb-4">
            {characterKeys.map((cKey) => {
              const c = CHARACTERS[cKey];
              const isSelected = selectedChar === cKey;
              const roleTag =
                cKey === 'mustapha'
                  ? 'FLYING KICK / REACH'
                  : cKey === 'jack'
                  ? 'LEADER / ALL-ROUND'
                  : cKey === 'hannah'
                  ? 'AGILE / SPEEDSTER'
                  : 'HEAVY / BRUTE TANK';

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChar(cKey);
                    arcadeAudio.playPunch(false);
                  }}
                  className={`flex flex-col items-center p-2.5 rounded-md border-2 transition-all cursor-pointer text-left relative ${
                    isSelected
                      ? 'border-yellow-400 bg-amber-950/60 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-102 ring-1 ring-yellow-300'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-800/60'
                  }`}
                >
                  {/* Selected Tag */}
                  {isSelected && (
                    <span className="absolute -top-2 bg-yellow-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-xs shadow-xs">
                      ACTIVE 1P
                    </span>
                  )}
                  {/* High quality hero portrait */}
                  <HeroPortrait charId={cKey} size={56} className="rounded-xs mb-1.5" />
                  <div className="font-bold text-xs sm:text-sm text-yellow-300 font-sans tracking-wide">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-amber-400/90 font-bold tracking-tight">
                    {roleTag}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Split View: Left = 3D Three.js WebGL Model Viewer, Right = Bio, Stats & Actions */}
          <div className="w-full bg-zinc-950/90 border-2 border-amber-600/70 p-3 sm:p-4 rounded-md flex flex-col lg:flex-row gap-4 items-center shadow-2xl">
            {/* 3D WebGL Canvas for the selected hero */}
            <div className="w-full lg:w-1/2 flex flex-col items-center">
              <ThreeCharacterViewer
                charId={selectedChar}
                height={280}
                autoRotate={true}
                showPoseControls={true}
              />
            </div>

            {/* Selected Character Profile & Stat Readouts */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xl font-black text-yellow-400 font-sans tracking-wide">
                    {char.name}
                  </div>
                  <span className="text-[10px] font-bold bg-amber-950 text-yellow-300 px-2 py-0.5 rounded-xs border border-amber-600/60">
                    {char.title}
                  </span>
                </div>

                <div className="text-xs text-zinc-300 font-sans leading-relaxed mb-3">
                  {char.bio}
                </div>

                <div className="text-xs text-yellow-300 bg-black/60 p-2 rounded-xs border border-zinc-800 mb-3 flex items-center justify-between">
                  <span className="font-bold text-amber-400">SPECIAL CRASH:</span>
                  <span className="font-bold tracking-wide text-white">{char.specialName}</span>
                </div>
              </div>

              {/* Stat Bars */}
              <div className="w-full grid grid-cols-2 gap-2 bg-black/60 p-3 rounded-sm border border-zinc-800 text-xs mb-3">
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                    <span>POWER</span>
                    <span className="text-red-400 font-bold">{char.power} / 5</span>
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
                    <span className="text-yellow-400 font-bold">{char.agility} / 5</span>
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
                    <span className="text-blue-400 font-bold">{char.reach} / 5</span>
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

              {/* Primary Start Action */}
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleStart}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm rounded-sm border-2 border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap text-center"
                >
                  DEPLOY {char.name.split(' ')[0].toUpperCase()} INTO CITY ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Bestiary & Character Roster Inspection Modal */}
      {show3DGallery && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl bg-zinc-950 border-2 border-yellow-400 p-4 rounded-md flex flex-col items-center shadow-2xl">
            <div className="flex justify-between items-center w-full mb-3 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-black font-black px-2 py-0.5 rounded-xs text-xs">
                  3D WEBGL VIEWER
                </span>
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  HEROES, DINOSAURS & BOSS BESTIARY
                </span>
              </div>
              <button
                onClick={() => setShow3DGallery(false)}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xs cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Roster Character Selection Badges */}
            <div className="flex flex-wrap justify-center gap-2 mb-3 w-full">
              {[
                { id: 'mustapha', label: 'MUSTAPHA', tag: 'HERO' },
                { id: 'jack', label: 'JACK TENREC', tag: 'HERO' },
                { id: 'hannah', label: 'HANNAH', tag: 'HERO' },
                { id: 'mess', label: 'MESS', tag: 'HERO' },
                { id: 'raptor', label: 'VELOCIRAPTOR', tag: 'DINO' },
                { id: 'enraged_raptor', label: 'ENRAGED RAPTOR', tag: 'DINO' },
                { id: 'vice_boss', label: 'VICE TERHUNE', tag: 'BOSS' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGalleryTarget(item.id as ViewableCharacterId)}
                  className={`px-3 py-1.5 rounded-xs text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    galleryTarget === item.id
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-md scale-105'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-xs font-black ${
                      item.tag === 'DINO'
                        ? 'bg-emerald-950 text-emerald-400'
                        : item.tag === 'BOSS'
                        ? 'bg-red-950 text-red-400'
                        : 'bg-blue-950 text-blue-300'
                    }`}
                  >
                    {item.tag}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* 3D Viewport in Modal */}
            <div className="w-full">
              <ThreeCharacterViewer
                charId={galleryTarget}
                height={350}
                autoRotate={true}
                showPoseControls={true}
              />
            </div>

            <div className="text-[11px] text-zinc-400 mt-2 text-center">
              Drag mouse or finger to inspect in 360° · Use zoom buttons (1X / 2X / 3X) · Test combat action animations
            </div>
          </div>
        </div>
      )}

      {/* Footer Instructions Single Flat Line */}
      <div className="w-full text-center text-[10px] sm:text-[11px] text-zinc-500 z-10">
        WASD/Arrows Move · J / Space Attack & Grab · K Jump · L Special Crash · Shift Dash · Esc Options
      </div>
    </div>
  );
};
