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
        strType: strType,
      },
      false,
      {
        level: 'debug',
      },
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
