/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2015 PoziWorld
  File                    :           global/js/const.js
  Description             :           Constants JavaScript

  Table of Contents:

    Constants
    Storage

 ============================================================================ */

/* =============================================================================

  Constants

 ============================================================================ */

const
    strConstExtensionId             = chrome.runtime.id
  , strConstExtensionName           = chrome.i18n.getMessage( 'extensionName' )
  , strConstExtensionVersion        = chrome.runtime.getManifest().version
  , strConstExtensionLanguage       = chrome.i18n.getMessage( 'lang' )

  , boolConstIsBowserAvailable      = typeof bowser === 'object'
  , strConstChromeVersion           =
      boolConstIsBowserAvailable ? bowser.chromeVersion : ''
  , boolConstUseOptionsUi           =
          boolConstIsBowserAvailable
      &&  strConstChromeVersion >= '40.0'
      &&  bowser.name !== 'Opera'

  , strConstLogOnInstalled          = 'chrome.runtime.onInstalled'

  , strConstDisabledDomainsSetting  = 'arrDisabledDomains'
  , strConstDisabledUrlsSetting     = 'arrDisabledUrls'

  , objConstUserSetUp               = typeof bowser === 'object' ?
        {
            currentVersion          : strConstExtensionVersion
          , browserName             : bowser.name
          , browserVersion          : bowser.version
          , browserVersionFull      : bowser.versionFull
          , chromeVersion           : strConstChromeVersion
          , chromeVersionFull       : bowser.chromeVersionFull
          , language                : strConstExtensionLanguage
          , userAgent               : bowser.userAgent
        }
      : {}
  ;

/* =============================================================================

  Storage

 ============================================================================ */

var
    StorageApi                    = chrome.storage
  , StorageSync                   = StorageApi.sync
  , StorageLocal                  = StorageApi.local
  ;
