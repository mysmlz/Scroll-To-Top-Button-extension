/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2016 PoziWorld
  File                    :           browser-action/js/browser-action.js
  Description             :           Browser Action JavaScript

  Table of Contents:

    Globals
    BrowserAction
      init()
      addEventListeners()
      getActiveTabAddress()
      getActiveTabSettings()
      changeSttbMode()
      reloadActiveTab()
    Events

 ============================================================================ */


/* =============================================================================

  Globals

 ============================================================================ */

const
    strPage                       = 'browserAction'

  , strHideInOperaClass           = 'hideInOpera'

  , strOptionsCtaId               = 'bractOpenOptionsPage'
  , strCloseCtaId                 = 'bractClosePage'

  , strTabAddressUrlId            = 'sttbModeTabAddressUrl'
  , strTabAddressDomainId         = 'sttbModeTabAddressDomain'

  , strModeOptionClass            = 'sttbModeOption'
  , strModeOptionEnabledId        = 'sttbModeOptionEnabled'
  , strModeOptionUrlId            = 'sttbModeOptionUrl'
  , strModeOptionDomainId         = 'sttbModeOptionDomain'

  , strReloadActiveTabCtaId       = 'browserActionReloadActiveTabCta'

  , arrSettingsToGet              = [
                                        strConstDisabledDomainsSetting
                                      , strConstDisabledUrlsSetting
                                    ]
  ;

var objActiveTab;
var strTabId;
var strTabUrl;
var strTabDomain;
var $reloadActiveTabCta;

/* =============================================================================

  BrowserAction

 ============================================================================ */

var BrowserAction = {
  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    // DOM is ready
    $reloadActiveTabCta = document.getElementById( strReloadActiveTabCtaId );

    Page.hideInOpera();
    poziworldExtension.i18n.init()
      .then( Page.localize.bind( null, strPage ) );
    poziworldExtension.incentive.setLinks();
    poziworldExtension.page.init( strPage );
    BrowserAction.addEventListeners();
    BrowserAction.getActiveTabAddress();
  }
  ,

  /**
   * Add event listeners.
   */

  addEventListeners: function () {
    addEvent(
        document.getElementById( strOptionsCtaId )
      , 'click'
      , function( objEvent ) {
          Global.openOptionsPage( strOptionsCtaId );
        }
    );

    addEvent(
        document.getElementById( strCloseCtaId )
      , 'click'
      , function( objEvent ) {
          window.close();
        }
    );

    addEvent(
        document.getElementsByClassName( strModeOptionClass )
      , 'click'
      , function( objEvent ) {
          BrowserAction.changeSttbMode( objEvent );
        }
    );

    addEvent(
        $reloadActiveTabCta
      , 'click'
      , function( objEvent ) {
          BrowserAction.reloadActiveTab();
        }
    );
  }
  ,

  /**
   * Get domain and full URL of active tab.
   */

  getActiveTabAddress: function () {
    const objQuery = {
        active: true
      , currentWindow: true
    };

    browser.tabs.query( objQuery ).then( onGot );

    function onGot( objTabs ) {
      objActiveTab = objTabs[ 0 ];

      if ( typeof objActiveTab === 'object' && ! Global.isEmpty( objActiveTab ) ) {
        const $a = document.createElement( 'a' );
        const $url = document.getElementById( strTabAddressUrlId );
        const $domain = document.getElementById( strTabAddressDomainId );
        var strTempDomain;

        strTabId = objActiveTab.id;
        strTabUrl = objActiveTab.url;

        // Tab domain
        $a.href = strTabUrl;
        strTempDomain = $a.hostname;
        strTabDomain = punycode.toUnicode( strTempDomain );
        $domain.innerText = strTabDomain;
        $domain.title = strTabDomain;

        // Tab URL
        strTabUrl = strTabUrl.replace( strTempDomain, strTabDomain );
        $url.innerText = strTabUrl;
        $url.title = strTabUrl;

        // What mode STTB is in for this tab
        BrowserAction.getActiveTabSettings();
      }
    }
  }
  ,

  /**
   * Check whether STTB is disabled for this tab.
   */

  getActiveTabSettings: function () {
    const logTemp = 'getActiveTabSettings';

    poziworldExtension.utils.getStorageItems( StorageSync, arrSettingsToGet, logTemp, onActiveTabSettingsRetrieved );

    function onActiveTabSettingsRetrieved( objReturn ) {
      // Check domain first
      var
          arrDisabledDomains    = objReturn[ strConstDisabledDomainsSetting ]
        , boolIsDisabledDomain  =
                Array.isArray( arrDisabledDomains )
            &&  ~ arrDisabledDomains.indexOf( strTabDomain )
        ;

      if ( boolIsDisabledDomain ) {
        document.getElementById( strModeOptionDomainId ).checked = true;
        return;
      }

      // Check URL
      var
          arrDisabledUrls       = objReturn[ strConstDisabledUrlsSetting ]
        , boolIsDisabledUrl     =
                Array.isArray( arrDisabledUrls )
            &&  ~ arrDisabledUrls.indexOf( strTabUrl )
        ;

      if ( boolIsDisabledUrl ) {
        document.getElementById( strModeOptionUrlId ).checked = true;
        return;
      }

      // STTB is enabled
      document.getElementById( strModeOptionEnabledId ).checked = true;
    }
  }
  ,

  /**
   * Change STTB mode for the active tab (enabled, disabled for URL or domain)
   *
   * @param {Event} objEvent - Event object.
   */

  changeSttbMode: function ( objEvent ) {
    const logTemp = strLog = 'changeSttbMode';
    const strChosenModeOptionId = objEvent.target.id;

    poziworldExtension.utils.getStorageItems( StorageSync, arrSettingsToGet, logTemp, onActiveTabSettingsRetrieved );

    function onActiveTabSettingsRetrieved( objReturn ) {
      if ( typeof objReturn === 'object' ) {
        var
            objTempToSet            = {}
          , intDisabledUrlArrPos    = -1
          , intDisabledDomainArrPos = -1
          , funcDisable             = function (
                intDisabledArrPos
              , strConstDisabledSetting
              , arrDisabled
              , strTab
            ) {
              // Wasn't disabled for this
              if ( intDisabledArrPos === -1 ) {
                // Disable
                arrDisabled.push( strTab );

                objTempToSet[ strConstDisabledSetting ] = arrDisabled;
              }
            }
          , funcUndisable           = function (
                intDisabledArrPos
              , strConstDisabledSetting
              , arrDisabled
            ) {
              // Was disabled for this
              if ( intDisabledArrPos !== -1 ) {
                // "Undisable"
                arrDisabled.splice( intDisabledArrPos, 1 );

                objTempToSet[ strConstDisabledSetting ] = arrDisabled;
              }
            }
          ;

        // Check whether STTB was disabled for this domain
        var arrDisabledDomains = objReturn[ strConstDisabledDomainsSetting ];

        if ( Array.isArray( arrDisabledDomains ) ) {
          intDisabledDomainArrPos = arrDisabledDomains.indexOf( strTabDomain );
        }
        else {
          arrDisabledDomains = [];
        }

        // Check whether STTB was disabled for this URL
        var arrDisabledUrls = objReturn[ strConstDisabledUrlsSetting ];

        if ( Array.isArray( arrDisabledUrls ) ) {
          intDisabledUrlArrPos = arrDisabledUrls.indexOf( strTabUrl );
        }
        else {
          arrDisabledUrls = [];
        }

        // If disabling for domain
        if ( strChosenModeOptionId === strModeOptionDomainId ) {
          // Disable for domain
          funcDisable(
              intDisabledDomainArrPos
            , strConstDisabledDomainsSetting
            , arrDisabledDomains
            , strTabDomain
          );

          // "Undisable" for URL
          funcUndisable(
              intDisabledUrlArrPos
            , strConstDisabledUrlsSetting
            , arrDisabledUrls
          );
        }
        // If disabling for URL
        else if ( strChosenModeOptionId === strModeOptionUrlId ) {
          // "Undisable" for domain
          funcUndisable(
              intDisabledDomainArrPos
            , strConstDisabledDomainsSetting
            , arrDisabledDomains
          );

          // Disable for URL
          funcDisable(
              intDisabledUrlArrPos
            , strConstDisabledUrlsSetting
            , arrDisabledUrls
            , strTabUrl
          );
        }
        // If enabling
        else if ( strChosenModeOptionId === strModeOptionEnabledId ) {
          // "Undisable" for domain
          funcUndisable(
              intDisabledDomainArrPos
            , strConstDisabledDomainsSetting
            , arrDisabledDomains
          );

          // "Undisable" for URL
          funcUndisable(
              intDisabledUrlArrPos
            , strConstDisabledUrlsSetting
            , arrDisabledUrls
          );
        }

        // Save
        if ( ! Global.isEmpty( objTempToSet ) ) {
          poziworldExtension.utils.setStorageItems( StorageSync, objTempToSet, strLog );
        }

        // Suggest to reload active tab
        Page.toggleElement( $reloadActiveTabCta, true );
      }
    }
  }
  ,

  /**
   * Reload active tab to apply new settings.
   */

  reloadActiveTab: function () {
    browser.tabs.reload( objActiveTab.id ).then( onReloaded );

    function onReloaded() {
      Page.toggleElement( $reloadActiveTabCta, false );
    }
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', BrowserAction.init );
