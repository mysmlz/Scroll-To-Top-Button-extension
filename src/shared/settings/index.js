import utils from 'Shared/utils';

const SETTINGS_STORAGE_KEY = 'settings';

export const BUTTON_MODE_KEY = 'buttonMode';
const BASIC_BUTTON_MODE_INDICATOR = 'Basic';
export const ADVANCED_BUTTON_MODE_INDICATOR = 'Advanced';

export const SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE = 'scrollToTopOnlyBasic';

export const SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE = 'scrollToTopOnlyAdvanced';
export const FLIP_ADVANCED_BUTTON_MODE = 'flipBetweenTopBottomAdvanced';
export const DUAL_ARROWS_ADVANCED_BUTTON_MODE = 'dualArrowsAdvanced';

export const SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE = 'off';
export const FLIP_EXPERT_BUTTON_MODE = 'flip';
export const DUAL_ARROWS_EXPERT_BUTTON_MODE = 'dual';

const AVAILABLE_BUTTON_MODES = [
  SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE,

  SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE,
  FLIP_ADVANCED_BUTTON_MODE,
  DUAL_ARROWS_ADVANCED_BUTTON_MODE,

  SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE,
  FLIP_EXPERT_BUTTON_MODE,
  DUAL_ARROWS_EXPERT_BUTTON_MODE,
];

const PREVIOUS_VERSION_STORAGE_KEY = 'previousVersion';
const PREVIOUS_VERSION_8_PREFIX = '8.';

export const HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY = 'haveGrantedPermissionsAtLeastOnce';
export const HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY = 'hadAskedToNotShowWarningAgain';

export function isBasicButtonMode( mode ) {
  return isButtonMode( mode, BASIC_BUTTON_MODE_INDICATOR );
}

export function isAdvancedButtonMode( mode ) {
  return isButtonMode( mode, ADVANCED_BUTTON_MODE_INDICATOR );
}

export function isExpertButtonMode( mode ) {
  // @todo Handle a case when the value is non-supported (corrupted for some reason).
  return ! isBasicButtonMode( mode ) && ! isAdvancedButtonMode( mode );
}

function isButtonMode( mode, modeIndicator ) {
  return poziworldExtension.utils.isNonEmptyString( mode ) && mode.includes( modeIndicator );
}

export function getExpertModeReplacement( mode ) {
  let replacementMode;

  switch ( mode ) {
    case SCROLL_TO_TOP_ONLY_EXPERT_BUTTON_MODE:
    {
      replacementMode = SCROLL_TO_TOP_ONLY_ADVANCED_BUTTON_MODE;

      break;
    }
    case FLIP_EXPERT_BUTTON_MODE:
    {
      replacementMode = FLIP_ADVANCED_BUTTON_MODE;

      break;
    }
    case DUAL_ARROWS_EXPERT_BUTTON_MODE:
    {
      replacementMode = DUAL_ARROWS_ADVANCED_BUTTON_MODE;

      break;
    }
    default:
    {
      replacementMode = SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE;

      break;
    }
  }

  return replacementMode;
}

export async function getButtonMode() {
  const settings = await getSettings();

  if ( settings ) {
    return extractButtonMode( settings );
  }

  // @todo Throw?
  return '';
}

export async function getSettings() {
  let settings;
  let synchronizedSettings;
  let nonSynchronizedSettings;

  try {
    synchronizedSettings = await retrieveSettingsFromStorage( utils.SYNCHRONIZABLE_STORAGE_TYPE );
    nonSynchronizedSettings = await retrieveSettingsFromStorage( utils.NON_SYNCHRONIZABLE_STORAGE_TYPE );

    // @todo Allow user to choose which settings should have more priority, as user might want a different set of settings on some computer/browser instance. Example: user might want to use the same set of settings on their desktop and laptop, but a different set on their mobile phone.
    settings = {
      ...synchronizedSettings,
      ...nonSynchronizedSettings,
    };
  }
  catch ( error ) {
    Log.add( 'Failed to get settings', error );
  }

  if ( ! isExpectedFormat( settings ) ) {
    throw new TypeError( 'Settings appear to be corrupted or not set.' );
  }

  if ( isUnusableButtonMode( synchronizedSettings, nonSynchronizedSettings ) ) {
    settings.buttonMode = getExpertModeReplacement( extractButtonMode( synchronizedSettings ) );
  }

  return settings;
}

/**
 * If there is no locally saved button mode or it's corrupted and the synchronized button mode is from the Expert group, such synchronized button mode can't be used, as its required permissions aren't synchronized.
 *
 * @param {Settings} synchronizedSettings
 * @param {Settings} nonSynchronizedSettings
 * @returns {boolean}
 */

function isUnusableButtonMode( synchronizedSettings, nonSynchronizedSettings ) {
  const nonSynchronizedSettingsOfExpectedFormat = isExpectedFormat( nonSynchronizedSettings );

  return (
    ( nonSynchronizedSettingsOfExpectedFormat && ! AVAILABLE_BUTTON_MODES.includes( extractButtonMode( nonSynchronizedSettings ) ) || ! nonSynchronizedSettingsOfExpectedFormat ) &&
    isExpectedFormat( synchronizedSettings ) &&
    isExpertButtonMode( extractButtonMode( synchronizedSettings ) )
  );
}

function extractButtonMode( settings ) {
  return settings[ BUTTON_MODE_KEY ];
}

export async function setSettings( settings ) {
  const storageDataWrapper = {
    [ SETTINGS_STORAGE_KEY ]: {
      ...await getSettings(),
      ...settings,
    },
  };

  // Saving in local and sync is necessary as buttonMode can't be synchronized, as it depends on permissions, which are not synchronized. Will also allow user to choose whether user wants to synchronize settings
  await utils.saveInStorage( utils.NON_SYNCHRONIZABLE_STORAGE_TYPE, storageDataWrapper );

  return await utils.saveInStorage( utils.SYNCHRONIZABLE_STORAGE_TYPE, storageDataWrapper );
}

async function retrieveSettingsFromStorage( storageType ) {
  try {
    const { [ SETTINGS_STORAGE_KEY ]: settings } = await utils.getFromStorage( storageType, SETTINGS_STORAGE_KEY );

    return settings;
  }
  catch ( error ) {
    Log.add( `Failed to retrieve settings from ${ storageType } storage`, error );
  }
}

export function isExpectedFormat( settings ) {
  return poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings );
}

/**
 * Version 8 of the extension required permissions granted upon installation.
 * There was no way to carry over the content scripts' “<all_urls>” as an origin permission, so when updated to version 9 users have grant the permissions again in Options. Otherwise, the extension would only work when activeTab is invoked.
 *
 * “mightHaveHad” in the name refers to a bug in pre-9.2.0 versions that was wrongly checking whether a previous version was version 8, while for version 9.1.0 it would have been 9.0.0.
 * As a precaution, show the breaking changes warning to extra users than none.
 *
 * @see {@link https://developer.chrome.com/extensions/activeTab}
 */

export async function mightHaveHadVersion8InstalledBefore() {
  try {
    const { [ PREVIOUS_VERSION_STORAGE_KEY ]: previousVersion } = await browser.storage.local.get( PREVIOUS_VERSION_STORAGE_KEY );

    return poziworldExtension.utils.isNonEmptyString( previousVersion ) && previousVersion.startsWith( PREVIOUS_VERSION_8_PREFIX );
  }
  catch ( error ) {
    // @todo
  }
}

export async function haveGrantedPermissionsAtLeastOnce() {
  try {
    const { [ HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY ]: granted } = await browser.storage.local.get( HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY );

    return poziworldExtension.utils.isType( granted, 'boolean' ) && granted;
  }
  catch ( error ) {
    // @todo
  }
}

// @todo DRY.
export async function hadAskedToNotShowWarningAgain() {
  try {
    const { [ HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY ]: asked } = await browser.storage.local.get( HAD_ASKED_TO_NOT_SHOW_WARNING_AGAIN_KEY );

    return poziworldExtension.utils.isType( asked, 'boolean' ) && asked;
  }
  catch ( error ) {
    // @todo
  }
}
