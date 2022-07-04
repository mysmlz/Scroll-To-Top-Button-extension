import * as settingsHelpers from 'Shared/settings';

/* =============================================================================

  Scroll To Top Button
  © 2014-2019 PoziWorld, Inc.
  https://scroll-to-top-button.com

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const objSettingsNotSyncable = {
  strLatestTrackedVersion: strConstExtensionVersion,
};
const objSettingsSyncable = {
  arrDisabledDomains: [
    'docs.google.com',
    'docs0.google.com',
    'spreadsheets.google.com',
    'spreadsheets0.google.com',
  ],
  arrDisabledUrls: [],
};

const REQUEST_TO_SIMULATE_EXTENSION_UPDATE_KEY = 'requestedToSimulateExtensionUpdate';
const EXTENSION_INSTALL_TYPE_DEVELOPMENT = 'development';

/* =============================================================================

  Background

 ============================================================================ */

var Background = {
    intCheckSettingsTimeout : 50
  , boolWasAnyChromeEventFired : false
  , objPreservedSettings : {}
  ,

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    Background.checkIfUpdatedSilently();
    initContextMenus();
    exposeApi();
  }
  ,

  /**
   * When updated on a browser start-up or when the extension was disabled,
   * it doesn't fire onInstalled, and that causes the new settings
   * not being applied
   *
   * @todo Utilize browser.management.onEnabled.addListener(function callback)
   */

  checkIfUpdatedSilently: function () {
    const logTemp = strLog = 'checkIfUpdatedSilently';

    const funcCheck = function() {
      window.poziworldExtension.utils.getStorageItems( StorageLocal, 'strLatestTrackedVersion', logTemp, onLatestTrackedVersionRetrieved );

      function onLatestTrackedVersionRetrieved( objReturn ) {
        Log.add( logTemp, {} );

        var strLatestTrackedVersion = objReturn.strLatestTrackedVersion;

        if (  typeof strLatestTrackedVersion === 'string'
          &&  (
                    strLatestTrackedVersion < strConstExtensionVersion
                ||  strLatestTrackedVersion === ''
              )
          ||  typeof strLatestTrackedVersion === 'undefined'
        ) {
          var objDetails = {
            previousVersion: strLatestTrackedVersion,
          };

          Background.cleanUp( true, objDetails );
          Background.onUpdatedCallback( logTemp, objDetails );
        }
      }
    };

    setTimeout(
        function() {
          // Do not proceed if one of the chrome events fired
          if ( ! Background.boolWasAnyChromeEventFired )
            funcCheck();
        }
      , Background.intCheckSettingsTimeout
    );
  }
  ,

  /**
   * Do stuff when the extension was updated.
   *
   * @param {string} logFromCaller
   * @param {object} details
   * @param {("install"|"update"|"chrome_update")} [details.reason] - The reason that this event is being dispatched.
   * @param {string} [details.previousVersion] - Indicates the previous version of the extension, which has just been updated. This is present only if 'reason' is 'update'.
   **/

  onUpdatedCallback: function ( logFromCaller, details ) {
    strLog = 'onUpdatedCallback, ' + logFromCaller;

    const versionsToSave = {
      strLatestTrackedVersion: strConstExtensionVersion,
    };

    if ( window.poziworldExtension.utils.isType( details, 'object' ) ) {
      const previousVersion = details.previousVersion;

      versionsToSave.previousVersion = previousVersion;
      // @todo
      // versionsToSave.previousVersions.push( previousVersion );
    }

    window.poziworldExtension.utils.setStorageItems(
      StorageLocal,
      versionsToSave,
      strLog + ', save version'
    );
  }
  ,

  /**
   * Prevent from unnecessary check and setting defaults twice
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  preventCheckForSilentUpdate : function() {
    Background.boolWasAnyChromeEventFired = true;
  }
  ,

  /**
   * Clean up in case of browser (re-)load/crash, extension reload, etc.
   *
   * @param {boolean} [calledFromOnInstalledListener] - Whether to set extension defaults on clean-up complete.
   * @param {Object} details - Reason (install/update/chrome_update) and (optional) previous version.
   */

  cleanUp: function ( calledFromOnInstalledListener, details ) {
    const logTemp = strLog = 'cleanUp';
    Log.add( strLog );

    // To make removeOldSettings asynchronous.
    // Otherwise, it won't work correctly.
    const settingsToCleanUp = [
      'dummySetting',
      REQUEST_TO_SIMULATE_EXTENSION_UPDATE_KEY,
    ];

    // Fails in case of a new install
    StorageLocal.remove( settingsToCleanUp ).then( onSettingsCleanedUp, onSettingsCleanedUp );

    function onSettingsCleanedUp( e ) {
      Log.add( logTemp + ', onSettingsCleanedUp', {
        calledFromOnInstalledListener: calledFromOnInstalledListener,
        e: e,
      } );

      if ( window.poziworldExtension.utils.isType( calledFromOnInstalledListener, 'boolean' ) && calledFromOnInstalledListener ) {
        Background.removeOldSettings( details );
      }
    }
  }
  ,

  /**
   * Remove old settings when updated to a newer version (some vars could have been renamed, deprecated).
   *
   * @param {Object} objDetails - Reason (install/update/chrome_update) and (optional) previous version.
   */

  removeOldSettings: function ( objDetails ) {
    const logTemp = strLog = 'removeOldSettings';
    Log.add( strLog, objDetails );

    const boolWasUpdated = objDetails.boolWasUpdated;

    if ( typeof boolWasUpdated === 'boolean' && boolWasUpdated ) {
      // @todo Replace
      window.poziworldExtension.utils.getStorageItems( StorageSync, null, logTemp, onSettingsRetrieved );

      function onSettingsRetrieved( objReturn ) {
        var arrSettingsToRemove = []
          , objDeprecatedSettings = {}
          , strPreviousVersion = objDetails.previousVersion
          ;

        // Added support for Gmail
        if ( typeof strPreviousVersion === 'string' && strPreviousVersion < '6.3.0' ) {
          objDeprecatedSettings.arrDisabledDomains = [
              'mail.google.com'
          ];
        }

        for ( let miscSetting in objDeprecatedSettings ) {
          if ( objDeprecatedSettings.hasOwnProperty( miscSetting ) ) {
            if ( objDeprecatedSettings[ miscSetting ] === null ) {
              // Remove it only if it is present
              if ( objReturn[ miscSetting ] ) {
                arrSettingsToRemove.push( miscSetting );
              }
            }
            else {
              // If deprecated subsetting is present in current setting object,
              // remove it preserving the rest.
              // Restore preserved in setExtensionDefaults().
              var objCurrentSetting = objReturn[ miscSetting ]
                , objDeprecatedSetting = objDeprecatedSettings[ miscSetting ]
                ;

              if ( objCurrentSetting ) {
                if ( Array.isArray( objCurrentSetting ) && Array.isArray( objDeprecatedSetting ) ) {
                  for ( var i = 0, l = objDeprecatedSetting.length; i < l; i++ ) {
                    objCurrentSetting = objCurrentSetting.filter( function( strItem ) {
                      return strItem !== objDeprecatedSetting[ i ];
                    } );
                  }
                }

                if ( ! Global.isEmpty( objDeprecatedSetting ) ) {
                  Background.objPreservedSettings[ miscSetting ] =
                    objCurrentSetting;

                  arrSettingsToRemove.push( miscSetting );
                }
              }
            }
          }
        }

        if ( ! Global.isEmpty( arrSettingsToRemove ) ) {
          // Fails in case of a new install
          StorageSync.remove( arrSettingsToRemove ).then( onSettingsRemoved, onSettingsRemovalError );

          function onSettingsRemoved() {
            Log.add( logTemp + strLogDo, arrSettingsToRemove, true );
            // @todo Replace
            window.poziworldExtension.utils.getStorageItems( StorageSync, null, logTemp, onUpdatedSettingsRetrieved );

            function onUpdatedSettingsRetrieved( objData ) {
              Log.add( logTemp + strLogDone, objData );
            }

            Background.setExtensionDefaults();
          }

          function onSettingsRemovalError( e ) {
            let objLogDetails = {};
            const strErrorMessage = e.message;

            if ( typeof strErrorMessage === 'string' ) {
              objLogDetails = { strErrorMessage: strErrorMessage };
            }

            Log.add( logTemp + strLogError, objLogDetails, true );
          }
        }
        else {
          Log.add( logTemp + strLogDoNot );

          Background.setExtensionDefaults();
        }
      }
    }
    else {
      Log.add( logTemp + strLogDoNot );

      Background.setExtensionDefaults();
    }
  }
  ,

  /**
   * Set extension defaults in case user hasn't set them yet.
   * v7.0.0 moved settings from localStorage to the {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/sync sync} storage.
   */

  checkForLegacySettings: async function () {
    strLog = 'checkForLegacySettings';
    Log.add( strLog );

    try {
      const settings = await settingsHelpers.getSettings();

      await moveLegacySettings( settings );
    }
    catch ( error ) {
      await moveLegacySettings();
    }

    initContextMenus();
  }
  ,

  /**
   * Set extension defaults.
   *
   * @param Storage - StorageSync or StorageLocal. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage#Properties
   * @param {Object} objSettings - Default settings.
   * @param {string} strLogSuffix - Type of storage to report in the log.
   */

  setDefaults: function ( Storage, objSettings, strLogSuffix ) {
    const logTemp = strLog = 'setDefaults' + ', ' + strLogSuffix;

    return window.poziworldExtension.utils.getStorageItems( Storage, null, logTemp, onSettingsRetrieved );

    function onSettingsRetrieved( objReturn ) {
      Log.add( logTemp, objReturn );

      var objTempToSet = {};

      for ( var strSetting in objSettings ) {
        if ( objSettings.hasOwnProperty( strSetting ) ) {
          var miscSetting = objSettings[ strSetting ]
            , miscReturnSetting = objReturn[ strSetting ]
            ;

          // If a new setting introduced, set its default
          if ( typeof miscReturnSetting === 'undefined' ) {
            objTempToSet[ strSetting ] = miscSetting;
          }

          if ( typeof miscSetting === 'object' ) {
            if ( ! Array.isArray( miscSetting ) ) {
              for ( var strSubsetting in miscSetting ) {
                if ( miscSetting.hasOwnProperty( strSubsetting ) ) {
                  // If a new subsetting introduced, set its default
                  if (  typeof miscReturnSetting !== 'undefined'
                    &&  typeof miscReturnSetting[ strSubsetting ] === 'undefined'
                  ) {
                    // If the setting has been set before.
                    if ( typeof objTempToSet[ strSetting ] === 'undefined' ) {
                      // Preserve other subsettings.
                      objTempToSet[ strSetting ] = miscReturnSetting;
                    }

                    objTempToSet[ strSetting ][ strSubsetting ] =
                      miscSetting[ strSubsetting ];
                  }
                  else {
                    var objSetting = Background.objPreservedSettings[ strSetting ];

                    if (  typeof objSetting !== 'undefined'
                      &&  typeof objSetting[ strSubsetting ] !== 'undefined'
                    ) {
                      objTempToSet[ strSetting ][ strSubsetting ] =
                        objSetting[ strSubsetting ];
                    }
                  }
                }
              }
            }
            else {
              var arrSetting = Background.objPreservedSettings[ strSetting ];

              if ( typeof arrSetting === 'object' && Array.isArray( arrSetting ) ) {
                objTempToSet[ strSetting ] = Background.objPreservedSettings[ strSetting ];
              }
            }
          }
        }
      }

      if ( ! Global.isEmpty( objTempToSet ) ) {
        window.poziworldExtension.utils.setStorageItems( Storage, objTempToSet, logTemp );
      }
      else {
        Log.add( logTemp + strLogDoNot );
      }
    }
  }
  ,

  /**
   * Set extension defaults.
   */

  setExtensionDefaults: function () {
    Background.checkForLegacySettings()
      .then( Background.setDefaults.bind( null, StorageLocal, objSettingsNotSyncable, 'local' ) )
      .then( Background.setDefaults.bind( null, StorageSync, objSettingsSyncable, 'sync' ) );
  }
};

/**
 * If the settings aren't in the Storage yet.
 *
 * @param {Settings} [settings] - Key-value pairs.
 */

async function moveLegacySettings( settings ) {
  const logTemp = 'moveLegacySettings';

  /**
   * Each setting (object property) specifies an array, where the first item is the old name of the setting (if it existed and was different when the settings used to be stored in localStorage) and the second item is a default value.
   *
   * @namespace availableSettings
   * @todo Have one source of truth (make all places reference the same settings object).
   */

  const availableSettings = {
    uiLanguage: [
      undefined,
      'browserDefault',
    ],
    buttonMode: [
      'stbb',
      'scrollToTopOnlyBasic',
    ],
    scrollUpSpeed: [
      'scroll_speed',
      /** @alias availableSettings.scrollUpSpeedDefault */
      1000,
    ],
    scrollUpSpeedCustom: [
      undefined,
      1000,
    ],
    scrollDownSpeed: [
      'scroll_speed2',
      1000,
    ],
    scrollDownSpeedCustom: [
      undefined,
      1000,
    ],
    distanceLength: [
      'distance_length',
      400,
    ],
    buttonSize: [
      'size',
      '50px',
    ],
    buttonWidthCustom: [
      undefined,
      /** @alias availableSettings.buttonWidthCustomDefault */
      60,
    ],
    buttonHeightCustom: [
      undefined,
      /** @alias availableSettings.buttonHeightCustomDefault */
      60,
    ],
    buttonDesign: [
      'arrow',
      'arrow_blue',
    ],
    buttonLocation: [
      'location',
      'TR',
    ],
    notActiveButtonOpacity: [
      'transparency',
      '0.5',
    ],
    keyboardShortcuts: [
      'shortcuts',
      'arrows',
    ],
    contextMenu: [
      'contextmenu',
      'on',
    ],
    homeEndKeysControlledBy: [
      'homeendaction',
      'sttb',
    ],
    clickthroughKeys: [
      undefined,
      /** @alias availableSettings.clickthroughKeysDefault */
      'ctrl|shift',
    ],
    scroll: [
      undefined,
      'jswing',
    ],
  };

  if ( ! window.poziworldExtension.utils.isType( settings, 'object' ) || Object.keys( settings ).length !== Object.keys( availableSettings ).length ) {
    const newSettings = {};

    const localStorageAvailable = isLocalStorageAvailable();

    for ( const settingName in availableSettings ) {
      if ( availableSettings.hasOwnProperty( settingName ) ) {
        const setting = availableSettings[ settingName ];
        const DEFAULT_VALUE_INDEX = 1;
        let oldValue = undefined;
        let value = undefined;

        if ( localStorageAvailable ) {
          const OLD_KEY_INDEX = 0;
          const oldKey = setting[ OLD_KEY_INDEX ] || settingName;

          oldValue = localStorage.getItem( oldKey );
          localStorage.removeItem( oldKey );
        }

        if ( ! window.poziworldExtension.utils.isType( oldValue, 'undefined' ) && oldValue !== null ) {
          value = oldValue;
        }
        else if ( window.poziworldExtension.utils.isType( settings, 'object' ) ) {
          value = settings[ settingName ];
        }

        if ( window.poziworldExtension.utils.isType( value, 'undefined' ) ) {
          value = setting[ DEFAULT_VALUE_INDEX ];
        }

        newSettings[ settingName ] = value;
      }
    }

    if ( ! Global.isEmpty( newSettings ) ) {
      try {
        await settingsHelpers.setSettings( newSettings );
      }
      catch ( error ) {
        // @todo Abort everything and notify user?
      }

      if ( localStorageAvailable ) {
        localStorage.removeItem( 'latest' );
      }

      return;
    }
  }

  settingsHelpers.signalSettingsReady();

  Log.add( logTemp + strLogDoNot );
}

/**
 * Initialize context menus, which requires i18n to be initialized first.
 */

function initContextMenus() {
  window.poziworldExtension.i18n.init()
    .then( sttb.contextMenus.init );
}

/**
 * Expose some functionality to other components.
 */

function exposeApi() {
  window.poziworldExtension.background = {
    requestToSimulateExtensionUpdate: requestToSimulateExtensionUpdate,
  };
}

/**
 * Provide an ability to simulate the {@link https://developer.chrome.com/extensions/runtime#event-onInstalled onInstalled} event.
 */

function requestToSimulateExtensionUpdate() {
  browser.management.getSelf()
    .then( checkForDevelopmentMode )
    .then( simulateExtensionUpdate );
}

/**
 * Make sure the extension was loaded unpacked in developer mode ({@link https://developer.chrome.com/extensions/management#type-ExtensionInstallType}).
 *
 * @param {object} extensionInfo - {@link https://developer.chrome.com/extensions/management#type-ExtensionInfo}
 * @returns {Promise<never>|Promise<void>}
 */

function checkForDevelopmentMode( extensionInfo ) {
  if ( extensionInfo.installType === EXTENSION_INSTALL_TYPE_DEVELOPMENT ) {
    return Promise.resolve();
  }

  return Promise.reject();
}

/**
 * Simulate the {@link https://developer.chrome.com/extensions/runtime#event-onInstalled onInstalled} event.
 */

function simulateExtensionUpdate() {
  Background.cleanUp( true, {
    boolWasUpdated: false,
  } );
}

/**
 * Check whether localStorage is available (can write into it and read from it).
 *
 * @return {boolean}
 */

function isLocalStorageAvailable() {
  try {
    localStorage.setItem( 'sttbTest', 'test' );
    localStorage.getItem( 'sttbTest' );
    localStorage.removeItem( 'sttbTest' );

    return true;
  }
  catch ( e ) {
    return false;
  }
}

/* =============================================================================

  Listeners

 ============================================================================ */

/**
 * Fired when the extension is first installed, when the extension is updated to a new version, and when browser is updated to a new version.
 *
 * @param {Object} objDetails - Reason (install/update/chrome_update) and (optional) previous version.
 */

browser.runtime.onInstalled.addListener(
  function( objDetails ) {
    settingsHelpers.signalSettingsNotReady();
    Background.preventCheckForSilentUpdate();

    strLog = strConstLogOnInstalled;

    // Copy user set-up details
    // TODO: Replace with Object.assign() when supported
    for ( var miscProperty in objConstUserSetUp ) {
      if ( objConstUserSetUp.hasOwnProperty( miscProperty ) ) {
        objDetails[ miscProperty ] = objConstUserSetUp[ miscProperty ];
      }
    }

    Log.add( strLog, objDetails, true );

    Background.cleanUp( true, objDetails );

    if (  objDetails.reason === 'update'
      &&  typeof objDetails.previousVersion === 'string'
      &&  objDetails.previousVersion < strConstExtensionVersion
    ) {
      Background.onUpdatedCallback( strLog, objDetails );
    }
  }
);

/**
 * Fired when a profile that has this extension installed first starts up.
 */

browser.runtime.onStartup && browser.runtime.onStartup.addListener(
  function() {
    settingsHelpers.signalSettingsNotReady();
    Background.preventCheckForSilentUpdate();

    strLog = 'browser.runtime.onStartup';
    Log.add( strLog, {}, true );

    Background.cleanUp();
  }
);

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initialize.
 */

Background.init();
