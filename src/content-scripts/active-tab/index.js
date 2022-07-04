import punycode from 'punycode';

import * as specialCaseWebsites from './special-case-websites';

const DISABLED_DOMAINS_SETTING = 'arrDisabledDomains';
const DISABLED_URLS_SETTING = 'arrDisabledUrls';

let tabUrl;
let tabDomain;

/**
 * Make sure all conditions are met.
 *
 * @returns {Promise<void>}
 */

export function runChecks() {
  return new Promise( checkActiveTabSettings )
    .then( checkWindowCriteria );
}

/**
 * To get started, get the active tab properties and retrieve the settings from the Storage.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 * @returns {Promise<void|object>}
 */

function checkActiveTabSettings( resolve, reject ) {
  getActiveTabAddress();

  return new Promise( getActiveTabSettings )
    .then( checkDomain )
    .then( checkUrl )
    .then( resolve )
    .catch( reject );
}

/**
 * Get the domain and full URL of the active tab.
 */

function getActiveTabAddress() {
  const tempDomain = window.location.hostname;

  // Handle non-ASCII domain names.
  tabDomain = punycode.toUnicode( tempDomain );
  tabUrl = window.location.href.replace( tempDomain, tabDomain );
}

/**
 * Retrieve the settings from the Storage.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 */

function getActiveTabSettings( resolve, reject ) {
  const settingsToGet = [
    DISABLED_DOMAINS_SETTING,
    DISABLED_URLS_SETTING,
  ];
  const logTemp = 'getActiveTabSettings';

  window.poziworldExtension.utils.getStorageItems( browser.storage.sync, settingsToGet, logTemp, resolve, reject );
}

/**
 * Check whether STTB is disabled for this domain.
 *
 * @param {Settings} storageData
 * @returns {Promise<object>}
 */

function checkDomain( storageData ) {
  return checkDisabled( storageData, DISABLED_DOMAINS_SETTING, tabDomain );
}

/**
 * Check whether STTB is disabled for this URL.
 *
 * @param {Settings} storageData
 * @returns {Promise<object>}
 */

function checkUrl( storageData ) {
  return checkDisabled( storageData, DISABLED_URLS_SETTING, tabUrl );
}

/**
 * Check whether STTB is disabled for this setting (domain or URL).
 *
 * @param {Settings} storageData
 * @param {string} settingName
 * @param {string} value
 * @returns {Promise<object>}
 */

function checkDisabled( storageData, settingName, value ) {
  const allDisabled = storageData[ settingName ];

  if ( Array.isArray( allDisabled ) && allDisabled.includes( value ) ) {
    return Promise.reject( storageData );
  }

  return Promise.resolve( storageData );
}

/**
 * Check whether the window meets the criteria before initializing STTB.
 *
 * Only top frames and ~fullscreen iframes (since there is no access to the top frame, compare the iframe height to the screen height, considering it also includes the height of the address bar, tabs titles, optional bookmarks bar – the ratio for Chrome and Opera is ~91%, but make it 85% just in case).
 *
 * @returns {Promise<void>}
 */

function checkWindowCriteria() {
  const HEIGHT_RATIO = .85;

  if ( ( window === top || window.innerHeight / window.screen.height > HEIGHT_RATIO ) &&
    window.innerHeight < ( getDocumentHeight() - specialCaseWebsites.TRANSIFEX_EDITOR_CONTAINER_EXTRA_HEIGHT ) ) {
    return Promise.resolve();
  }

  return new Promise( specialCaseWebsites.watch );
}

/**
 * $( document ).height() replacement.
 *
 * @returns {number}
 */

function getDocumentHeight() {
  const documentElement = document.documentElement;

  return Math.max(
    documentElement.clientHeight,
    documentElement.offsetHeight,
    documentElement.scrollHeight,
  );
}
