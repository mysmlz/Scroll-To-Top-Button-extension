/* =============================================================================

  Scroll To Top Button
  © 2013-2018 PoziWorld, Inc.
  https://scroll-to-top-button.com

 ============================================================================ */

( function () {
  'use strict';

  function ReferralPrograms() {
    /**
     * Resolve promise.
     *
     * @callback funcResolve
     */

    /**
     * Reject promise.
     *
     * @callback funcReject
     */

    /**
     * @typedef {string} ReferralProgramName
     */

    /**
     * @typedef {Object} StorageArea - https://developer.chrome.com/extensions/storage#type-StorageArea
     */

    /**
     * If STTB participates in the referral program of the active tab site.
     *
     * @type {ReferralProgramName}
     * @private
     */

    let strName = '';

    /**
     * Return a referral program name.
     *
     * @return {ReferralProgramName}
     */

    ReferralPrograms.prototype.getName = function () {
      return strName;
    };

    /**
     * Remember a referral program name.
     *
     * @param {ReferralProgramName} strNameToSet - The name of the referral program.
     * @return {boolean} - Whether the operation succeeded.
     */

    ReferralPrograms.prototype.setName = function ( strNameToSet ) {
      if ( typeof strNameToSet === 'string' && strNameToSet !== '' ) {
        strName = strNameToSet;

        return true;
      }

      return false;
    };

    this.init();
  }

  /**
   * Initialize.
   */

  ReferralPrograms.prototype.init = function () {
    this.detectReferralProgram();
  };

  /**
   * Check whether the current active tab site has a referral program.
   *
   * @return {boolean}
   */

  ReferralPrograms.prototype.detectReferralProgram = function () {
    const _this = this;

    browser.runtime.sendMessage( {
      objSttbApiRequest: {
        strCall: 'referral-program',
        strMethod: 'GET'
      }
    } ).then( onResponse );

    function onResponse( strReferralProgramName ) {
      if ( window.poziworldExtension.utils.isType( strReferralProgramName, 'string' ) && strReferralProgramName !== '' && _this.setName( strReferralProgramName ) ) {
        _this.showInfo();
      }
    }
  };

  /**
   * Show referral program-related information.
   */

  ReferralPrograms.prototype.showInfo = function () {
    this.hideSecondaryInfo();
    this.handleNotificationSettings();

    const strName = this.getName();
    const arrInfoElements = [
      'Title',
      'Text',
      'Text2',
      'Cta',
      'Link',
      'Disclaimer'
    ];
    const objInfoLinks = {
      amazon: 'https://scroll-to-top-button.com/referral-programs/1/'
    };

    document.getElementById( 'referralProgramInfoContainer' ).hidden = false;

    for ( let i = 0, l = arrInfoElements.length; i < l; i++ ) {
      const strInfoElement = arrInfoElements[ i ];
      const $$infoElement = document.getElementById( 'referralProgramInfo' + strInfoElement );
      const strInfoElementText = window.poziworldExtension.i18n.getMessage( 'referralProgramInfo' + strInfoElement + '_' + strName );

      if ( $$infoElement ) {
        if ( typeof strInfoElementText === 'string' && strInfoElementText !== '' ) {
          $$infoElement.textContent = strInfoElementText;

          if ( strInfoElement === 'Cta' ) {
            $$infoElement.addEventListener( 'click', this.onInfoCtaClick.bind( this, strName ) );
          }
          else if ( strInfoElement === 'Link' ) {
            const strHref = objInfoLinks[ strName ];

            if ( window.poziworldExtension.utils.isType( strHref, 'string' ) && strHref !== '' ) {
              $$infoElement.href = strHref;
              $$infoElement.addEventListener( 'click', this.onInfoLinkClick.bind( this, strHref ) );
            }
          }
        }
        else {
          $$infoElement.remove();
        }
      }
    }
  };

  /**
   * In order to avoid vertical scrollbar, hide non-important blocks.
   */

  ReferralPrograms.prototype.hideSecondaryInfo = function () {
    document.getElementById( 'otherProjectsContainer' ).remove();
  };

  /**
   * Show the current notification state (whether enabled) and handle the changes.
   */

  ReferralPrograms.prototype.handleNotificationSettings = function () {
    const $$checkbox = document.getElementById( 'referralProgramInfoCheckbox' );

    this.getNotificationSettings( $$checkbox );
    $$checkbox.addEventListener( 'click', this.setNotificationSettings.bind( this ) );
  };

  /**
   * Get the current notification state (whether enabled or not).
   *
   * @param {HTMLElement} $$checkbox
   * @return {Promise}
   */

  ReferralPrograms.prototype.getNotificationSettings = function ( $$checkbox ) {
    strLog = 'poziworldExtension.referralPrograms.getNotificationSettings';
    Log.add( strLog );

    return new Promise( function ( funcResolve, funcReject ) {
      browser.runtime.sendMessage( {
        objSttbApiRequest: {
          strCall: 'referral-program/notification-settings',
          strMethod: 'GET'
        }
      } ).then( funcResolve );
    } )
      .then( function ( boolIsEnabled ) {
        if ( window.poziworldExtension.utils.isType( boolIsEnabled, 'boolean' ) ) {
          $$checkbox.checked = boolIsEnabled;
          $$checkbox.disabled = false;

          return true;
        }

        /**
         * @todo Handle exceptions properly.
         */

        return false;
      } )
      ;
  };

  /**
   * Save the notification settings changes.
   *
   * @param {Event} event
   * @return {Promise}
   */

  ReferralPrograms.prototype.setNotificationSettings = function ( event ) {
    strLog = 'poziworldExtension.referralPrograms.setNotificationSettings';
    Log.add( strLog );

    const $$checkbox = event.target;
    const boolIsToCheck = $$checkbox.checked;

    event.preventDefault();

    return new Promise( function ( funcResolve, funcReject ) {
      browser.runtime.sendMessage( {
        objSttbApiRequest: {
          strCall: 'referral-program/notification-settings',
          strMethod: 'POST',
          objData: {
            boolDisable: ! boolIsToCheck
          }
        }
      } ).then( funcResolve );
    } )
      .then( function () {
        $$checkbox.checked = boolIsToCheck;

        return true;
      } )
      ;
  };

  /**
   * Process notification settings data from the storage.
   *
   * @param {Object} objSettings - Object with items in their key-value mappings.
   */

  ReferralPrograms.prototype.showNotificationSettingsState = function ( objSettings ) {
    Log.add( 'poziworldExtension.referralPrograms.showNotificationSettingsState', objSettings, true );

    return false;
  };

  /**
   * Handle the call-to-action click.
   *
   * @param {Event} event
   * @param {ReferralProgramName} strName
   */

  ReferralPrograms.prototype.onInfoCtaClick = function ( strName, event ) {
    switch ( strName ) {
      case 'amazon':
        this.handleAmazonInfoCtaClick();

        break;
    }
  };

  /**
   * Handle the link click.
   *
   * @param {string} strHref - The URL to go to.
   * @param {Event} event
   */

  ReferralPrograms.prototype.onInfoLinkClick = function ( strHref, event ) {
    event.preventDefault();

    Global.createTabOrUpdate( strHref );
  };

  /**
   * Append STTB tr. ID (tag) to the current active tab URL.
   */

  ReferralPrograms.prototype.handleAmazonInfoCtaClick = function () {
    const AMAZON_TAG = 'pwsttb10-20';

    browser.tabs.update( strTabId, {
      url: this.updateQueryString( 'tag', AMAZON_TAG, strTabUrl )
    } );
  };

  /**
   * Amazon uses different country-specific domains.
   * For example, amazon.com for US, amazon.co.uk for UK.
   *
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

  ReferralPrograms.prototype.getAmazonDomain = function () {
    strLog = 'poziworldExtension.referralPrograms.getAmazonDomain';
    Log.add( strLog );

    return strTabDomain.split( '.' ).slice( 1 ).join( '.' );
  };

  /**
   * Add, remove, or update a query string parameter.
   * https://stackoverflow.com/a/11654596
   *
   * @param {string} strKey - The query string key to add, remove, or update.
   * @param {string} [strValue] - The value for the key.
   * @param {string} [strUrl=window.location.href] - The URL to modify.
   * @return {*}
   */

  ReferralPrograms.prototype.updateQueryString = function ( strKey, strValue, strUrl ) {
    if ( ! strUrl ) {
      strUrl = window.location.href;
    }

    const regex = new RegExp( '([?&])' + strKey + '=.*?(&|#|$)(.*)', 'gi' );
    let strHash;

    if ( regex.test( strUrl ) ) {
      if ( typeof strValue !== 'undefined' && strValue !== null ) {
        return strUrl.replace( regex, '$1' + strKey + '=' + strValue + '$2$3' );
      }
      else {
        strHash = strUrl.split( '#' );
        strUrl = strHash[ 0 ].replace( regex, '$1$3' ).replace( /(&|\?)$/, '' );
        let strHashValue = strHash[ 1 ];

        if ( typeof strHashValue !== 'undefined' && strHashValue !== null ) {
          strUrl += '#' + strHashValue;
        }

        return strUrl;
      }
    }
    else {
      if ( typeof strValue !== 'undefined' && strValue !== null ) {
        var strSeparator = strUrl.indexOf( '?' ) !== -1 ? '&' : '?';
        strHash = strUrl.split( '#' );
        strUrl = strHash[ 0 ] + strSeparator + strKey + '=' + strValue;
        let strHashValue = strHash[ 1 ];

        if (typeof strHashValue !== 'undefined' && strHashValue !== null ) {
          strUrl += '#' + strHashValue;
        }

        return strUrl;
      }
      else {
        return strUrl;
      }
    }
  };

  if ( typeof window.poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  window.poziworldExtension.referralPrograms = new ReferralPrograms();
}() );
