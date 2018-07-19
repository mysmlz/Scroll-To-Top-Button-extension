const arrSettingsToGet = [
        strConstDisabledDomainsSetting
      , strConstDisabledUrlsSetting
    ]
  ;

var strTabUrl
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
   * Check whether STTB is disabled for this tab.
   */

  getActiveTabSettings: function () {
    const logTemp = 'getActiveTabSettings';

    poziworldExtension.utils.getStorageItems( StorageSync, arrSettingsToGet, logTemp, onActiveTabSettingsRetrieved );

    function onActiveTabSettingsRetrieved( objReturn ) {
      // Check domain first
      var arrDisabledDomains = objReturn[ strConstDisabledDomainsSetting ]
        , boolIsDisabledDomain =
                Array.isArray( arrDisabledDomains )
            &&  ~ arrDisabledDomains.indexOf( strTabDomain )
        ;

      if ( boolIsDisabledDomain ) {
        return;
      }

      // Check URL
      var arrDisabledUrls = objReturn[ strConstDisabledUrlsSetting ]
        , boolIsDisabledUrl =
                Array.isArray( arrDisabledUrls )
            &&  ~ arrDisabledUrls.indexOf( strTabUrl )
        ;

      if ( boolIsDisabledUrl ) {
        return;
      }

      // STTB is enabled
      STTB();
    }
  }
};
