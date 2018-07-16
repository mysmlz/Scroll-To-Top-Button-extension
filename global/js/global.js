/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2016 PoziWorld
  File                    :           global/js/global.js
  Description             :           Global JavaScript

  Table of Contents:

    Global
      init()
      setStorageItems()
      isEmpty()
      createTabOrUpdate()
      handleApiError()
      openOptionsPage()

 ============================================================================ */

/* =============================================================================

  Global

 ============================================================================ */

const Global = {
  strOptionsUiUrlPrefix: 'chrome://extensions?options=',

  /**
   * Set multiple items in StorageArea.
   *
   * @param Storage - Target storage. https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage#Properties
   * @param {Object} items - Key-value pairs to update storage with.
   * @param {string} log - Debug line "prefix".
   */

  setStorageItems: function ( Storage, items, log ) {
    Storage.set( items ).then( onStorageItemsSet, onStorageItemsSettingError );

    function onStorageItemsSet() {
      const logTemp = log;
      Log.add( log + strLogDo, items );

      StorageSync.get( null ).then( onUpdatedSettingsRetrieved );

      function onUpdatedSettingsRetrieved( objAllItemsAfterUpdate ) {
        Log.add( logTemp + strLogDone, objAllItemsAfterUpdate );
      }
    }

    function onStorageItemsSettingError( e ) {
      let logDetails = {};
      const strErrorMessage = e.message;

      if ( typeof strErrorMessage === 'string' ) {
        logDetails.strErrorMessage = strErrorMessage;
      }

      Log.add( log + strLogError, logDetails, true );
    }
  }
  ,

  /**
   * Check whether object/array is empty.
   *
   * @param {Object} object - Object to check against.
   * @return {boolean}
   **/

  isEmpty: function ( object ) {
    for ( const key in object ) {
      return false;
    }

    return true;
  }
  ,

  /**
   * Create tab if it is not open or makes it active.
   *
   * @param {string} strUrl - URL to open.
   */

  createTabOrUpdate: function ( strUrl ) {
    if ( typeof strLog === 'string' ) {
      strLog = 'createTabOrUpdate';
      Log.add( strLog, strUrl );
    }

    var objUrl = { url: strUrl };

    if ( ~~strUrl.indexOf( Global.strOptionsUiUrlPrefix ) ) {
      browser.tabs.query( objUrl ).then( onGot );

      function onGot( objTabs ) {
        if ( objTabs.length ) {
          browser.tabs.update( objTabs[ 0 ].id, { active: true } );
        }
        else {
          browser.tabs.create( objUrl );
        }
      }
    }
    else {
      browser.tabs.create( objUrl );
    }
  }
  ,

  /**
   * If extension API call failed.
   *
   * @param e - Error
   * @param {Function} [funcErrorCallback] - Callback on error.
   * @param {Object} [objErrorLogDetails] - Data to be passed on error.
   * @param {boolean} [boolTrackError] - Whether to track error if user participates in UEIP.
   */

  handleApiError: function ( e, funcErrorCallback, objErrorLogDetails, boolTrackError ) {
    if ( typeof objErrorLogDetails !== 'object' ) {
      objErrorLogDetails = {};
    }

    const strErrorMessage = e.message;

    if ( typeof strErrorMessage === 'string' ) {
      objErrorLogDetails.strErrorMessage = strErrorMessage;
    }

    Log.add(
        strLog + strLogError
      , objErrorLogDetails
      , boolTrackError || true
    );

    if ( typeof funcErrorCallback === 'function' ) {
      funcErrorCallback();
    }
  }
  ,

  /**
   * Open Options page.
   *
   * @param {string} caller - Where this was called from (action or event name).
   */

  openOptionsPage: function ( caller ) {
    const openOptionsPage = browser.runtime.openOptionsPage;

    // Edge
    if ( ! poziworldExtension.utils.isType( openOptionsPage, 'function' ) ) {
      Global.createTabOrUpdate( browser.extension.getURL( 'options/index.html' ) );
    }
    else {
      openOptionsPage().then( undefined, onError );

      function onError( e ) {
        Global.handleApiError(
            e
          , undefined
          , { strCaller : caller || '' }
          , true
        );
      }
    }
  }
};
