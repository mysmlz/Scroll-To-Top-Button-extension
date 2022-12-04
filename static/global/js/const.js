/* =============================================================================

  Constants

 ============================================================================ */

const
    strConstExtensionId = browser.runtime.id
  , objConstExtensionManifest = browser.runtime.getManifest()
  , strConstExtensionName = objConstExtensionManifest.name
  , strConstExtensionVersion = objConstExtensionManifest.version

  , boolConstIsBowserAvailable = typeof bowser === 'object'
  , strConstChromeVersion =
      boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi =
          boolConstIsBowserAvailable
      &&  strConstChromeVersion >= '40.0'
      &&  bowser.name !== 'Opera'

  , strConstLogOnInstalled = 'browser.runtime.onInstalled'

  , strConstDisabledDomainsSetting = 'arrDisabledDomains'
  , strConstDisabledUrlsSetting = 'arrDisabledUrls'

  , objConstUserSetUp = typeof bowser === 'object' ?
        {
            currentVersion : strConstExtensionVersion
          , browserName : bowser.name
          , browserVersion : bowser.version
          , browserVersionFull : bowser.versionFull
          , chromeVersion : strConstChromeVersion
          , chromeVersionFull : bowser.chromeVersionFull
          , userAgent : bowser.userAgent

           /**
           * @todo Use a listener instead of poziworldExtension.i18n.saveExtensionLanguage
           */

           , language : ''
        }
      : {}
  ;

if ( typeof sttb === 'undefined' ) {
  window.sttb = {};
}

/* =============================================================================

  Storage

 ============================================================================ */

const StorageApi = browser.storage;
const StorageSync = StorageApi.sync;
const StorageLocal = StorageApi.local;
