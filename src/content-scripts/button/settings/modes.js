import * as settingsHelpers from 'Shared/settings';

import buttonSettings from './';

const MODE_DUAL_ARROWS = 'dual';
const MODE_FLIP = 'flip';
const MODE_KEYBOARD_ONLY = 'keys';

/**
 * Check whether user chose (or was forced to) to click the browser action to scroll to top.
 *
 * @param {string} [buttonMode]
 * @returns {boolean}
 */

export function isBrowserActionTopOnlyMode( buttonMode ) {
  return isMode( buttonMode, settingsHelpers.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE );
}

/**
 * Check whether user chose (or was forced to) to click the browser action to scroll to bottom.
 *
 * @param {string} [buttonMode]
 * @returns {boolean}
 */

export function isBrowserActionBottomOnlyMode( buttonMode ) {
  return isMode( buttonMode, settingsHelpers.SCROLL_TO_BOTTOM_ONLY_BASIC_BUTTON_MODE );
}

/**
 * Check whether user chose to have dual arrows.
 *
 * @param {string} [buttonMode]
 * @returns {boolean}
 */

export function isDualArrowsMode( buttonMode ) {
  return isMode( buttonMode, MODE_DUAL_ARROWS );
}

/**
 * Check whether user chose to use the flip (between top and bottom) mode.
 *
 * @param {string} [buttonMode]
 * @returns {boolean}
 */

export function isFlipMode( buttonMode ) {
  return isMode( buttonMode, MODE_FLIP );
}

/**
 * Check whether user chose to use keyboard only.
 *
 * @param {string} [buttonMode]
 * @returns {boolean}
 */

export function isKeyboardOnlyMode( buttonMode ) {
  return isMode( buttonMode, MODE_KEYBOARD_ONLY );
}

/**
 * Check whether the mode specified in the Settings is equal to the one being checked.
 *
 * @param {string} [buttonMode] - The mode specified in settings.
 * @param {string} modeToCheck - The mode to check against.
 * @returns {boolean}
 */

function isMode( buttonMode, modeToCheck ) {
  let buttonModeTemp = buttonMode;

  if ( ! window.poziworldExtension.utils.isNonEmptyString( buttonMode ) ) {
    buttonModeTemp = buttonSettings.buttonMode;
  }

  return buttonModeTemp.includes( modeToCheck );
}
