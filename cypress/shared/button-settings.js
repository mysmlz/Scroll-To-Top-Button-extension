const TARGET_STORAGE_AREA = 'sync';
const STORAGE_PROPERTY = 'settings';

/**
 * @typedef {object} SettingsWrappedForStorage
 * @property {Settings} settings
 */

/**
 * Set/update the settings in the Storage.
 *
 * @param {Settings} settings
 */

export function setButtonSettings( settings ) {
  cy.setExtensionStorage( TARGET_STORAGE_AREA, prepareForStorage( settings ) );
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
