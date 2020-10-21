/**
 * @file By default, the extension gets installed with the “activeTab” permission, which means there is no way for user to scroll a page until he/she clicks the browser action. To cut down on number of clicks in such case, make the browser action click scroll the page. Once user grants the “tabs” and any-origin permissions, then a more customizable content script will be injected onto pages. This file decides what strategy to use based on granted permissions.
 */

import utils from 'Shared/utils';
import * as feedback from 'Shared/feedback';
import * as permissions from 'Shared/permissions';
import * as settingsHelpers from 'Shared/settings';

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
  '/shared/legacy/i18n.js',
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
const controllerSetterLog = [];
const CONTROLLER_SETTER_TIMEOUT = 100;
const CONTROLLER_SETTER_MAX_RETRIES = 10;
let controllerSetterRetriesCount = 0;
let controllerSetterTimeoutId;

init();

function init() {
  addListeners();
  setController( 'init' );
}

function addListeners() {
  browser.permissions?.onAdded?.addListener( ( permissions ) => setController( 'permissionsAdded', null, { permissions } ) );
  browser.permissions?.onRemoved?.addListener( ( permissions ) => setController( 'permissionsRemoved', null, { permissions } ) );

  window.addEventListener( 'message', handleMessage );
}

export async function setController( source, retriesCount, metadata ) {
  Log.add(
    'setController',
    {
      source,
      retriesCount,
    },
    false,
    {
      level: 'debug',
    },
  );

  if ( ! settingsHelpers.areSettingsReady() ) {
    settingsHelpers.addSettingsReadyEventListener( () => setController( source, retriesCount, metadata ), 'setController' );

    return;
  }

  controllerSetterLog.push( [ source, controllerSetterRetriesCount ] );

  if ( controllerIsBeingSet ) {
    if ( controllerSetterRetriesCount < CONTROLLER_SETTER_MAX_RETRIES ) {
      controllerSetterTimeoutId = window.setTimeout( () => setController( source, controllerSetterRetriesCount, metadata ), CONTROLLER_SETTER_TIMEOUT );

      controllerSetterRetriesCount += 1;
    }

    return;
  }

  controllerIsBeingSet = true;

  let buttonMode;

  try {
    buttonMode = await settingsHelpers.getButtonMode();
  }
  catch ( error ) {
    Log.add( 'Not ready', error, false, {
      level: 'error',
    } );

    return;
  }

  if ( ! poziworldExtension.utils.isNonEmptyString( buttonMode ) || settingsHelpers.isBasicButtonMode( buttonMode ) ) {
    // @todo Move out
    browser.browserAction.setPopup( BROWSER_ACTION_NO_POPUP );
    browser.browserAction.setTitle( await getBrowserActionTitle( BUTTON_MODE_BASIC_TYPE ) );
    browser.browserAction.onClicked.removeListener( injectAllFiles );
    browser.browserAction.onClicked.addListener( injectScrollToTopOnlyBasicLogic );
    browser.tabs.onUpdated.removeListener( setContentScriptAsController );
  }
  else {
    browser.browserAction.onClicked.removeListener( injectScrollToTopOnlyBasicLogic );

    if ( settingsHelpers.isAdvancedButtonMode( buttonMode ) ) {
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
    // User who had had version 8 and hasn't granted the permissions again or revoked them. Or, something went wrong with the required permissions. Or, somebody tampered with the settings in the storage.
    else {
      // Maybe, this hiccup will go away while we keep rechecking?
      // @todo DRY check.
      if ( controllerSetterRetriesCount < CONTROLLER_SETTER_MAX_RETRIES ) {
        controllerSetterRetriesCount += 1;
        controllerSetterTimeoutId = window.setTimeout( () => setController( source, controllerSetterRetriesCount, metadata ), CONTROLLER_SETTER_TIMEOUT );
        controllerIsBeingSet = false;
      }
      else {
        let conversionStatusSource = 'conversion';

        try {
          await convertExpertModeToAdvanced( buttonMode );
          requestToReportIssue( buttonMode, source, retriesCount );
        }
        catch ( error ) {
          // @todo Report?
          Log.add( '', error, false, {
            level: 'error',
          } );

          conversionStatusSource = 'failed conversion';
        }

        controllerIsBeingSet = false;

        await setController( conversionStatusSource, retriesCount, metadata );
      }
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

  if ( await settingsHelpers.mightHaveHadVersion8InstalledBefore() && ! await settingsHelpers.haveGrantedPermissionsAtLeastOnce() ) {
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
  try {
    await settingsHelpers.setSettings( {
      ...await settingsHelpers.getSettings(),
      [ settingsHelpers.BUTTON_MODE_KEY ]: settingsHelpers.getExpertModeReplacement( mode ),
    } );
  }
  catch ( error ) {
    Log.add( 'Failed to convert expert mode to advanced', error, false, {
      level: 'error',
    } );
  }
}

function handleMessage( { data: { trigger }, target } ) {
  if ( isInternalMessage( target ) && trigger === settingsHelpers.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE ) {
    injectScrollToTopOnlyBasicLogic();
  }
}

function isInternalMessage( target ) {
  return target === window;
}

async function requestToReportIssue( buttonMode, source, retriesCount = -1 ) {
  const localVariables = await browser.storage.local.get( null );
  const syncableVariables = await browser.storage.sync.get( null );
  const grantedPermissions = await browser.permissions.getAll();

  Log.add( 'Source', source, true );
  Log.add( 'Retries', retriesCount, true );
  Log.add( 'Retries log', controllerSetterLog, true );
  Log.add( 'Granted permissions', grantedPermissions, true );
  Log.add( 'Stored button mode', buttonMode, true );
  Log.add( 'Local variables', localVariables, true );

  const extensionInfo = await browser.management.getSelf();
  const installationId = await utils.getInstallationId();
  const ISSUE_MESSAGE_JSON_KEY = 'expertModeActivationIssue';
  // Don't translate, as this gets sent to developer
  const ISSUE_TITLE = 'Expert mode activation issue';
  // Don't translate, as this gets sent to developer
  const debuggingInformation = `
Version: ${ extensionInfo.version }
Source: ${ source }
Permissions: ${ JSON.stringify( grantedPermissions ) }
Browser: ${ window.navigator.userAgent }
Local: ${ JSON.stringify( localVariables ) }
Syncable: ${ JSON.stringify( syncableVariables ) }
Anonymous installation ID: ${ installationId }`;

  feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}
