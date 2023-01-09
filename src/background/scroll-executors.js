/**
 * @file By default, the extension gets installed with the “activeTab” permission, which means there is no way for user to scroll a page until he/she clicks the browser action. To cut down on number of clicks in such case, make the browser action click scroll the page. Once user grants the “tabs” and any-origin permissions, then a more customizable content script will be injected onto pages. This file decides what strategy to use based on granted permissions.
 */

import utils from 'Shared/utils';
import * as feedback from 'Shared/feedback';
import * as permissions from 'Shared/permissions';
import * as settingsHelpers from 'Shared/settings';

import manifest from '@/manifest.json';

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

const SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE_SCRIPT = {
  // @todo Cover non-scrollable window cases. See v6.5.2 and related.
  code: 'window.scrollTo( 0, 0 )',
};
const SCROLL_TO_BOTTOM_ONLY_BASIC_BUTTON_MODE_SCRIPT = {
  // @todo Cover non-scrollable window cases. See v6.5.2 and related.
  code: 'window.scrollTo( 0, Math.max( document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight ) )',
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
  '/global/js/const.js',
  '/global/js/log.js',
  '/global/js/i18next/i18next.min.js',
  '/global/js/i18next/i18nextXHRBackend.js',
  '/shared/legacy/i18n.js',
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

  const buttonModeEmpty = ! window.poziworldExtension.utils.isNonEmptyString( buttonMode );
  let pointingUp = true;

  if ( buttonModeEmpty || settingsHelpers.isBasicButtonMode( buttonMode ) ) {
    // @todo Move out
    browser.browserAction.setPopup( BROWSER_ACTION_NO_POPUP );
    browser.browserAction.setTitle( await getBrowserActionTitle( BUTTON_MODE_BASIC_TYPE ) );
    browser.browserAction.onClicked.removeListener( injectAllFiles );

    let browserActionClickHandler;

    if ( buttonModeEmpty || buttonMode === settingsHelpers.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE ) {
      browserActionClickHandler = injectScrollToTopOnlyBasicLogic;
    }
    else if ( buttonMode === settingsHelpers.SCROLL_TO_BOTTOM_ONLY_BASIC_BUTTON_MODE ) {
      browserActionClickHandler = injectScrollToBottomOnlyBasicLogic;
      pointingUp = false;
    }
    else {
      // @todo Notify user and fail?
    }

    browser.browserAction.onClicked.addListener( browserActionClickHandler );
    browser.tabs.onUpdated.removeListener( setContentScriptAsController );
  }
  else {
    browser.browserAction.onClicked.removeListener( injectScrollToTopOnlyBasicLogic );
    browser.browserAction.onClicked.removeListener( injectScrollToBottomOnlyBasicLogic );

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

  setBrowserActionIcon( pointingUp );

  // @todo DRY.
  controllerIsBeingSet = false;
}

function setBrowserActionIcon( pointingUp ) {
  browser.browserAction.setIcon( {
    path: {
      16: pointingUp ?
        manifest.icons[ 16 ] :
        'icons/scroll-to-bottom-16.png',
      32: pointingUp ?
        manifest.icons[ 32 ] :
        'icons/scroll-to-bottom-32.png',
    },
  } );
}

function injectScrollToTopOnlyBasicLogic() {
  injectBasicLogic( SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE_SCRIPT );
}

function injectScrollToBottomOnlyBasicLogic() {
  injectBasicLogic( SCROLL_TO_BOTTOM_ONLY_BASIC_BUTTON_MODE_SCRIPT );
}

function injectBasicLogic( script ) {
  browser.tabs.executeScript( script )
    .then( handleFileInjectionSuccess, handleFileInjectionFail );
}

async function setContentScriptAsController( tabId, changeInfo ) {
  // @todo Check whether the protocol is supported (not chrome, chrome-extension, browser, etc.).
  if ( isTabReady( changeInfo ) ) {
    await injectAllFiles( tabId );
  }
}

async function injectAllFiles( tabId ) {
  await injectJavascriptFiles( tabId );
  await injectCssFiles( tabId );
}

function isTabReady( info ) {
  return info.status === 'complete';
}

async function injectJavascriptFiles( tabId ) {
  await injectFiles( tabId, CONTENT_SCRIPT_JAVASCRIPT_FILES, true );
}

async function injectCssFiles( tabId ) {
  await injectFiles( tabId, CONTENT_SCRIPT_CSS_FILES, false );
}

async function injectFiles( tabId, paths, jsFilePathPassed ) {
  try {
    for ( const path of paths ) {
      await injectFile( tabId, path, jsFilePathPassed );
    }
  }
  catch ( error ) {
    window.strLog = `Scroll To Top Button failed to load one of its components. Try reloading the page. If the issue is still not resolved, please email the developer at ${ window.atob( 'bG9hZGluZy1pc3N1ZUBzY3JvbGwtdG8tdG9wLWJ1dHRvbi5jb20=' ) }`;
    Log.add( strLog, {
      error,
    }, false, {
      level: 'error',
    } );
  }
}

async function injectFile( tabId, path, jsFilePathPassed ) {
  const injectionDetails = {
    ...CONTENT_SCRIPT_SCRIPT_TEMPLATE,
  };

  injectionDetails.file = path;

  try {
    const result = await browser.tabs[ jsFilePathPassed ? 'executeScript' : 'insertCSS' ]( tabId, injectionDetails );

    handleFileInjectionSuccess( path, result );
  }
  catch ( error ) {
    handleFileInjectionFail( path, error );

    throw new Error( error );
  }
}

function handleFileInjectionSuccess( path, result ) {
  window.strLog = 'scroll-executors, handleFileInjectionSuccess';
  Log.add( strLog, {
    path,
    result,
  } );
}

function handleFileInjectionFail( path, error ) {
  window.strLog = 'scroll-executors, handleFileInjectionFail';
  Log.add( strLog, {
    path,
    error,
  }, false, {
    level: 'error',
  } );

  if ( window.poziworldExtension.utils.isType( error, 'object' ) ) {
    const errorMessage = error.message;

    if ( window.poziworldExtension.utils.isNonEmptyString( errorMessage ) ) {
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
    breakingChangesMessage = window.poziworldExtension.i18n.getMessage( 'breakingChangesUpgradingVersion8Message' );
  }

  await window.poziworldExtension.i18n.init();

  browserActionTitleDetails.title = window.poziworldExtension.i18n.getMessage( translationKey, [
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
  if ( isInternalMessage( target ) ) {
    if ( trigger === settingsHelpers.SCROLL_TO_TOP_ONLY_BASIC_BUTTON_MODE ) {
      injectScrollToTopOnlyBasicLogic();
    }
    else if ( trigger === settingsHelpers.SCROLL_TO_BOTTOM_ONLY_BASIC_BUTTON_MODE ) {
      injectScrollToBottomOnlyBasicLogic();
    }
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

  // @todo Uncomment when user is able to decline future requests and user is asked to provide specific additional details that would help debug, such as other extensions that might be changing style attribute
  // feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}
