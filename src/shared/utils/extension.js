import { v4 as uuidv4 } from 'uuid';

const INSTALLATION_ID_STORAGE_KEY = 'installationId';

/**
 * Use the platform API to get the extension file URL.
 *
 * @param {string} path
 * @returns {string}
 */

export function getUrl( path ) {
  return browser.runtime.getURL( path );
}

/**
 * Provide a random anonymous installation ID, which could be useful to differentiate issue reports from different users.
 *
 * @returns {string|'n/a'}
 */

export async function getInstallationId() {
  try {
    let { [ INSTALLATION_ID_STORAGE_KEY ]: installationId } = await browser.storage.local.get( INSTALLATION_ID_STORAGE_KEY );

    if ( poziworldExtension.utils.isNonEmptyString( installationId ) ) {
      return installationId;
    }
    else {
      installationId = uuidv4();

      try {
        browser.storage.local.set( {
          [ INSTALLATION_ID_STORAGE_KEY ]: installationId,
        } );
      }
      catch ( error ) {
        // @todo
      }

      return installationId;
    }
  }
  catch ( error ) {
    // @todo
    return 'n/a';
  }
}
