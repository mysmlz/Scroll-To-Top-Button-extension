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
      convertArrToObj()
      returnIndexOfSubitemContaining()
      createTabOrUpdate()
      checkForRuntimeError()
      openOptionsPage()
    On Load
      Initialize

 ============================================================================ */

/* =============================================================================

  Global

 ============================================================================ */

var Global                        = {
    strOptionsUiUrlPrefix         : 'chrome://extensions?options='
  ,

  /**
   * Things to do on initialization.
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
  }
  ,

  /**
   * Sets multiple items in StorageArea.
   *
   * @type    method
   * @param   Storage
   *            Target storage
   * @param   objItems
   *            An object which gives each key/val pair to update storage with.
   * @param   strLog
   *            Debug line "prefix".
   * @return  void
   **/
  setStorageItems : function( Storage, objItems, strLog ) {
    Storage.set( objItems, function() {
      var strSetStorageItemsLog = strLog;
      Log.add( strLog + strLogDo, objItems );

      if ( chrome.runtime.lastError ) {
        var
            objLogDetails   = {}
          , strErrorMessage = chrome.runtime.lastError.message
          ;

        if ( typeof strErrorMessage === 'string' )
          objLogDetails.strErrorMessage = strErrorMessage;

        Log.add( strLog + strLogError, objLogDetails, true );
        return;
      }

      Storage.get( null, function( objAllItemsAfterUpdate ) {
        Log.add( strSetStorageItemsLog + strLogDone, objAllItemsAfterUpdate );
      });
    });
  }
  ,

  /**
   * Checks whether object/array is empty.
   *
   * @type    method
   * @param   objToTest
   *            Object to check against
   * @return  bool
   **/
  isEmpty : function ( objToTest )
  {
    for ( var i in objToTest )
      return false;

    return true;
  }
  ,

  /**
   * Makes an object out of an array
   *
   * @type    method
   * @param   arrToConvert
   *            Array to convert
   * @return  object
   **/
  convertArrToObj : function ( arrToConvert )
  {
    return obj = arrToConvert.reduce(
        function( o, v, i ) {
          o[ i ] = v;
          return o;
        }
      , {}
    );
  }
  ,

  /**
   * Finds item in subarray, returns its index.
   *
   * @type    method
   * @param   arrContainer
   *            Array containing arrays/objects
   * @param   miscItem
   *            What to look for
   * @param   miscProp
   *            Array index or object key
   * @return  integer
   **/
  returnIndexOfSubitemContaining : function ( arrContainer, miscItem, miscProp )
  {
    return arrContainer
            .map(
              function ( miscSub ) {
                miscProp = ( typeof miscProp === 'undefined' ) ? 0 : miscProp;

                return miscSub[ miscProp ]
              }
            )
              .indexOf( miscItem );
  }
  ,

  /**
   * Creates tab if it is not open or makes it active
   *
   * @type    method
   * @param   strUrl
   *            URL to open
   * @return  void
   **/
  createTabOrUpdate : function ( strUrl )
  {
    if ( typeof strLog === 'string' ) {
      strLog = 'createTabOrUpdate';
      Log.add( strLog, strUrl );
    }

    var objUrl = { url: strUrl };

    if ( ~~strUrl.indexOf( Global.strOptionsUiUrlPrefix ) ) {
      chrome.tabs.query( objUrl, function( objTabs ) {
        if ( objTabs.length )
          chrome.tabs.update( objTabs[ 0 ].id, { active: true } );
        else
          chrome.tabs.create( objUrl );
      } );
    }
    else
      chrome.tabs.create( objUrl );
  }
  ,

  /**
   * Runtime sets an error variable when some call failed.
   *
   * @type    method
   * @param   funcCallback
   *            Do when runtime error is not set.
   * @param   funcErrorCallback
   *            Optional. Callback on error.
   * @param   objErrorLogDetails
   *            Optional. Data to be passed on error.
   * @param   boolTrackError
   *            Optional. Whether to track error if user participates in UEIP.
   * @return  boolean
   **/
  checkForRuntimeError : function(
      funcCallback
    , funcErrorCallback
    , objErrorLogDetails
    , boolTrackError
  ) {
    if ( chrome.runtime.lastError ) {
      if ( typeof objErrorLogDetails !== 'object' ) {
        objErrorLogDetails = {};
      }

      var strErrorMessage = chrome.runtime.lastError.message;

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
    else if ( typeof funcCallback === 'function' ) {
      funcCallback();
    }
  }
  ,

  /**
   * Opens Options page.
   *
   * @type    method
   * @param   strCaller
   *            Where this was called from (action or event name).
   * @return  boolean
   **/
  openOptionsPage : function( strCaller ) {
    if ( boolConstIsBowserAvailable && strConstChromeVersion >= '42.0' ) {
      chrome.runtime.openOptionsPage( function() {
        Global.checkForRuntimeError(
            undefined
          , undefined
          , { strCaller : strCaller || '' }
          , true
        );
      } );
    }
    else {
      // Link to new Options UI for 40+
      var strOptionsUrl =
            boolConstUseOptionsUi
              ? 'chrome://extensions?options=' + strConstExtensionId
              : chrome.extension.getURL( 'options/index.html' )
              ;

      Global.createTabOrUpdate( strOptionsUrl );
    }
  }
};

/* =============================================================================

  On Load

 ============================================================================ */

/**
 * Initializes.
 *
 * @type    method
 * @param   No Parameters taken
 * @return  void
 **/
Global.init();
