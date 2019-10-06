const TARGET_STORAGE_AREA = 'sync';
const STORAGE_PROPERTY = 'settings';

/**
 * @typedef {object} SettingsWrappedForStorage
 * @property {Settings} settings
 */

/**
 * Set/override the settings in the Storage.
 *
 * @param {Settings} settings
 */

export function setButtonSettings( settings ) {
  cy.setExtensionStorage( TARGET_STORAGE_AREA, prepareForStorage( settings ) );
}

/**
 * Update the settings in the Storage.
 * Use instead of {@link setButtonSettings} when need to update one or more settings, not override the whole thing.
 *
 * @param {object} settings
 */

export function updateButtonSettings( settings ) {
  getButtonSettings()
    .then( mergeSettings.bind( null, settings ) )
    .then( setButtonSettings );
}

/**
 * Retrieve the settings from the Storage.
 *
 * @return {SettingsWrappedForStorage}
 */

export function getButtonSettings() {
  return cy.getExtensionStorage( TARGET_STORAGE_AREA, [ STORAGE_PROPERTY ] );
}

/**
 *
 * @param {Settings} settings
 * @return {SettingsWrappedForStorage}
 */

export function prepareForStorage( settings ) {
  return {
    [ STORAGE_PROPERTY ]: settings,
  };
}

/**
 * Combine the settings from the Storage with the updated ones.
 *
 * @param {object} newSettings
 * @param {Settings} settings
 * @return {Promise<Settings>}
 */

function mergeSettings( newSettings, { settings } ) {
  return Promise.resolve( Object.assign( settings, newSettings ) );
}
