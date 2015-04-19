/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2015 PoziWorld
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

var
    objActiveTab
  , strTabUrl
  , strTabDomain
  , $reloadActiveTabCta
  ;

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
    Page.localize( strPage );
    BrowserAction.addEventListeners();
    BrowserAction.getActiveTabAddress();
  }
  ,

  /**
   * Add event listeners
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  addEventListeners : function() {
    addEvent(
        document.getElementById( strOptionsCtaId )
      , 'click'
      , function( objEvent ) {
          // Link to new Options UI for 40+
          var strOptionsUrl =
                boolConstUseOptionsUi
                  ? 'chrome://extensions?options=' + strConstExtensionId
                  : chrome.extension.getURL( 'options/index.html' )
                  ;

          Global.createTabOrUpdate( strOptionsUrl );
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
   * Get domain and full URL of active tab
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getActiveTabAddress : function() {
    var objQuery = { active: true };

    chrome.tabs.query( objQuery, function( objTabs ) {
      objActiveTab = objTabs[ 0 ];

      if (
            typeof objActiveTab === 'object'
        &&  ! Global.isEmpty( objActiveTab )
      ) {
        var
            $a            = document.createElement( 'a' )
          , $url          = document.getElementById( strTabAddressUrlId )
          , $domain       = document.getElementById( strTabAddressDomainId )
          , strTempDomain
          ;

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
    } );
  }
  ,

  /**
   * Check whether STTB is disabled for this tab
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  getActiveTabSettings : function() {
    StorageSync.get( arrSettingsToGet, function( objReturn ) {
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
    } );
  }
  ,

  /**
   * Change STTB mode for the active tab (enabled, disabled for URL or domain)
   *
   * @type    method
   * @param   objEvent
   *            Event object
   * @return  void
   **/
  changeSttbMode : function( objEvent ) {
    strLog = 'changeSttbMode';

    var strChosenModeOptionId = objEvent.target.id;

    StorageSync.get( arrSettingsToGet, function( objReturn ) {
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
          Global.setStorageItems( StorageSync, objTempToSet, strLog );
        }

        // Suggest to reload active tab
        Page.toggleElement( $reloadActiveTabCta, true );
      }
    } );
  }
  ,

  /**
   * Reload active tab to apply new settings
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  reloadActiveTab : function() {
    chrome.tabs.reload( objActiveTab.id, function() {
      Page.toggleElement( $reloadActiveTabCta, false );
    } );
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', BrowserAction.init );
