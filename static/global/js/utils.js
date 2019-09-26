/* =============================================================================

  Scroll To Top Button
  © 2013-2018 PoziWorld, Inc.
  https://scroll-to-top-button.com

 ============================================================================ */

/**
 * Callback in case of success.
 *
 * @callback funcSuccessCallback
 */

/**
 * Callback in case of error.
 *
 * @callback funcErrorCallback
 */

( function () {
  'use strict';

  /**
   * @constructor
   */

  function Utils() {
  }

  /**
   * Get one or more items from storage.
   *
   * @param {Storage} Storage - StorageSync or StorageLocal.
   * @param {(string|string[]|Object)} [keys] - A single key to get, list of keys to get, or a dictionary specifying default values (see description of the object). An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
   * @param {string} strLog - Debug line "prefix".
   * @param {funcSuccessCallback} [funcSuccessCallback] - Function to run on success.
   * @param {funcErrorCallback} [funcErrorCallback] - Function to run on error.
   * @param {Object} [objErrorLogDetails] - Data to be passed on error.
   * @param {boolean} [boolTrackError] - Whether to track error if user participates in UEIP.
   * @return {*}
   */

  Utils.prototype.getStorageItems = function ( Storage, keys, strLog, funcSuccessCallback, funcErrorCallback, objErrorLogDetails, boolTrackError ) {
    return Storage.get( keys ).then( onStorageItemsRetrieved, onStorageItemsRetrievalError );

    function onStorageItemsRetrieved( objReturn ) {
      const strGetStorageItemsLog = strLog + ', getStorageItems';
      Log.add( strGetStorageItemsLog + strLogDo, keys );

      if ( poziworldExtension.utils.isType( funcSuccessCallback, 'function' ) ) {
        funcSuccessCallback( objReturn );
      }

      Log.add( strGetStorageItemsLog + strLogDone, objReturn );
    }

    function onStorageItemsRetrievalError( e ) {
      Global.handleApiError( e, funcErrorCallback, objErrorLogDetails, boolTrackError );
    }
  };

  /**
   * Get one or more items from storage.
   *
   * @param {Storage} Storage - StorageSync or StorageLocal.
   * @param {Object} objItems - An object which gives each key/val pair to update storage with.
   * @param {string} strLog - Debug line "prefix".
   * @param {funcSuccessCallback} [funcSuccessCallback] - Function to run on success.
   * @param {funcErrorCallback} [funcErrorCallback] - Function to run on error.
   * @param {Object} [objErrorLogDetails] - Data to be passed on error.
   * @param {boolean} [boolTrackError] - Whether to track error if user participates in UEIP.
   * @return {Object} - Object with items in their key-value mappings.
   **/

  Utils.prototype.setStorageItems = function ( Storage, objItems, strLog, funcSuccessCallback, funcErrorCallback, objErrorLogDetails, boolTrackError ) {
    Storage.set( objItems ).then( onStorageItemsSet, onStorageItemsSettingError );

    function onStorageItemsSet() {
      const strSetStorageItemsLog = strLog + ', setStorageItems';
      Log.add( strSetStorageItemsLog + strLogDo, objItems );

      if ( poziworldExtension.utils.isType( funcSuccessCallback, 'function' ) ) {
        funcSuccessCallback();
      }

      poziworldExtension.utils.getStorageItems( StorageSync, null, strLog, onUpdatedSettingsRetrieved );

      function onUpdatedSettingsRetrieved( objAllItemsAfterUpdate ) {
        Log.add( strSetStorageItemsLog + strLogDone, objAllItemsAfterUpdate );
      }
    }

    function onStorageItemsSettingError( e ) {
      Global.handleApiError( e, funcErrorCallback, objErrorLogDetails, boolTrackError );
    }
  };

  /**
   * Get the main extension settings (the ones set on the Options page).
   *
   * @param {string} logPrefix - Debug line "prefix".
   * @param {funcSuccessCallback} [successCallback] - Function to run on success.
   * @param {funcErrorCallback} [errorCallback] - Function to run on error.
   * @param {boolean} [trackableError] - Whether to track error if user participates in UEIP.
   **/

  Utils.prototype.getSettings = function ( logPrefix, successCallback, errorCallback, trackableError ) {
    this.getStorageItems(
      StorageSync,
      'settings',
      logPrefix,
      this._verifySettings.bind( this, logPrefix, successCallback, errorCallback ),
      errorCallback,
      undefined,
      trackableError
    );
  };

  /**
   * Set/update the main extension settings (the ones set on the Options page).
   *
   * @param {Object} settings - Key-value pairs to save in the Storage.
   * @param {string} logPrefix - Debug line "prefix".
   * @param {funcSuccessCallback} [successCallback] - Function to run on success.
   * @param {funcErrorCallback} [errorCallback] - Function to run on error.
   **/

  Utils.prototype.setSettings = function ( settings, logPrefix, successCallback, errorCallback ) {
    if ( this.isType( settings, 'object' ) && ! Global.isEmpty( settings ) ) {
      this.getSettings(
        logPrefix,
        this._mergeSettings.bind( this, settings, logPrefix, successCallback, errorCallback ),
        errorCallback
      );
    }
  };

  /**
   * Due to the nature of the Storage, the Storage "get" request wraps the requested item into an object.
   * Check whether the returned object actually contains the settings object and it's not empty.
   *
   * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/StorageArea/get
   *
   * @param {string} logPrefix - Debug line "prefix".
   * @param {funcSuccessCallback} [successCallback] - Function to run on success.
   * @param {funcErrorCallback} [errorCallback] - Function to run on error.
   * @param {Object} [storageData] - Object wrapping the requested Storage data.
   * @return {boolean} - Whether the operation succeeded and the settings returned in the correct format.
   **/

  Utils.prototype._verifySettings = function ( logPrefix, successCallback, errorCallback, storageData ) {
    if ( poziworldExtension.utils.isType( storageData, 'object' ) && ! Global.isEmpty( storageData ) ) {
      let settingsInStorage = storageData.settings;

      if ( poziworldExtension.utils.isType( settingsInStorage, 'object' ) && ! Global.isEmpty( settingsInStorage ) ) {
        if ( poziworldExtension.utils.isType( successCallback, 'function' ) ) {
          successCallback( settingsInStorage );
        }

        return true;
      }
    }

    if ( poziworldExtension.utils.isType( errorCallback, 'function' ) ) {
      errorCallback();
    }

    return false;
  };

  /**
   * Due to the nature of the Storage, in order to update even one setting, its value needs to be merged with the rest of existing settings in the Storage. Otherwise, all other ones will be destroyed.
   *
   * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/sync
   *
   * @param {Object} settings - An object which gives each key/val pair to update storage with.
   * @param {string} logPrefix - Debug line "prefix".
   * @param {funcSuccessCallback} [successCallback] - Function to run on success.
   * @param {funcErrorCallback} [errorCallback] - Function to run on error.
   * @param {Object} [settingsInStorage] - An object wrapping the requested Storage data.
   **/

  Utils.prototype._mergeSettings = function ( settings, logPrefix, successCallback, errorCallback, settingsInStorage ) {
    if ( poziworldExtension.utils.isType( settingsInStorage, 'object' ) ) {
      Object.assign( settingsInStorage, settings );

      this.setStorageItems(
        StorageSync,
        {
          settings: settingsInStorage
        },
        logPrefix,
        successCallback,
        errorCallback
      );
    }
  };

  /**
   * Check whether the type of the parameter matches the provided string.
   *
   * @param {*} param
   * @param {string} strType - The target type in lowercase.
   */

  Utils.prototype.isType = function ( param, strType ) {
    strLog = 'poziworldExtension.utils.isType';
    Log.add(
      strLog,
      {
        param: param,
        strType: strType
      }
    );

    return Object.prototype.toString.call( param ).slice( 8, -1 ).toLowerCase() === strType;
  };

  /**
   * Check whether the provided value is of 'string' type and non-empty.
   *
   * @param {*} value
   * @return {boolean}
   */

  Utils.prototype.isNonEmptyString = function ( value ) {
    return this.isType( value, 'string' ) && value !== '';
  };

  if ( typeof poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  poziworldExtension.utils = new Utils();
}() );
