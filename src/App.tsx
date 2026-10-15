/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArcadeCanvas } from './components/ArcadeCanvas';
import { ArcadeHUD } from './components/ArcadeHUD';
import { GameOverModal } from './components/GameOverModal';
import { OptionsModal } from './components/OptionsModal';
import { TitleScreen } from './components/TitleScreen';
import { VirtualControls } from './components/VirtualControls';
import { arcadeAudio } from './game/audio';
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

  // Keep engine ref across renders
  const engineRef = useRef<GameEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GameEngine(selectedChar);
  }
  const engine = engineRef.current;

  // React state trigger to reflect game engine changes in React HUD & Modals
  const [, setTick] = useState(0);
  const handleSyncTick = useCallback(() => {
    setTick((t) => (t + 1) % 1000);
    // Update high score
    if (engine.player.score > highScore) {
      setHighScore(engine.player.score);
      localStorage.setItem('cnd_hiscore', engine.player.score.toString());
    }
    // Update screen state if game over or victory
    if (engine.isGameOver && screen === 'playing') {
      arcadeAudio.stopBGM();
      setScreen('gameover');
    }
    if (engine.isVictory && screen === 'playing') {
      arcadeAudio.stopBGM();
      setScreen('victory');
    }
  }, [engine, highScore, screen]);

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
  };

  // Title Menu
  const handleReturnTitle = () => {
    arcadeAudio.stopBGM();
    setScreen('title');
    setShowOptions(false);
  };

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = arcadeAudio.toggleMute();
    setIsMuted(next);
  };

  // Keyboard shortcut listener for Coin (5 / C), Start (1 / Enter), Pause (Esc / P)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '5' || e.code === 'Digit5') {
        handleInsertCoin();
      } else if (e.key === '1' || e.code === 'Digit1') {
        if (screen === 'title') {
          handleStartGame(selectedChar);
        }
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (screen === 'playing') {
          setShowOptions((prev) => !prev);
          engine.isPaused = !engine.isPaused;
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [screen, selectedChar, handleInsertCoin, engine]);

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
            />

            {/* Virtual Touch Arcade Controls (D-Pad, A, B, C Buttons matching screenshots) */}
            <VirtualControls
              onInsertCoin={handleInsertCoin}
              onStart={() => {
                if (engine.isPaused) {
                  engine.isPaused = false;
                  setShowOptions(false);
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
            />

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
