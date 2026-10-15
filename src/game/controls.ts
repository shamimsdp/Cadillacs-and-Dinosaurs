/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputState } from './types';

export class InputManager {
  private keys: Record<string, boolean> = {};
  private justPressedKeys: Record<string, boolean> = {};
  private lastTapTime: Record<string, number> = {};
  private doubleTapActive: boolean = false;

  // Virtual touch controls state
  private virtualState: Partial<InputState> = {};
  private virtualJustPressed: Partial<Record<keyof InputState, boolean>> = {};

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', (e) => {
      // Don't trap F-keys, DevTools, etc.
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      const key = e.code;
      if (!this.keys[key]) {
        this.justPressedKeys[key] = true;

        // Double tap forward / backward detection for Dash
        if (key === 'ArrowRight' || key === 'KeyD' || key === 'ArrowLeft' || key === 'KeyA') {
          const now = Date.now();
          const prev = this.lastTapTime[key] || 0;
          if (now - prev < 280) {
            this.doubleTapActive = true;
          }
          this.lastTapTime[key] = now;
        }
      }
      this.keys[key] = true;
    });

    window.addEventListener('keyup', (e) => {
      const key = e.code;
      this.keys[key] = false;
      this.justPressedKeys[key] = false;

      if (key === 'ArrowRight' || key === 'KeyD' || key === 'ArrowLeft' || key === 'KeyA' || key === 'ShiftLeft' || key === 'ShiftRight') {
        this.doubleTapActive = false;
      }
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.justPressedKeys = {};
      this.doubleTapActive = false;
    });
  }

  // Set virtual button state from on-screen controls
  public setVirtualButton(button: 'attack' | 'jump' | 'special' | 'dash', pressed: boolean) {
    if (pressed && !this.virtualState[button]) {
      const justKey = ('just' + button.charAt(0).toUpperCase() + button.slice(1)) as keyof InputState;
      this.virtualJustPressed[justKey] = true;
    }
    this.virtualState[button] = pressed;
  }

  // Set virtual directional stick from touch/mouse
  public setVirtualDirection(dx: number, dy: number) {
    const threshold = 0.25;
    this.virtualState.left = dx < -threshold;
    this.virtualState.right = dx > threshold;
    this.virtualState.up = dy < -threshold;
    this.virtualState.down = dy > threshold;
  }

  // Reset virtual direction
  public resetVirtualDirection() {
    this.virtualState.left = false;
    this.virtualState.right = false;
    this.virtualState.up = false;
    this.virtualState.down = false;
  }

  // Poll current frame input state
  public poll(): InputState {
    // 1. Keyboard
    const up = !!(this.keys['KeyW'] || this.keys['ArrowUp'] || this.virtualState.up);
    const down = !!(this.keys['KeyS'] || this.keys['ArrowDown'] || this.virtualState.down);
    const left = !!(this.keys['KeyA'] || this.keys['ArrowLeft'] || this.virtualState.left);
    const right = !!(this.keys['KeyD'] || this.keys['ArrowRight'] || this.virtualState.right);

    const attack = !!(this.keys['KeyJ'] || this.keys['KeyZ'] || this.keys['Space'] || this.virtualState.attack);
    const jump = !!(this.keys['KeyK'] || this.keys['KeyX'] || this.virtualState.jump);
    const special = !!(this.keys['KeyL'] || this.keys['KeyC'] || this.virtualState.special);
    const dash = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.doubleTapActive || this.virtualState.dash);

    const justAttack = !!(
      this.justPressedKeys['KeyJ'] ||
      this.justPressedKeys['KeyZ'] ||
      this.justPressedKeys['Space'] ||
      this.virtualJustPressed.justAttack
    );

    const justJump = !!(
      this.justPressedKeys['KeyK'] ||
      this.justPressedKeys['KeyX'] ||
      this.virtualJustPressed.justJump
    );

    const justSpecial = !!(
      this.justPressedKeys['KeyL'] ||
      this.justPressedKeys['KeyC'] ||
      (this.justPressedKeys['KeyJ'] && this.keys['KeyK']) ||
      (this.justPressedKeys['KeyK'] && this.keys['KeyJ']) ||
      this.virtualJustPressed.justSpecial
    );

    // 2. Gamepad API Polling
    let padUp = false;
    let padDown = false;
    let padLeft = false;
    let padRight = false;
    let padAttack = false;
    let padJump = false;
    let padSpecial = false;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = gamepads[0];
    if (pad) {
      const axisX = pad.axes[0] || 0;
      const axisY = pad.axes[1] || 0;
      padLeft = axisX < -0.3 || pad.buttons[14]?.pressed;
      padRight = axisX > 0.3 || pad.buttons[15]?.pressed;
      padUp = axisY < -0.3 || pad.buttons[12]?.pressed;
      padDown = axisY > 0.3 || pad.buttons[13]?.pressed;

      padAttack = !!pad.buttons[0]?.pressed; // A / Cross
      padJump = !!pad.buttons[1]?.pressed; // B / Circle
      padSpecial = !!pad.buttons[2]?.pressed || !!pad.buttons[3]?.pressed; // X / Square
    }

    // Reset edge-triggered virtuals and keys
    this.justPressedKeys = {};
    this.virtualJustPressed = {};

    return {
      up: up || padUp,
      down: down || padDown,
      left: left || padLeft,
      right: right || padRight,
      attack: attack || padAttack,
      jump: jump || padJump,
      special: special || padSpecial,
      dash,
      justAttack: justAttack || padAttack,
      justJump: justJump || padJump,
      justSpecial: justSpecial || padSpecial,
    };
  }
}

export const inputManager = new InputManager();
