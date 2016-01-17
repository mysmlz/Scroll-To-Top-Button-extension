/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2016 PoziWorld
  File                    :           content-script/js/content-script.js
  Description             :           Content Script JavaScript

  Table of Contents:

    Globals
    ContentScript
      init()
      getActiveTabAddress()
      getActiveTabSettings()
    Events

 ============================================================================ */


/* =============================================================================

  Globals

 ============================================================================ */

const
    arrSettingsToGet              = [
                                        strConstDisabledDomainsSetting
                                      , strConstDisabledUrlsSetting
                                    ]
  ;

var
    strTabUrl
  , strTabDomain
  ;

/* =============================================================================

  ContentScript

 ============================================================================ */

var ContentScript = {
  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
    ContentScript.getActiveTabAddress();
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
    // Tab domain
    var strTempDomain = location.hostname;
    strTabDomain = punycode.toUnicode( strTempDomain );

    // Tab URL
    strTabUrl = location.href.replace( strTempDomain, strTabDomain );

    // What mode STTB is in for this tab
    ContentScript.getActiveTabSettings();
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
        return;
      }

      // STTB is enabled
      STTB();
    } );
  }
};
