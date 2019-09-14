import { addButtonsListeners } from '../button/listeners';
import { addKeypressListener } from './keypress';
import { addScrollListener } from './scroll';
import { addFullscreenchangeListener } from './fullscreenchange';
import { addMousemoveListener } from './mousemove';
import { setKeyboardShortcuts } from './keyboard-shortcuts';

/**
 * Set up event listeners that apply to all modes but keyboard-only.
 */

export function addNonKeyboardOnlyModeListeners() {
  addButtonsListeners();
  addKeypressListener();
  addScrollListener();
  addFullscreenchangeListener();
  addMousemoveListener();
}

/**
 * Set up event listeners that apply to all modes.
 */

export function addAllModeListeners() {
  setKeyboardShortcuts();
}
