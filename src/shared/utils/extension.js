/**
 * Use the platform API to get the extension file URL.
 *
 * @param {string} path
 * @return {string}
 */

export function getUrl( path ) {
  return browser.runtime.getURL( path );
}
