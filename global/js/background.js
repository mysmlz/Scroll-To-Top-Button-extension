/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2016 PoziWorld
  File                    :           global/js/background.js
  Description             :           Background JavaScript

  Table of Contents:

    Constants
    Background
      init()
      checkIfUpdatedSilently()
      onUpdatedCallback()
      preventCheckForSilentUpdate()
      cleanUp()
      removeOldSettings()
      checkForLegacySettings()
      setDefaults()
      setExtensionDefaults()
      onMessageCallback()
    Listeners
      runtime.onMessage
      runtime.onInstalled
      runtime.onStartup
    On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const
    objSettingsNotSyncable = {
        strLatestTrackedVersion : strConstExtensionVersion
    }
  , objSettingsSyncable = {
        arrDisabledDomains : [
            'docs.google.com'
          , 'docs0.google.com'
          , 'spreadsheets.google.com'
          , 'spreadsheets0.google.com'
        ]
      , arrDisabledUrls : []
    }
  ;

/* =============================================================================

  2. Background

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
    sttb.contextMenus.init();
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
      poziworldExtension.utils.getStorageItems( StorageLocal, 'strLatestTrackedVersion', logTemp, onLatestTrackedVersionRetrieved );

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
          var objDetails = {};

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
   * Do stuff when updated
   *
   * @type    method
   * @param   strLogFromCaller
   *            strLog
   * @param   objDetails
   *            - Optional. Reason - install/update/chrome_update
   *            - Optional. Previous version
   * @return  void
   **/
  onUpdatedCallback : function( strLogFromCaller, objDetails ) {
    strLog = 'onUpdatedCallback';

    // Save this version number
    Global.setStorageItems(
        StorageLocal
      , { strLatestTrackedVersion : strConstExtensionVersion }
      , strLog + ', save version'
    );

    objDetails.boolWasUpdated = true;
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
   * @param {boolean} boolIsCalledFromOnInstalledListener - Whether to set extension defaults on clean-up complete.
   * @param {Object} objDetails - Reason (install/update/chrome_update) and (optional) previous version.
   */

  cleanUp: function ( boolIsCalledFromOnInstalledListener, objDetails ) {
    const logTemp = strLog = 'cleanUp';
    Log.add( strLog );

    // To make removeOldSettings asynchronous.
    // Otherwise, it won't work correctly.
    var arrSettingsToCleanUp = [
      'strDummySetting'
    ];

    // Fails in case of a new install
    StorageLocal.remove( arrSettingsToCleanUp ).then( onSettingsCleanedUp, onSettingsCleanedUp );

    function onSettingsCleanedUp( e ) {
      Log.add( logTemp + ', onSettingsCleanedUp', {
        boolIsCalledFromOnInstalledListener: boolIsCalledFromOnInstalledListener,
        e: e
      } );

      if ( typeof boolIsCalledFromOnInstalledListener === 'boolean' && boolIsCalledFromOnInstalledListener ) {
        Background.removeOldSettings( objDetails );
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
      poziworldExtension.utils.getStorageItems( StorageSync, null, logTemp, onSettingsRetrieved );

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

        for ( miscSetting in objDeprecatedSettings ) {
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

            poziworldExtension.utils.getStorageItems( StorageSync, null, logTemp, onUpdatedSettingsRetrieved );

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
   * v7.0.0 moved settings from localStorage to the syncable storage.
   *
   * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/sync
   */

  checkForLegacySettings: function () {
    const logTemp = strLog = 'checkForLegacySettings';
    Log.add( strLog );

    poziworldExtension.utils.getSettings(
      logTemp,
      moveLegacySettings,
      moveLegacySettings,
      true
    );

    /**
     * If the settings aren't in the Storage yet.
     *
     * @param {Object} settings - Key-value pairs.
     */

    function moveLegacySettings( settings ) {
      if ( ! poziworldExtension.utils.isType( settings, 'object' ) || Global.isEmpty( settings ) ) {
        const newSettings = {};
        const availableSettings = {
          buttonMode: [
            'stbb',
            'off'
          ],
          scrollUpSpeed: [
            'scroll_speed',
            1000
          ],
          scrollDownSpeed: [
            'scroll_speed2',
            1000
          ],
          distanceLength: [
            'distance_length',
            400
          ],
          buttonSize: [
            'size',
            '50px'
          ],
          buttonDesign: [
            'arrow',
            'arrow_blue'
          ],
          buttonLocation: [
            'location',
            'TR'
          ],
          notActiveButtonOpacity: [
            'transparency',
            '0.5'
          ],
          keyboardShortcuts: [
            'shortcuts',
            'arrows'
          ],
          contextMenu: [
            'contextmenu',
            'on'
          ],
          homeEndKeysControlledBy: [
            'homeendaction',
            'sttb'
          ],
          scroll: [
            'scroll',
            'jswing'
          ]
        };

        let localStorageAvailable;

        try {
          localStorage.setItem( 'sttbTest', 'test' );
          localStorage.getItem( 'sttbTest' );
          localStorage.removeItem( 'sttbTest' );

          localStorageAvailable = true;
        }
        catch ( e ) {
          localStorageAvailable = false;
        }

        for ( const settingName in availableSettings ) {
          if ( availableSettings.hasOwnProperty( settingName ) ) {
            const setting = availableSettings[ settingName ];
            let oldValue;

            if ( localStorageAvailable ) {
              const oldKey = setting[ 0 ];

              oldValue = localStorage.getItem( oldKey );
              localStorage.removeItem( oldKey );
            }

            newSettings[ settingName ] = oldValue || setting[ 1 ];
          }
        }

        if ( ! Global.isEmpty( newSettings ) ) {
          const storageObject = {
            settings: newSettings
          };

          poziworldExtension.utils.setStorageItems(
            StorageSync,
            storageObject,
            logTemp,
            sttb.contextMenus.init
          );

          if ( localStorageAvailable ) {
            localStorage.removeItem( 'latest' );
          }
        }
      }
    }
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
    let logTemp = strLog = 'setDefaults';

    poziworldExtension.utils.getStorageItems( StorageSync, null, logTemp, onSettingsRetrieved );

    function onSettingsRetrieved( objReturn ) {
      logTemp += ', ' + strLogSuffix;
      Log.add( logTemp );

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
        Global.setStorageItems( Storage, objTempToSet, logTemp );
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
    Background.checkForLegacySettings();
    Background.setDefaults( StorageLocal,  objSettingsNotSyncable,   'local' );
    Background.setDefaults( StorageSync,   objSettingsSyncable,      'sync'  );
  }
  ,

  /**
   * Listen for messages from other parts of the extension.
   *
   * @param {Object} message
   * @param {Object} sender
   * @param {Function} sendResponse
   */

  onMessageCallback: function ( message, sender, sendResponse ) {
    strLog = 'onMessageCallback';
    Log.add( strLog, message );

    if ( message.greeting === 'settings' ) {
      const tabId = sender.tab.id;

      poziworldExtension.utils.getSettings(
        strLog,
        onSettingsRetrieved,
        undefined,
        true
      );

      /**
       * Send the settings back to the requester.
       *
       * @param {Object} settings - Key-value pairs.
       */

      function onSettingsRetrieved( settings ) {
        if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
          browser.tabs.sendMessage( tabId, settings );
        }
      }
    }
  }
};

/* =============================================================================

  Listeners

 ============================================================================ */

/**
 * Listens for messages.
 *
 * @param {Object} objMessage - Message received.
 * @param {Object} objSender - Sender of the message.
 */

browser.runtime.onMessage.addListener(
  function( objMessage, objSender, objSendResponse ) {
    Background.preventCheckForSilentUpdate();

    Background.onMessageCallback( objMessage, objSender, objSendResponse );
  }
);

/**
 * Fired when the extension is first installed, when the extension is updated to a new version, and when browser is updated to a new version.
 *
 * @param {Object} objDetails - Reason (install/update/chrome_update) and (optional) previous version.
 */

browser.runtime.onInstalled.addListener(
  function( objDetails ) {
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
