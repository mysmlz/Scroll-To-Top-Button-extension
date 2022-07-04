/* =============================================================================

  Scroll To Top Button
  © 2013-2018 PoziWorld, Inc.
  https://scroll-to-top-button.com

 ============================================================================ */

( function () {
  'use strict';

  function ReferralPrograms() {
    /**
     * @typedef {Object} Tab
     * @property {number} intId
     * @property {number} intWindowId
     * @property {string} strUrl
     * @property {string} strDomain
     * @property {string} [strReferralProgramName]
     */

    /**
     * Function to call (at most once) when there is a response. The argument should be any JSON-ifiable object.
     *
     * @callback ReferralPrograms~funcSendResponse
     */

    /**
     * If STTB participates in the referral program of the active tab site.
     *
     * @private
     */

    let strName = '';

    /**
     * If STTB participates in the referral program of the active tab site.
     *
     * @type {StorageArea}
     * @private
     */

    const NotificationStorageArea = StorageSync;

    /**
     * The key for the notification settings in the storage.
     *
     * @type {string}
     * @private
     */

    const strNotificationSettingsKey = 'arrDisabledReferralProgramNotifications';

    /**
     * Return a referral program name.
     *
     * @return {string}
     */

    ReferralPrograms.prototype.getName = function () {
      strLog = 'poziworldExtension.referralPrograms.getName';
      Log.add( strLog );

      return strName;
    };

    /**
     * Remember a referral program name.
     *
     * @param {string} strNameToSet - The name of the referral program.
     * @return {boolean} - Whether the operation succeeded.
     */

    ReferralPrograms.prototype.setName = function ( strNameToSet ) {
      strLog = 'poziworldExtension.referralPrograms.setName';
      Log.add( strLog, strNameToSet );

      if ( typeof strNameToSet === 'string' && strNameToSet !== '' ) {
        strName = strNameToSet;

        return true;
      }

      return false;
    };

    /**
     * Return the StorageArea notification settings are in.
     *
     * @return {StorageArea}
     */

    ReferralPrograms.prototype.getNotificationStorageArea = function () {
      return NotificationStorageArea;
    };

    /**
     * Return the key for the notification settings in the storage.
     *
     * @return {string}
     */

    ReferralPrograms.prototype.getNotificationSettingsKey = function () {
      return strNotificationSettingsKey;
    };

    this.init();
  }

  /**
   * Initialize.
   */

  ReferralPrograms.prototype.init = function () {
    strLog = 'poziworldExtension.referralPrograms.init';
    Log.add( strLog );

    window.poziworldExtension.tabs.onActiveTabsChange.addListener( this.detectActiveTabsReferralPrograms.bind( this ) );
    browser.runtime.onMessage.addListener( this.handleMessage.bind( this ) );
  };

  /**
   * Detect referral programs that the active tabs sites might have.
   */

  ReferralPrograms.prototype.detectActiveTabsReferralPrograms = function () {
    strLog = 'poziworldExtension.referralPrograms.detectActiveTabsReferralPrograms';
    Log.add( strLog );

    const arrActiveTabs = window.poziworldExtension.tabs.getSavedActiveTabs();

    if ( Array.isArray( arrActiveTabs ) ) {
      for ( let i = 0, l = arrActiveTabs.length; i < l; i++ ) {
        this.detectReferralProgram( arrActiveTabs[ i ] );
      }
    }
  };

  /**
   * Check whether the current active tab site has a referral program.
   *
   * @param {Tab} objTab
   * @return {boolean} - Whether the operation succeeded.
   */

  ReferralPrograms.prototype.detectReferralProgram = function ( objTab ) {
    strLog = 'poziworldExtension.referralPrograms.detectReferralProgram';
    Log.add( strLog, objTab );

    /**
     * @todo Make the following check a method and return an exception instead.
     */

    if ( ! window.poziworldExtension.utils.isType( objTab, 'object' ) || Global.isEmpty( objTab ) ) {
      return false;
    }

    let strName;

    if ( this.isAmazonDomain( objTab ) ) {
      strName = 'amazon';
    }

    if ( this.setName( strName ) ) {
      objTab.strReferralProgramName = this.getName();

      return window.poziworldExtension.tabs.saveActiveTab( objTab, true ) && this.notifyUser( objTab );
    }

    return false;
  };

  /**
   * Get user's attention when the current active tab site has a referral program STTB participates in.
   *
   * @param {Tab} objTab
   * @return {boolean} - Whether the operation succeeded.
   */

  ReferralPrograms.prototype.notifyUser = function ( objTab ) {
    strLog = 'poziworldExtension.referralPrograms.notifyUser';
    Log.add( strLog, objTab );

    const strName = this.getName();
    const intTabId = objTab.intId;

    this.getNotificationSettingsFromStorage( function ( boolIsEnabled ) {
      // @todo Remove? Amazon doesn't approve the application and this doesn't work in a browser action mode.
      browser.browserAction.setBadgeText( {
        text: boolIsEnabled ?
          window.poziworldExtension.i18n.getMessage( 'referralProgramInfoShortTitle_' + strName ) :
          '',
        tabId: intTabId
      } );

      browser.browserAction.setTitle( {
        title: boolIsEnabled ?
          window.poziworldExtension.i18n.getMessage( 'referralProgramInfoTitle_' + strName ) :
          '',
        tabId: intTabId
      } );
    } );

    return true;
  };

  /**
   * Fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
   *
   * @param {*} message - The message sent by the calling script.
   * @param {Object} objSender - An object containing information about the script context that sent a message or request.
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {boolean} - If true, indicate that the response function will be called asynchronously.
   */

  ReferralPrograms.prototype.handleMessage = function ( message, objSender, funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleMessage';
    Log.add(
      strLog,
      {
        message: message,
        objSender: objSender,
        funcSendResponse: funcSendResponse
      }
    );

    if ( window.poziworldExtension.utils.isType( message, 'object' ) && ! Global.isEmpty( message ) ) {
      const objSttbApiRequest = message.objSttbApiRequest;

      if ( window.poziworldExtension.utils.isType( objSttbApiRequest, 'object' ) && ! Global.isEmpty( objSttbApiRequest ) ) {
        const strCall = objSttbApiRequest.strCall;

        if ( window.poziworldExtension.utils.isType( strCall, 'string' ) && strCall !== '' ) {
          const arrCall = strCall.split( '/' );
          const strPrimaryCall = arrCall[ 0 ];

          switch ( strPrimaryCall ) {
            case 'referral-program':
              this.handleApiRequest( objSttbApiRequest, funcSendResponse );

              return true;
          }
        }
      }
    }

    return false;
  };

  /**
   * Fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
   *
   * @param {Object} objSttbApiRequest - The details of the request.
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {boolean} - Whether the operation succeeded.
   */

  ReferralPrograms.prototype.handleApiRequest = function ( objSttbApiRequest, funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleApiRequest';
    Log.add(
      strLog,
      {
        objSttbApiRequest: objSttbApiRequest,
        funcSendResponse: funcSendResponse
      }
    );

    const arrCall = objSttbApiRequest.strCall.split( '/' );
    const strSecondaryCall = arrCall[ 1 ];
    const strMethod = objSttbApiRequest.strMethod;


    if ( window.poziworldExtension.utils.isType( strMethod, 'string' ) && strMethod !== '' ) {
      switch ( strSecondaryCall ) {
        case 'notification-settings':
          switch ( strMethod ) {
            case 'GET':
              return this.handleApiGetNotificationSettingsRequest( funcSendResponse );
            case 'POST':
              return this.handleApiSetNotificationSettingsRequest( objSttbApiRequest.objData, funcSendResponse );
          }

          break;
        default:
          switch ( strMethod ) {
            case 'GET':
              return this.handleApiGetNameRequest( funcSendResponse );
          }
      }
    }

    return false;
  };

  /**
   * Fired when a message is sent from either an extension process (by runtime.sendMessage) or a content script (by tabs.sendMessage).
   *
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {boolean} - If true, indicate that the response function will be called asynchronously.
   */

  ReferralPrograms.prototype.handleApiGetNameRequest = function ( funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleApiGetNameRequest';
    Log.add( strLog, funcSendResponse );

    browser.tabs.query( {
      lastFocusedWindow: true,
      active: true
    } ).then( onGot );

    function onGot( arrTabs ) {
      if ( Array.isArray( arrTabs ) ) {
        const objTab = arrTabs[ 0 ];

        if ( window.poziworldExtension.utils.isType( objTab, 'object' ) && ! Global.isEmpty( objTab ) ) {
          const intId = objTab.id;

          if ( window.poziworldExtension.utils.isType( intId, 'number' ) ) {
            const objSavedActiveTab = window.poziworldExtension.tabs.getSavedActiveTab( intId );

            if ( window.poziworldExtension.utils.isType( objSavedActiveTab, 'object' ) && ! Global.isEmpty( objSavedActiveTab ) ) {
              const strReferralProgramName = objSavedActiveTab.strReferralProgramName;

              if ( window.poziworldExtension.utils.isType( strReferralProgramName, 'string' ) && strReferralProgramName !== '' ) {
                funcSendResponse( strReferralProgramName );
              }
            }
          }
        }
      }
    }

    return true;
  };

  /**
   * Get the current notification state (whether enabled or not).
   *
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {boolean} - Whether the operation succeeded.
   */

  ReferralPrograms.prototype.handleApiGetNotificationSettingsRequest = function ( funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleApiGetNotificationSettingsRequest';
    Log.add( strLog, funcSendResponse );

    return this.getNotificationSettingsFromStorage( funcSendResponse ? funcSendResponse.bind( this ) : undefined );
  };

  /**
   * Save the notification settings changes.
   *
   * @param {Object} [objData] - Settings changes.
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {(boolean|Promise)}
   */

  ReferralPrograms.prototype.handleApiSetNotificationSettingsRequest = function ( objData, funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleApiSetNotificationSettingsRequest';
    const strLogLocal = strLog;
    Log.add( strLog, funcSendResponse );

    if ( ! window.poziworldExtension.utils.isType( objData, 'object' ) || Global.isEmpty( objData ) ) {
      return false;
    }

    const boolDisable = objData.boolDisable;

    if ( ! window.poziworldExtension.utils.isType( boolDisable, 'boolean' ) ) {
      return false;
    }

    const _this = this;

    return new Promise( function ( funcResolve, funcReject ) {
      _this.getNotificationSettingsFromStorage( funcResolve, true );
    } )
      .then( function ( objSettings ) {
        let arrDisabledNotificationsToSet = [];
        let arrDisabledNotifications = objSettings[ _this.getNotificationSettingsKey() ];
        const boolFoundDisabledNotifcations = Array.isArray( arrDisabledNotifications );

        if ( boolFoundDisabledNotifcations || window.poziworldExtension.utils.isType( arrDisabledNotifications, 'undefined' ) ) {
          let intIndex = -1;
          let boolIsDisabled = false;

          if ( boolFoundDisabledNotifcations ) {
            intIndex = arrDisabledNotifications.indexOf( _this.getName() );

            boolIsDisabled = intIndex > -1;
          }
          else {
            arrDisabledNotifications = [];
          }

          if ( boolIsDisabled && ! boolDisable ) {
            arrDisabledNotifications.splice( intIndex, 1 );
          }
          else if ( ! boolIsDisabled && boolDisable ) {
            arrDisabledNotifications.push( _this.getName() );
          }

          arrDisabledNotificationsToSet = arrDisabledNotifications;

          objSettings[ _this.getNotificationSettingsKey() ] = arrDisabledNotificationsToSet;

          window.poziworldExtension.utils.setStorageItems(
            _this.getNotificationStorageArea(),
            objSettings,
            strLogLocal,
            function () {
              funcSendResponse();
              _this.detectActiveTabsReferralPrograms();
            }
          );
        }
      } );
  };

  /**
   *
   *
   * @param {ReferralPrograms~funcSendResponse} [funcSendResponse]
   * @return {boolean} - If true, indicate that the response function will be called asynchronously.
   */

  ReferralPrograms.prototype.handleApiGetNameRequest = function ( funcSendResponse ) {
    strLog = 'poziworldExtension.referralPrograms.handleApiGetNameRequest';
    Log.add( strLog, funcSendResponse );

    browser.tabs.query( {
      lastFocusedWindow: true,
      active: true
    } ).then( onGot );

    function onGot( arrTabs ) {
      if ( Array.isArray( arrTabs ) ) {
        const objTab = arrTabs[ 0 ];

        if ( window.poziworldExtension.utils.isType( objTab, 'object' ) && ! Global.isEmpty( objTab ) ) {
          const intId = objTab.id;

          if ( window.poziworldExtension.utils.isType( intId, 'number' ) ) {
            const objSavedActiveTab = window.poziworldExtension.tabs.getSavedActiveTab( intId );

            if ( window.poziworldExtension.utils.isType( objSavedActiveTab, 'object' ) && ! Global.isEmpty( objSavedActiveTab ) ) {
              const strReferralProgramName = objSavedActiveTab.strReferralProgramName;

              if ( window.poziworldExtension.utils.isType( strReferralProgramName, 'string' ) && strReferralProgramName !== '' ) {
                funcSendResponse( strReferralProgramName );
              }
            }
          }
        }
      }
    }

    return true;
  };

  /**
   * Get the current notification state (whether enabled) from the storage.
   *
   * @param {funcSuccessCallback} [funcSuccessCallback] - Function to run on success.
   * @param {boolean} [boolReturnStorageObject] - Instead of returning the status (whether enabled or not), return raw storage data object.
   * @return {Promise}
   */

  ReferralPrograms.prototype.getNotificationSettingsFromStorage = function ( funcSuccessCallback, boolReturnStorageObject ) {
    strLog = 'poziworldExtension.referralPrograms.getNotificationSettingsFromStorage';
    Log.add( strLog );

    const _this = this;

    return new Promise( function ( funcResolve, funcReject ) {
      window.poziworldExtension.utils.getStorageItems(
        _this.getNotificationStorageArea(),
        _this.getNotificationSettingsKey(),
        strLog,
        funcResolve,
        funcReject
      );
    } )
      .then( function ( objSettings ) {
        if ( window.poziworldExtension.utils.isType( objSettings, 'object' ) ) {
          const arrDisabledNotifications = objSettings[ _this.getNotificationSettingsKey() ];
          const boolFoundDisabledNotifcations = Array.isArray( arrDisabledNotifications );

          if ( boolFoundDisabledNotifcations || window.poziworldExtension.utils.isType( arrDisabledNotifications, 'undefined' ) ) {
            let boolIsEnabled = true;

            if ( boolFoundDisabledNotifcations ) {
              const intIndex = arrDisabledNotifications.indexOf( _this.getName() );

              boolIsEnabled = intIndex === -1;
            }

            if ( window.poziworldExtension.utils.isType( funcSuccessCallback, 'function' ) ) {
              boolReturnStorageObject = window.poziworldExtension.utils.isType( boolReturnStorageObject, 'boolean' ) && boolReturnStorageObject;

              funcSuccessCallback( boolReturnStorageObject ? objSettings : boolIsEnabled );

              return true;
            }
          }
        }

        /**
         * @todo Handle exceptions properly.
         */

        return false;
      } )
      ;
  };

  /**
   * Check whether the current active tab site is Amazon.
   *
   * @param {Tab} objTab
   * @return {boolean} - Whether Amazon or not.
   */

  ReferralPrograms.prototype.isAmazonDomain = function ( objTab ) {
    strLog = 'poziworldExtension.referralPrograms.isAmazonDomain';
    Log.add( strLog, objTab );

    // www.amazon.com.au -> amazon.com.au, smile.amazon.com -> amazon.com
    const strActiveTabDomain = this.getAmazonDomain( objTab );

    switch ( strActiveTabDomain ) {
      case 'amazon.ca':
      case 'amazon.cn':
      case 'amazon.co.jp':
      case 'amazon.co.uk':
      case 'amazon.com':
      case 'amazon.com.au':
      case 'amazon.com.br':
      case 'amazon.com.mx':
      case 'amazon.com.sg':
      case 'amazon.de':
      case 'amazon.es':
      case 'amazon.fr':
      case 'amazon.in':
      case 'amazon.it':
      case 'amazon.nl':
        return true;
    }

    return false;
  };

  /**
   * Amazon uses different country-specific domains.
   * For example, amazon.com for US, amazon.co.uk for UK.
   *
   * @param {Tab} objTab
   * @returns {string}
   *
   * @example
   * // returns 'amazon.com.au' when location.hostname is www.amazon.com.au
   * getAmazonDomain();
   *
   * @example
   * // returns 'amazon.com' when location.hostname is 'smile.amazon.com
   * getAmazonDomain();
   */

  ReferralPrograms.prototype.getAmazonDomain = function ( objTab ) {
    strLog = 'poziworldExtension.referralPrograms.getAmazonDomain';
    Log.add( strLog, objTab );

    const domain = objTab.strDomain;

    if ( window.poziworldExtension.utils.isNonEmptyString( domain ) ) {
      return domain.split( '.' ).slice( 1 ).join( '.' );
    }

    return '';
  };

  if ( typeof window.poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  window.poziworldExtension.referralPrograms = new ReferralPrograms();
}() );
