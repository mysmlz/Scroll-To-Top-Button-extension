const path = require( 'path' );
const fs = require( 'fs' );
const { mergeDeep } = require( 'immutable' );

/**
 * https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
 */

// @todo Make dynamic.
const PACKAGE_JSON_PATH = './package.json';
const PACKAGE_JSON_ENCODING = 'utf8';

/**
 * https://developer.chrome.com/extensions/options#full_page
 * https://developer.chrome.com/extensions/options#embedded_options
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/options_ui#Syntax
 *
 * @type {string}
 */

// @todo Make dynamic.
const OPTIONS_PAGE_PATH = 'options/index.html';

/**
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json/applications#Extension_ID_format
 *
 * @type {string}
 */

// @todo Make dynamic.
const EXTENSION_ID_AFFIX = '@poziworld.com';

module.exports = loadManifestJson;

/**
 * Inherit generic properties of package.json in manifest.json, so there is no need to have them in both files.
 *
 * Inspired by {@link https://stackoverflow.com/a/44249538}.
 *
 * @param {string} source - Stringified original manifest.json's contents.
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function loadManifestJson( source ) {
  let manifestJsonAsJs = JSON.parse( source );
  const packageJsonContents = fs.readFileSync( PACKAGE_JSON_PATH, PACKAGE_JSON_ENCODING );
  const packageJsonAsJs = JSON.parse( packageJsonContents );
  let newProperties = {
    version: packageJsonAsJs.version,
    author: packageJsonAsJs.author,
    homepage_url: packageJsonAsJs.homepage,
  };

  // See supportedBrowsers in webpack.config.js
  const browserName = path.basename( this._compiler.outputPath );
  const finalJson = makeBrowserSpecificManifestJson( browserName, manifestJsonAsJs, packageJsonAsJs, newProperties );

  this.emitFile( 'manifest.json', finalJson );

  return finalJson;
}

/**
 * Build browser-specific manifest.json files, as not all manifest.json keys are supported by all browsers.
 *
 * @see {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Browser_compatibility_for_manifest.json}
 *
 * @param {('chromium'|'firefox'|'edge')} browserName
 * @param {object} manifestJsonAsJs
 * @param {object} packageJsonAsJs
 * @param {object} newProperties
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function makeBrowserSpecificManifestJson( browserName, manifestJsonAsJs, packageJsonAsJs, newProperties ) {
  let json;

  switch ( browserName ) {
    case 'chromium':
    {
      json = makeChromiumSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties );

      break;
    }
    case 'firefox':
    {
      json = makeFirefoxSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties );

      break;
    }
    case 'edge':
    {
      json = makeLegacyEdgeSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties );

      break;
    }
  }

  return json;
}

/**
 * Build manifest.json for Chromium-based browsers: Chrome, Opera, Microsoft Edge (as of 2020), Brave, and others.
 *
 * @param {object} manifestJsonAsJs
 * @param {object} packageJsonAsJs
 * @param {object} newProperties
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function makeChromiumSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties ) {
  newProperties.background = {
    persistent: false,
  };
  newProperties.options_page = OPTIONS_PAGE_PATH;

  return combineProperties( manifestJsonAsJs, newProperties );
}

/**
 * Build manifest.json for Firefox-based browsers: Firefox, Waterfox, and others.
 *
 * @param {object} manifestJsonAsJs
 * @param {object} packageJsonAsJs
 * @param {object} newProperties
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function makeFirefoxSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties ) {
  newProperties.browser_specific_settings = {
    gecko: {
      id: packageJsonAsJs.name + EXTENSION_ID_AFFIX,
    }
  };
  newProperties.options_ui = {
    page: OPTIONS_PAGE_PATH,
    browser_style: true,
  };

  delete manifestJsonAsJs.version_name;

  // @todo Make dynamic.
  const browserList = fs.readFileSync( path.resolve( __dirname, '..', '..', '.browserslistrc' ), PACKAGE_JSON_ENCODING );
  // @todo Make dynamic.
  const minVersionMinusOne = browserList.match( /(firefox > )([0-9]{2,})/gi );

  if ( minVersionMinusOne ) {
    // @todo Optimize.
    newProperties.browser_specific_settings.gecko.strict_min_version = ( Number( minVersionMinusOne[ 0 ].match( /[0-9]{2,}/g )[ 0 ] ) + 1 ).toString();
  }

  return combineProperties( manifestJsonAsJs, newProperties );
}

/**
 * Build manifest.json for the legacy Microsoft Edge (pre-2020).
 *
 * @param {object} manifestJsonAsJs
 * @param {object} packageJsonAsJs
 * @param {object} newProperties
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function makeLegacyEdgeSpecificManifestJson( manifestJsonAsJs, packageJsonAsJs, newProperties ) {
  newProperties.applications = {
    gecko: {
      id: packageJsonAsJs.name + EXTENSION_ID_AFFIX,
    }
  };
  newProperties.background = {
    persistent: false,
  };
  newProperties.options_page = OPTIONS_PAGE_PATH;

  delete manifestJsonAsJs.version_name;

  return combineProperties( manifestJsonAsJs, newProperties );
}

/**
 * Put together properties from manifest.json, properties from package.json, and browser-specific properties.
 *
 * @param {object} manifestJsonAsJs
 * @param {object} newProperties
 * @return {string} - Stringified updated browser-specific manifest.json's contents.
 */

function combineProperties( manifestJsonAsJs, newProperties ) {
  const merged = mergeDeep( manifestJsonAsJs, newProperties );

  return JSON.stringify( merged );
}
