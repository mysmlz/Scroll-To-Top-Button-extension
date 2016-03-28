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
      setLegacyDefaults()
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
  }
  ,

  /**
   * When updated on a browser start-up or when the extension was disabled,
   * it doesn't fire onInstalled, and that causes the new settings
   * not being applied
   *
   * TODO: utilize chrome.management.onEnabled.addListener(function callback)
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  checkIfUpdatedSilently : function() {
    var funcCheck = function() {
      StorageLocal.get( 'strLatestTrackedVersion', function( objReturn ) {
        strLog = 'checkIfUpdatedSilently';
        Log.add( strLog, {} );

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
          Background.onUpdatedCallback( strLog, objDetails );
        }
      });
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
   * @type    method
   * @param   boolIsCalledFromOnInstalledListener
   *            Whether to set extension defaults on clean-up complete
   * @param   objDetails
   *            Reason - install/update/chrome_update -
   *            and (optional) previous version
   * @return  void
   **/
  cleanUp : function( boolIsCalledFromOnInstalledListener, objDetails ) {
    strLog = 'cleanUp';
    Log.add( strLog );

    // To make removeOldSettings asynchronous.
    // Otherwise, it won't work correctly.
    var arrSettingsToCleanUp = [
        'strDummySetting'
    ];

    StorageLocal.remove( arrSettingsToCleanUp, function() {
      if (  typeof boolIsCalledFromOnInstalledListener === 'boolean'
        &&  boolIsCalledFromOnInstalledListener
      ) {
        Background.removeOldSettings( objDetails );
      }
    } );
  }
  ,

  /**
   * Remove old settings when updated to a newer version
   * (some vars could have been renamed, deprecated)
   *
   * @type    method
   * @param   objDetails
   *            Reason - install/update/chrome_update - 
   *            and (optional) previous version
   * @return  void
   **/
  removeOldSettings : function( objDetails ) {
    strLog = 'removeOldSettings';
    Log.add( strLog, objDetails );

    if (  typeof objDetails.boolWasUpdated === 'boolean'
      &&  objDetails.boolWasUpdated
    ) {
      StorageSync.get( null, function( objReturn ) {
        strLog = 'removeOldSettings';

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
          StorageSync.remove( arrSettingsToRemove, function() {
            strLog = 'removeOldSettings';
            Log.add( strLog + strLogDo, arrSettingsToRemove, true );

            if ( chrome.runtime.lastError ) {
              var objLogDetails = {}
                , strErrorMessage = chrome.runtime.lastError.message
                ;

              if ( typeof strErrorMessage === 'string' ) {
                objLogDetails = { strErrorMessage: strErrorMessage };
              }

              Log.add( strLog + strLogError, objLogDetails, true );
              return;
            }

            StorageSync.get( null, function( objData ) {
              strLog = 'removeOldSettings';
              Log.add( strLog + strLogDone, objData );
            });

            Background.setExtensionDefaults();
          });
        }
        else {
          Log.add( strLog + strLogDoNot );

          Background.setExtensionDefaults();
        }
      });
    }
    else {
      Log.add( strLog + strLogDoNot );
      
      Background.setExtensionDefaults();
    }
  }
  ,

  /**
   * Set extension defaults in case user hasn't set them yet
   *
   * TODO: Move to setDefaults() with chrome.storage
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setLegacyDefaults : function() {
    strLog = 'setLegacyDefaults';
    Log.add( strLog );

    if ( ! localStorage[ 'scroll_speed' ] ) {
      localStorage[ 'scroll_speed' ] = 1000;
    }
    if ( ! localStorage[ 'scroll_speed2' ] ) {
      localStorage[ 'scroll_speed2' ] = localStorage[ 'scroll_speed' ];
    }
    if ( ! localStorage[ 'distance_length' ] ) {
      localStorage[ 'distance_length' ] = 400;
    }
    if ( ! localStorage[ 'size' ] ) {
      localStorage[ 'size' ] = '50px';
    }
    if ( ! localStorage[ 'arrow' ] ) {
      localStorage[ 'arrow' ] = 'arrow_blue';
    }
    if ( ! localStorage[ 'location' ] ) {
      localStorage[ 'location' ] = 'TR';
    }
    if ( ! localStorage[ 'stbb' ] ) {
      localStorage[ 'stbb' ] = 'off';
    }
    if ( ! localStorage[ 'transparency' ] ) {
      localStorage[ 'transparency' ] = '0.5';
    }
    if ( ! localStorage[ 'contextmenu' ] ) {
      localStorage[ 'contextmenu' ] = 'on';
    }
    if ( ! localStorage[ 'shortcuts' ] ) {
      localStorage[ 'shortcuts' ] = 'arrows';
    }
    if ( ! localStorage[ 'homeendaction' ] ) {
      localStorage[ 'homeendaction' ] = 'sttb';
    }
    if ( localStorage[ 'stbb' ] === 'on' ) {
      localStorage[ 'stbb' ] = 'flip';
    }
    if ( localStorage[ 'latest' ] != '2' ) {
      localStorage[ 'latest' ] = '2';
      Global.openOptionsPage( strLog );
    }
  }
  ,

  /**
   * Set extension defaults
   *
   * @type    method
   * @param   Storage
   *            StorageSync or StorageLocal
   * @param   objSettings
   *            Default settings
   * @param   strLogSuffix
   *            Type of storage to report in the log
   * @return  void
   **/
  setDefaults : function( Storage, objSettings, strLogSuffix ) {
    Storage.get( null, function( objReturn ) {
      strLog = 'setExtensionDefaults, ' + strLogSuffix;
      Log.add( strLog );

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
        Global.setStorageItems( Storage, objTempToSet, strLog );
      }
      else {
        Log.add( strLog + strLogDoNot );
      }
    });
  }
  ,

  /**
   * Set extension defaults
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  setExtensionDefaults : function() {
    Background.setLegacyDefaults();
    Background.setDefaults( StorageLocal,  objSettingsNotSyncable,   'local' );
    Background.setDefaults( StorageSync,   objSettingsSyncable,      'sync'  );
  }
  ,

  /**
   * Processes messages
   *
   * @type    method
   * @param   objMessage
   *            Message received
   * @param   objSender
   *            Sender of a message
   * @param   boolExternal
   *            Optional. Whether a message is sent from another extension/app
   * @return  void
   **/
  onMessageCallback : function(
      objMessage
    , objSender
    , objSendResponse
    , boolExternal
  ) {
    strLog = 'onMessageCallback';
    Log.add( strLog, objMessage );

    // TODO: Switch to chrome.storage
    if ( objMessage.greeting === 'settings' ) {
      objSendResponse( {
          speed         : localStorage[ 'scroll_speed' ]
        , speed2        : localStorage[ 'scroll_speed2' ]
        , distance      : localStorage[ 'distance_length' ]
        , size          : localStorage[ 'size' ]
        , arrow         : localStorage[ 'arrow' ]
        , scroll        : 'jswing'
        , location      : localStorage[ 'location' ]
        , stbb          : localStorage[ 'stbb' ]
        , transparency  : localStorage[ 'transparency' ]
        , shortcuts     : localStorage[ 'shortcuts' ]
        , homeendaction : localStorage[ 'homeendaction' ]
      } );
    }
  }
};

/* =============================================================================

  Listeners

 ============================================================================ */

/**
 * Listens for messages
 *
 * @type    method
 * @param   objMessage
 *            Message received
 * @param   objSender
 *            Sender of the message
 * @return  void
 **/
chrome.runtime.onMessage.addListener(
  function( objMessage, objSender, objSendResponse ) {
    Background.preventCheckForSilentUpdate();

    Background.onMessageCallback( objMessage, objSender, objSendResponse );
  }
);

/**
 * Fired when the extension is first installed, 
 * when the extension is updated to a new version, 
 * and when browser is updated to a new version.
 *
 * @type    method
 * @param   objDetails
 *            Reason - install/update/chrome_update - 
 *            and (optional) previous version
 * @return  void
 **/
chrome.runtime.onInstalled.addListener(
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
 *
 * @type    method
 * @param   No Parameters Taken
 * @return  void
 **/
chrome.runtime.onStartup.addListener(
  function() {
    Background.preventCheckForSilentUpdate();

    strLog = 'chrome.runtime.onStartup';
    Log.add( strLog, {}, true );

    Background.cleanUp();
  }
);

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initialize
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Background.init();
