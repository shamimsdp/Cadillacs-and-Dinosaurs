/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  onTitle: () => void;
  crtFilter: boolean;
  onToggleCrt: () => void;
  showTouchControls: boolean;
  onToggleTouchControls: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpen3DViewer?: () => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  onTitle,
  crtFilter,
  onToggleCrt,
  showTouchControls,
  onToggleTouchControls,
  isMuted,
  onToggleMute,
  onOpen3DViewer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-mono select-none">
      <div className="max-w-md w-full bg-zinc-950 border-2 border-amber-500/80 p-5 rounded-md shadow-2xl flex flex-col gap-4 text-white">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h3 className="text-lg font-black text-yellow-400 tracking-wider">GAME OPTIONS</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-bold text-sm px-2 py-0.5 rounded-xs"
          >
            ✕
          </button>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center bg-zinc-900/60 p-2.5 rounded-sm border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-200">CRT SCANLINES</div>
              <div className="text-[11px] text-zinc-500">Authentic 90s arcade tube simulation</div>
            </div>
            <button
              onClick={onToggleCrt}
              className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer ${
                crtFilter ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {crtFilter ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/60 p-2.5 rounded-sm border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-200">ON-SCREEN VIRTUAL CONTROLS</div>
              <div className="text-[11px] text-zinc-500">Touch D-Pad & A/B/C arcade buttons</div>
            </div>
            <button
              onClick={onToggleTouchControls}
              className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer ${
                showTouchControls ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {showTouchControls ? 'VISIBLE' : 'HIDDEN'}
            </button>
          </div>

          <div className="flex justify-between items-center bg-zinc-900/60 p-2.5 rounded-sm border border-zinc-800">
            <div>
              <div className="font-bold text-zinc-200">CPS-1 SYNTH AUDIO</div>
              <div className="text-[11px] text-zinc-500">FM Synthesizer BGM and combat sound effects</div>
            </div>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 font-bold rounded-xs transition-colors cursor-pointer ${
                !isMuted ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {!isMuted ? 'ACTIVE' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
          {onOpen3DViewer && (
            <button
              onClick={onOpen3DViewer}
              className="w-full py-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 text-yellow-300 hover:text-white border border-amber-500/60 font-bold text-xs rounded-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🌐</span> INSPECT 3D CHARACTER ROSTER & DINOS
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-xs rounded-xs active:scale-95 transition-transform cursor-pointer"
          >
            RESUME BATTLE
          </button>
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs rounded-xs transition-colors cursor-pointer"
            >
              RESTART STAGE
            </button>
            <button
              onClick={onTitle}
              className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs rounded-xs transition-colors cursor-pointer"
            >
              TITLE SCREEN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
