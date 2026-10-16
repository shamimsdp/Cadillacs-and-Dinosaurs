/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArcadeCanvas } from './components/ArcadeCanvas';
import { ArcadeHUD } from './components/ArcadeHUD';
import { GameOverModal } from './components/GameOverModal';
import { HeroPortrait } from './components/HeroPortrait';
import { OptionsModal } from './components/OptionsModal';
import { ThreeCharacterViewer, ViewableCharacterId } from './components/ThreeCharacterViewer';
import { TitleScreen } from './components/TitleScreen';
import { VirtualControls } from './components/VirtualControls';
import { arcadeAudio } from './game/audio';
import { CHARACTERS } from './game/characters';
import { GameEngine } from './game/engine';
import { CharacterId, GameScreen } from './game/types';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('title');
  const [selectedChar, setSelectedChar] = useState<CharacterId>('mustapha');
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('cnd_credits');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('cnd_hiscore');
    return saved ? parseInt(saved, 10) : 50000;
  });
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [show3DInspector, setShow3DInspector] = useState<boolean>(false);
  const [inspectorCharId, setInspectorCharId] = useState<ViewableCharacterId>('mustapha');

  // Keep engine ref across renders
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(selectedChar);
  }
  const engine = engineRef.current;

  // React state trigger to reflect game engine changes in React HUD & Modals
  const [, setTick] = useState(0);
  const highScoreRef = useRef(highScore);
  highScoreRef.current = highScore;
  const screenRef = useRef(screen);
  screenRef.current = screen;

  const handleSyncTick = useCallback(() => {
    setTick((t) => (t + 1) % 1000);
    // Update high score
    if (engine.player.score > highScoreRef.current) {
      highScoreRef.current = engine.player.score;
      setHighScore(engine.player.score);
      localStorage.setItem('cnd_hiscore', engine.player.score.toString());
    }
    // Update screen state if game over or victory
    if (engine.isGameOver && screenRef.current === 'playing') {
      arcadeAudio.stopBGM();
      setScreen('gameover');
    }
    if (engine.isVictory && screenRef.current === 'playing') {
      arcadeAudio.stopBGM();
      setScreen('victory');
    }
  }, [engine]);

  // Insert Coin Handler
  const handleInsertCoin = useCallback(() => {
    arcadeAudio.playCoin();
    setCredits((c) => {
      const next = c + 1;
      localStorage.setItem('cnd_credits', next.toString());
      return next;
    });
  }, []);

  // Start Game
  const handleStartGame = (charId: CharacterId) => {
    setSelectedChar(charId);
    setInspectorCharId(charId);
    if (credits > 0) {
      setCredits((c) => Math.max(0, c - 1));
    }
    engine.reset(charId);
    arcadeAudio.startBGM();
    setScreen('playing');
  };

  // Continue Handler
  const handleContinue = () => {
    if (credits > 0) {
      setCredits((c) => Math.max(0, c - 1));
      engine.isGameOver = false;
      engine.player.hp = engine.player.maxHp;
      engine.player.lives = 2;
      engine.player.invincibleTimer = 3.0;
      engine.player.state = 'idle';
      arcadeAudio.playCoin();
      arcadeAudio.startBGM();
      setScreen('playing');
    } else {
      handleInsertCoin();
    }
  };

  // Restart Stage
  const handleRestart = () => {
    engine.reset(selectedChar);
    arcadeAudio.startBGM();
    setScreen('playing');
    setShowOptions(false);
    setShow3DInspector(false);
  };

  // Title Menu
  const handleReturnTitle = () => {
    arcadeAudio.stopBGM();
    setScreen('title');
    setShowOptions(false);
    setShow3DInspector(false);
  };

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = arcadeAudio.toggleMute();
    setIsMuted(next);
  };

  // Open 3D character viewer
  const handleOpen3DViewer = (charId?: ViewableCharacterId) => {
    setInspectorCharId(charId || engine.player.charId);
    setShow3DInspector(true);
    setShowOptions(false);
    engine.isPaused = true;
    arcadeAudio.playPunch(false);
  };

  const handleClose3DViewer = () => {
    setShow3DInspector(false);
    engine.isPaused = false;
  };

  // Keyboard shortcut listener for Coin (5 / C), Start (1 / Enter), Pause (Esc / P), 3D Viewer (3)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '5' || e.code === 'Digit5') {
        handleInsertCoin();
      } else if (e.key === '1' || e.code === 'Digit1') {
        if (screen === 'title') {
          handleStartGame(selectedChar);
        }
      } else if (e.key === '3' || e.code === 'Digit3') {
        if (screen === 'playing') {
          if (show3DInspector) {
            handleClose3DViewer();
          } else {
            handleOpen3DViewer();
          }
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (show3DInspector) {
          handleClose3DViewer();
        } else if (screen === 'playing') {
          setShowOptions((prev) => {
            const next = !prev;
            engine.isPaused = next;
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [screen, selectedChar, handleInsertCoin, engine, show3DInspector]);

  const inspectorHeroes: CharacterId[] = ['mustapha', 'jack', 'hannah', 'mess'];
  const inspectorFoes: { id: ViewableCharacterId; name: string }[] = [
    { id: 'vice_boss', name: 'VICE TERHUNE (BOSS)' },
    { id: 'raptor', name: 'VELOCIRAPTOR' },
    { id: 'enraged_raptor', name: 'ENRAGED RAPTOR' },
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black flex items-center justify-center font-mono">
      {/* Viewport Frame */}
      <div className="relative w-full h-full max-w-[1600px] max-h-[960px] flex items-center justify-center bg-zinc-950 overflow-hidden shadow-2xl">
        {screen === 'title' ? (
          <TitleScreen
            onStartGame={handleStartGame}
            credits={credits}
            onInsertCoin={handleInsertCoin}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Isolated 60FPS Game Canvas */}
            <ArcadeCanvas
              engine={engine}
              crtFilter={crtFilter}
              onStateChange={handleSyncTick}
            />

            {/* In-Game Capcom CPS-1 HUD */}
            <ArcadeHUD
              engine={engine}
              credits={credits}
              highScore={highScore}
              crtFilter={crtFilter}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onToggleCrt={() => setCrtFilter((prev) => !prev)}
              onPause={() => {
                setShowOptions(true);
                engine.isPaused = true;
              }}
              onOpen3DViewer={() => handleOpen3DViewer(engine.player.charId)}
            />

            {/* Virtual Touch Arcade Controls (D-Pad, A, B, C Buttons) */}
            <VirtualControls
              onInsertCoin={handleInsertCoin}
              onStart={() => {
                if (engine.isPaused) {
                  engine.isPaused = false;
                  setShowOptions(false);
                  setShow3DInspector(false);
                }
              }}
              onExit={handleReturnTitle}
              onOption={() => {
                setShowOptions(true);
                engine.isPaused = true;
              }}
              visible={showTouchControls}
            />

            {/* Options & Pause Modal */}
            <OptionsModal
              isOpen={showOptions}
              onClose={() => {
                setShowOptions(false);
                engine.isPaused = false;
              }}
              onRestart={handleRestart}
              onTitle={handleReturnTitle}
              crtFilter={crtFilter}
              onToggleCrt={() => setCrtFilter((prev) => !prev)}
              showTouchControls={showTouchControls}
              onToggleTouchControls={() => setShowTouchControls((prev) => !prev)}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onOpen3DViewer={() => handleOpen3DViewer(engine.player.charId)}
            />

            {/* 3D Character & Creature Inspector Modal (WebGL Three.js) */}
            {show3DInspector && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 select-none animate-fade-in font-mono">
                <div className="max-w-2xl w-full bg-zinc-950 border-2 border-amber-500 rounded-lg p-3 sm:p-4 flex flex-col gap-3 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                  {/* Modal Header */}
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-base sm:text-lg">🌐</span>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-yellow-400 tracking-wider">
                          3D CHARACTER & CREATURE INSPECTOR
                        </h3>
                        <p className="text-[10px] text-zinc-400">
                          Three.js WebGL 360° Studio Viewer with Interactive Combat Poses
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose3DViewer}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xs text-xs font-bold transition-colors cursor-pointer"
                    >
                      ✕ CLOSE [ESC]
                    </button>
                  </div>

                  {/* Character Selector Pills */}
                  <div className="flex flex-col gap-1.5">
                    {/* Heroes */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mr-1">
                        HEROES:
                      </span>
                      {inspectorHeroes.map((hid) => {
                        const hInfo = CHARACTERS[hid];
                        const isSelected = inspectorCharId === hid;
                        return (
                          <button
                            key={hid}
                            onClick={() => setInspectorCharId(hid)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-xs text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-amber-500 text-black border-yellow-300 shadow-sm font-black'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            <HeroPortrait charId={hid} size={18} className="rounded-full overflow-hidden" />
                            <span>{hInfo.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bosses & Dinosaurs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider mr-1">
                        FOES & DINOS:
                      </span>
                      {inspectorFoes.map((f) => {
                        const isSelected = inspectorCharId === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => setInspectorCharId(f.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-xs text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-300 shadow-sm font-black'
                                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            <HeroPortrait charId={f.id} size={18} className="rounded-full overflow-hidden" />
                            <span>{f.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3D WebGL Canvas */}
                  <div className="relative w-full rounded-md overflow-hidden border border-zinc-800 bg-zinc-900/60 shadow-inner">
                    <ThreeCharacterViewer
                      charId={inspectorCharId}
                      height={280}
                      autoRotate={true}
                      showPoseControls={true}
                    />
                  </div>

                  {/* Modal Footer Controls */}
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-xs">
                    <div className="text-[11px] text-zinc-400">
                      💡 Click & drag model to rotate in 360° • Select action buttons above to preview combat animations
                    </div>
                    <button
                      onClick={handleClose3DViewer}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xs active:scale-95 transition-transform cursor-pointer"
                    >
                      RESUME BATTLE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over / Continue / Stage Clear Victory Modal */}
            <GameOverModal
              engine={engine}
              credits={credits}
              onContinue={handleContinue}
              onRestart={handleRestart}
              onTitle={handleReturnTitle}
              onInsertCoin={handleInsertCoin}
            />
          </div>
        )}
      </div>
    </div>
  );
}
