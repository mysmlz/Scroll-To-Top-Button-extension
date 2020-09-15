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
