export const NON_SYNCHRONIZABLE_STORAGE_TYPE = 'local';
export const SYNCHRONIZABLE_STORAGE_TYPE = 'sync';

/**
 * @typedef {'local'|'sync'} StorageType
 */

/**
 *
 * @param {StorageType} storageType
 * @param {string|string[]|object|null} keys - A single key to get, list of keys to get, or a dictionary specifying default values. An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
 * @returns {object} items - Object with items in their key-value mappings.
 * @throws {Error|TypeError}
 */

export async function getFromStorage( storageType, keys ) {
  checkStorageType( storageType );

  if ( ! poziworldExtension.utils.isNonEmptyString( keys ) && ! Array.isArray( keys ) && ! poziworldExtension.utils.isType( keys, 'object' ) && ! poziworldExtension.utils.isType( keys, 'null' ) ) {
    throw new TypeError( 'Invalid type of keys provided.' );
  }

  try {
    return await browser.storage[ storageType ].get( keys );
  }
  catch ( error ) {
    throw new Error( `Issue retrieving storage items: ${ error }` );
  }
}

/**
 *
 * @param {StorageType} storageType
 * @param {object} items - An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).
 */

export async function saveInStorage( storageType, items ) {
  checkStorageType( storageType );

  if ( ! poziworldExtension.utils.isType( items, 'object' ) ) {
    throw new TypeError( 'Invalid type of items provided.' );
  }

  if ( Global.isEmpty( items ) ) {
    throw new Error( 'No items to save provided.' );
  }

  try {
    return await browser.storage[ storageType ].set( items );
  }
  catch ( error ) {
    throw new Error( `Issue saving items in storage: ${ error }` );
  }
}

function checkStorageType( storageType ) {
  if ( isValidStorageType( storageType ) ) {
    throw new Error( 'Invalid storage type provided.' );
  }
}

/**
 *
 * @param {StorageType} storageType
 * @returns {boolean}
 */

function isValidStorageType( storageType ) {
  return storageType !== NON_SYNCHRONIZABLE_STORAGE_TYPE && storageType !== SYNCHRONIZABLE_STORAGE_TYPE;
}
