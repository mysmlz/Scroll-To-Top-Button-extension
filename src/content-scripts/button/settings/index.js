import * as keyboard from './keyboard';
import * as modes from './modes';
import * as styles from './styles';

/**
 * @typedef {object} Settings
 * @property {string} buttonMode
 * @property {number} scrollUpSpeed
 * @property {number} scrollUpSpeedCustom
 * @property {number} scrollDownSpeed
 * @property {number} scrollDownSpeedCustom
 * @property {number} distanceLength
 * @property {number} [flipDistanceLength]
 * @property {string} buttonSize
 * @property {number} buttonWidthCustom
 * @property {number} buttonHeightCustom
 * @property {string} buttonDesign
 * @property {string} buttonLocation
 * @property {string} notActiveButtonOpacity
 * @property {string} keyboardShortcuts
 * @property {string} contextMenu
 * @property {string} homeEndKeysControlledBy
 * @property {string} clickthroughKeys
 * @property {string} scroll
 *
 * @todo Have one source of truth (make all places reference the same settings object).
 */

const buttonSettings = {
  buttonMode: 'off',
  scrollUpSpeed: 1000,
  scrollUpSpeedCustom: 1000,
  scrollDownSpeed: 1000,
  scrollDownSpeedCustom: 1000,
  distanceLength: 400,
  flipDistanceLength: 400,
  buttonSize: '50px',
  buttonWidthCustom: 60,
  buttonHeightCustom: 60,
  buttonDesign: 'arrow_blue',
  buttonLocation: 'TR',
  notActiveButtonOpacity: styles.STYLE_SEMITRANSPARENT,
  keyboardShortcuts: keyboard.KEYBOARD_SHORTCUTS_ALT_UP_DOWN_ARROWS,
  contextMenu: 'on',
  homeEndKeysControlledBy: keyboard.HOME_END_KEYS_CONTROLLED_BY_STTB,
  clickthroughKeys: 'ctrl|shift',
  scroll: 'jswing',
};

export default buttonSettings;

/**
 * Make sure the settings from the Storage are in the right format and tweak a few parameters if necessary.
 *
 * @param {Settings} settingsToNormalize - Extension settings.
 */

export function normalizeSettings( settingsToNormalize ) {
  const normalizedSettings = {
    buttonMode: settingsToNormalize.buttonMode,
    scrollUpSpeed: parseInt( settingsToNormalize.scrollUpSpeed ),
    scrollUpSpeedCustom: parseInt( settingsToNormalize.scrollUpSpeedCustom ),
    scrollDownSpeed: parseInt( settingsToNormalize.scrollDownSpeed ),
    scrollDownSpeedCustom: parseInt( settingsToNormalize.scrollDownSpeedCustom ),
    distanceLength: parseInt( settingsToNormalize.distanceLength ),
    flipDistanceLength: parseInt( settingsToNormalize.distanceLength ),
    buttonSize: settingsToNormalize.buttonSize,
    buttonWidthCustom: settingsToNormalize.buttonWidthCustom,
    buttonHeightCustom: settingsToNormalize.buttonHeightCustom,
    buttonDesign: settingsToNormalize.buttonDesign,
    buttonLocation: settingsToNormalize.buttonLocation,
    notActiveButtonOpacity: settingsToNormalize.notActiveButtonOpacity,
    keyboardShortcuts: settingsToNormalize.keyboardShortcuts,
    contextMenu: settingsToNormalize.contextMenu,
    homeEndKeysControlledBy: settingsToNormalize.homeEndKeysControlledBy,
    clickthroughKeys: settingsToNormalize.clickthroughKeys,
  };
  const buttonMode = normalizedSettings.buttonMode;
  const scrollUpSpeedCustom = normalizedSettings.scrollUpSpeedCustom;
  const scrollDownSpeedCustom = normalizedSettings.scrollDownSpeedCustom;

  if ( shouldUseCustom( normalizedSettings.scrollUpSpeed, scrollUpSpeedCustom ) ) {
    normalizedSettings.scrollUpSpeed = scrollUpSpeedCustom;
  }

  if ( shouldUseCustom( normalizedSettings.scrollDownSpeed, scrollDownSpeedCustom ) ) {
    normalizedSettings.scrollDownSpeed = scrollDownSpeedCustom;
  }

  // Button is always present in these modes
  if ( modes.isDualArrowsMode( buttonMode ) || modes.isFlipMode( buttonMode ) ) {
    normalizedSettings.distanceLength = 0;
  }

  // @todo Make code more clear.
  Object.assign( buttonSettings, normalizedSettings );
}

/**
 * Check whether user chose to specify a value instead of selecting a pre-set one.
 *
 * @param {number} value - The value corresponding to a dropdown option.
 * @param {number} customValue - The number input field value.
 * @returns {boolean}
 */

function shouldUseCustom( value, customValue ) {
  return value === -1 && customValue > -1;
}
