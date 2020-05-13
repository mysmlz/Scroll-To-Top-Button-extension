/**
 * @file By default, the extension gets installed with the “activeTab” permission, which means there is no way for user to scroll a page until he/she clicks the browser action. To cut down on number of clicks in such case, make the browser action click scroll the page. Once user grants the “tabs” and any-origin permissions, then a more customizable content script will be injected onto pages. This file decides what strategy to use based on granted permissions.
 */

import * as feedback from 'Shared/feedback';
import * as permissions from 'Shared/permissions';
import * as settings from 'Shared/settings';

const BUTTON_MODE_BASIC_TYPE = 'basic';
const BUTTON_MODE_ADVANCED_TYPE = 'advanced';
const BUTTON_MODE_EXPERT_TYPE = 'expert';

const BROWSER_ACTION_POPUP = {
  popup: 'browser-action/index.html',
};
const BROWSER_ACTION_NO_POPUP = {
  popup: '',
};

const BROWSER_ACTION_TITLE_TEMPLATE = {
  title: '%PLACEHOLDER%',
};

const BROWSER_ACTION_SCRIPT = {
  // @todo Cover non-scrollable window cases. See v6.5.2 and related.
  code: 'window.scrollTo( 0, 0 )',
};
const CONTENT_SCRIPT_SCRIPT_TEMPLATE = {
  allFrames: true,
  file: '%PLACEHOLDER%',
};
const CONTENT_SCRIPT_JAVASCRIPT_FILES = [
  '/global/js/browser-polyfill.min.js',
  '/global/js/bowser.js',
  '/global/js/global.js',
  '/global/js/utils.js',
  '/libraries/jquery-3.3.1.min.js',
  '/global/js/const.js',
  '/global/js/log.js',
  '/global/js/i18next/i18next.min.js',
  '/global/js/i18next/i18nextBrowserLanguageDetector.min.js',
  '/global/js/i18next/i18nextXHRBackend.js',
  '/global/js/i18n.js',
  '/libraries/jquery.easing.js',
  '/libraries/jQueryRotate.js',
  '/libraries/shortcut.js',
  '/content-scripts.js',
];
const CONTENT_SCRIPT_CSS_FILES = [
  '/content-scripts.css',
];

// Helps prevent race condition when setController is called from permissions listener (on revocation) and storage listener at the same time - when permissions are being revoked while button mode is of an expert group, Options changes mode to the corresponding one from the advanced group, if there is one.
let controllerIsBeingSet = false;
const CONTROLLER_SETTER_TIMEOUT = 100;
const CONTROLLER_SETTER_MAX_RETRIES = 10;
let controllerSetterRetries = 0;

init();

function init() {
  setController( 'init' );
  addListeners();
}

function addListeners() {
  const onAdded = browser.permissions.onAdded;
  const onRemoved = browser.permissions.onRemoved;

  if ( onAdded ) {
    onAdded.addListener( () => setController( 'permissionsAdded' ) );
  }

  if ( onRemoved ) {
    onRemoved.addListener( () => setController( 'permissionsRemoved' ) );
  }

  window.addEventListener( 'message', handleMessage );
}

export async function setController( source, retriesCount ) {
  if ( controllerIsBeingSet ) {
    if ( controllerSetterRetries < CONTROLLER_SETTER_MAX_RETRIES ) {
      window.setTimeout( () => setController ( source, controllerSetterRetries ), CONTROLLER_SETTER_TIMEOUT );

      controllerSetterRetries += 1;
    }

    return;
  }

  controllerIsBeingSet = true;
  controllerSetterRetries = 0;

  const buttonMode = await settings.getButtonMode();

  if ( ! poziworldExtension.utils.isNonEmptyString( buttonMode ) || settings.isBasicButtonMode( buttonMode ) ) {
    browser.browserAction.setPopup( BROWSER_ACTION_NO_POPUP );
    browser.browserAction.setTitle( await getBrowserActionTitle( BUTTON_MODE_BASIC_TYPE ) );
    browser.browserAction.onClicked.removeListener( injectAllFiles );
    browser.browserAction.onClicked.addListener( injectScrollToTopOnlyBasicLogic );
    browser.tabs.onUpdated.removeListener( setContentScriptAsController );
  }
  else {
    browser.browserAction.onClicked.removeListener( injectScrollToTopOnlyBasicLogic );

    if ( settings.isAdvancedButtonMode( buttonMode ) ) {
      browser.browserAction.setPopup( BROWSER_ACTION_NO_POPUP );
      browser.browserAction.setTitle( await getBrowserActionTitle( BUTTON_MODE_ADVANCED_TYPE ) );
      // @todo Don't inject the second time.
      browser.browserAction.onClicked.addListener( injectAllFiles );
      browser.tabs.onUpdated.removeListener( setContentScriptAsController );
    }
    // Expert mode & has permissions
    else if ( await permissions.hasPermissions() ) {
      browser.browserAction.setPopup( BROWSER_ACTION_POPUP );
      browser.browserAction.setTitle( await getBrowserActionTitle( BUTTON_MODE_EXPERT_TYPE ) );
      browser.tabs.onUpdated.addListener( setContentScriptAsController );
    }
    // User who had had version 8 and hasn't granted the permissions again or revoked them. Or, somebody tampered with the settings in the storage
    else {
      requestToReportIssue( buttonMode, source, retriesCount );
      await convertExpertModeToAdvanced( buttonMode );

      controllerIsBeingSet = false;

      await setController( 'conversion', retriesCount );
    }
  }

  // @todo DRY.
  controllerIsBeingSet = false;
}

function injectScrollToTopOnlyBasicLogic() {
  browser.tabs.executeScript( BROWSER_ACTION_SCRIPT )
    .then( handleFileInjectionSuccess, handleFileInjectionFail );
}

function setContentScriptAsController( tabId, changeInfo ) {
  // @todo Check whether the protocol is supported (not chrome, chrome-extension, browser, etc.).
  if ( isTabReady( changeInfo ) ) {
    injectJavascriptFiles( tabId );
    injectCssFiles( tabId );
  }
}

function injectAllFiles() {
  injectJavascriptFiles();
  injectCssFiles();
}

function isTabReady( info ) {
  return info.status === 'complete';
}

function injectJavascriptFiles( tabId ) {
  injectFiles( tabId, CONTENT_SCRIPT_JAVASCRIPT_FILES, true );
}

function injectCssFiles( tabId ) {
  injectFiles( tabId, CONTENT_SCRIPT_CSS_FILES, false );
}

function injectFiles( tabId, paths, jsFilePathPassed ) {
  paths.forEach( ( path ) => injectFile( tabId, path, jsFilePathPassed ) );
}

function injectFile( tabId, path, jsFilePathPassed ) {
  const injectionDetails = {
    ...CONTENT_SCRIPT_SCRIPT_TEMPLATE,
  };

  injectionDetails.file = path;
  browser.tabs[ jsFilePathPassed ? 'executeScript' : 'insertCSS' ]( tabId, injectionDetails )
    .then( handleFileInjectionSuccess, handleFileInjectionFail );
}

function handleFileInjectionSuccess( result ) {
  window.strLog = 'scroll-executors, handleFileInjectionSuccess';
  Log.add( strLog, result );
}

function handleFileInjectionFail( error ) {
  window.strLog = 'scroll-executors, handleFileInjectionFail';
  Log.add( strLog, error );

  if ( poziworldExtension.utils.isType( error, 'object' ) ) {
    const errorMessage = error.message;

    if ( poziworldExtension.utils.isNonEmptyString( errorMessage ) ) {
      // @todo Enable only after common non-working protocols (chrome, chrome-extension, edge, etc.) are excluded.
      // window.alert( errorMessage );
    }
  }
}

async function getBrowserActionTitle( mode ) {
  const browserActionTitleDetails = {
    ...BROWSER_ACTION_TITLE_TEMPLATE,
  };
  let translationKey;

  switch ( mode ) {
    case BUTTON_MODE_BASIC_TYPE: {
      translationKey = 'buttonModeBasicBrowserActionTitle';

      break;
    }
    case BUTTON_MODE_ADVANCED_TYPE: {
      translationKey = 'buttonModeAdvancedBrowserActionTitle';

      break;
    }
    case BUTTON_MODE_EXPERT_TYPE: {
      translationKey = 'buttonModeExpertBrowserActionTitle';

      break;
    }
  }

  let breakingChangesMessage = '';

  if ( await settings.mightHaveHadVersion8InstalledBefore() && ! await settings.haveGrantedPermissionsAtLeastOnce() ) {
    breakingChangesMessage = poziworldExtension.i18n.getMessage( 'breakingChangesUpgradingVersion8Message' );
  }

  await poziworldExtension.i18n.init();

  browserActionTitleDetails.title = poziworldExtension.i18n.getMessage( translationKey, [
    strConstExtensionName,
    strConstExtensionVersion,
    breakingChangesMessage,
  ] );

  return browserActionTitleDetails;
}

async function convertExpertModeToAdvanced( mode ) {
  await settings.setSettings( {
    ...await settings.getSettings(),
    [ settings.BUTTON_MODE_KEY ]: settings.getExpertModeReplacement( mode ),
  } );
}

function handleMessage( { data: { trigger }, target } ) {
  if ( isInternalMessage( target ) && trigger === settings.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE ) {
    injectScrollToTopOnlyBasicLogic();
  }
}

function isInternalMessage( target ) {
  return target === window;
}

async function requestToReportIssue( buttonMode, source, retriesCount = -1 ) {
  const localVariables = await browser.storage.local.get( null );
  const grantedPermissions = await browser.permissions.getAll();

  Log.add( 'Source', source, true );
  Log.add( 'Retries', retriesCount, true );
  Log.add( 'Granted permissions', grantedPermissions, true );
  Log.add( 'Stored button mode', buttonMode, true );
  Log.add( 'Local variables', localVariables, true );

  const extensionInfo = await browser.management.getSelf();
  const ISSUE_MESSAGE_JSON_KEY = 'expertModeActivationIssue';
  // Don't translate, as this gets sent to developer
  const ISSUE_TITLE = 'Expert mode activation issue';
  // Don't translate, as this gets sent to developer
  const debuggingInformation = `
Source: ${ source }
Retries: ${ retriesCount }
Mode: ${ buttonMode }
Permissions: ${ JSON.stringify( grantedPermissions ) }
Hosts: ${ JSON.stringify( extensionInfo.hostPermissions ) }
Permissions: ${ JSON.stringify( extensionInfo.permissions ) }
Local: ${ JSON.stringify( localVariables ) }
Version: ${ extensionInfo.version }
Browser: ${ window.navigator.userAgent }`;

  feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}
