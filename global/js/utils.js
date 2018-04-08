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
   * @return {Object} - Object with items in their key-value mappings.
   **/

  Utils.prototype.getStorageItems = function ( Storage, keys, strLog, funcSuccessCallback, funcErrorCallback, objErrorLogDetails, boolTrackError ) {
    Storage.get( keys, function( objReturn ) {
      const strGetStorageItemsLog = strLog;
      Log.add( strLog + strLogDo, keys );

      Global.checkForRuntimeError(
        function() {
          if ( poziworldExtension.utils.isType( funcSuccessCallback, 'function' ) ) {
            funcSuccessCallback( objReturn );
          }

          Log.add( strGetStorageItemsLog + strLogDone, objReturn );
        },
        funcErrorCallback,
        objErrorLogDetails,
        boolTrackError
      );
    } );
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
    Storage.set( objItems, function() {
      const strSetStorageItemsLog = strLog + ', setStorageItems';
      Log.add( strSetStorageItemsLog + strLogDo, objItems );

      Global.checkForRuntimeError(
          function() {
            if ( poziworldExtension.utils.isType( funcSuccessCallback, 'function' ) ) {
              funcSuccessCallback();
            }

            Storage.get( null, function( objAllItemsAfterUpdate ) {
              Log.add( strSetStorageItemsLog + strLogDone, objAllItemsAfterUpdate );
            } );
          }
        , funcErrorCallback
        , objErrorLogDetails
        , boolTrackError
      );
    } );
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

  if ( typeof poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  poziworldExtension.utils = new Utils();
}() );
