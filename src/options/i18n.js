import * as browsersHelpers from './browsers';

export function setBrowserSpecificI18n() {
  const BROWSER_TYPE_PLACEHOLDER = '%BROWSER_TYPE%';
  const browserType = getPermissionsRelatedBrowserType();
  const browserSpecificI18nElements = [
    ...document.querySelectorAll( `[data-i18n-parameters$="${ BROWSER_TYPE_PLACEHOLDER }"]` ),
  ];

  for ( let element of browserSpecificI18nElements ) {
    const currentValue = element.getAttribute( 'data-i18n-parameters' );
    const newValue = currentValue.replace( BROWSER_TYPE_PLACEHOLDER, browserType );

    element.setAttribute( 'data-i18n-parameters', newValue );
  }
}

export function setVersionAndLicenseI18n() {
  setVersionI18n();
  setLicenseI18n();
}

export function setVersionI18n() {
  const EXTENSION_VERSION_PLACEHOLDER = '%EXTENSION_VERSION%';
  const i18nElements = [
    ...document.querySelectorAll( `[data-i18n-parameters*="${ EXTENSION_VERSION_PLACEHOLDER }"]` ),
  ];

  for ( let element of i18nElements ) {
    const currentValue = element.getAttribute( 'data-i18n-parameters' );
    const newValue = currentValue.replace( EXTENSION_VERSION_PLACEHOLDER, strConstExtensionVersion );

    element.setAttribute( 'data-i18n-parameters', newValue );
  }
}

export function setLicenseI18n() {
  const PLACEHOLDER_URLS = {
    '%FAIR_CODE_URL%': 'https://faircode.io',
    '%SUSTAINABLE_USE_LICENSE_URL%': String.raw`https://github.com/PoziWorld/Scroll-To-Top-Button-extension/blob/v${ strConstExtensionVersion }/LICENSE.md`,
  };
  const URL_PLACEHOLDER_SUFFIX = '_URL%';
  const URL_PLACEHOLDER_REGEXP_GROUP_NAME = 'urlPlaceholder';
  // '%FAIR_CODE_URL%' or '%SUSTAINABLE_USE_LICENSE_URL%'
  const urlPlaceholderRegExp = new RegExp( `(?<${ URL_PLACEHOLDER_REGEXP_GROUP_NAME }>%[A-Z0-9_]{1,}${ URL_PLACEHOLDER_SUFFIX })`, 'g' );

  const i18nElements = [
    ...document.querySelectorAll( `[data-i18n-parameters*="${ URL_PLACEHOLDER_SUFFIX }"]` ),
  ];

  for ( let element of i18nElements ) {
    const currentValue = element.getAttribute( 'data-i18n-parameters' );
    let newValue = currentValue;
    let urlPlaceholder;

    for ( const urlMatch of currentValue.matchAll( urlPlaceholderRegExp ) ) {
      urlPlaceholder = urlMatch.groups[ URL_PLACEHOLDER_REGEXP_GROUP_NAME ];

      newValue = newValue.replace( urlPlaceholder, PLACEHOLDER_URLS[ urlPlaceholder ] );
    }

    element.setAttribute( 'data-i18n-parameters', newValue );
  }
}

/**
 * Between the supported browsers, all/most Chromium-based ones have the same permission messaging. And Firefox-based one have the same permission messaging.
 *
 * @todo Replace with UA-CH when userAgent can no longer be trusted. {@link https://groups.google.com/a/chromium.org/forum/#!msg/blink-dev/-2JIRNMWJ7s/yHe4tQNLCgAJ}
 */

function getPermissionsRelatedBrowserType() {
  if ( browsersHelpers.isFirefox() ) {
    return 'Firefox';
  }

  return 'Chromium';
}
