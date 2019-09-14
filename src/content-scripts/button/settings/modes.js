import buttonSettings from './';

const MODE_DUAL_ARROWS = 'dual';
const MODE_FLIP = 'flip';
const MODE_KEYBOARD_ONLY = 'keys';

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

  if ( ! poziworldExtension.utils.isNonEmptyString( buttonMode ) ) {
    buttonModeTemp = buttonSettings.buttonMode;
  }

  return buttonModeTemp === modeToCheck;
}
