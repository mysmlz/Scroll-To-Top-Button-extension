import utils from 'Shared/utils';
import * as permissions from 'Shared/permissions';

const EVENTS_STORAGE_KEYS = {
  // Hardcoded so values can be searched for and found
  onInstalled: 'onInstalledEvents',
  onStartup: 'onStartupEvents',
  onSuspend: 'onSuspendEvents',
  onPermissionsAdded: 'onPermissionsAddedEvents',
  onPermissionsRemoved: 'onPermissionsRemovedEvents',
  onSyncStorageChange: 'onSyncStorageChangeEvents',
};
const EVENTS_STORAGE_TYPE = utils.NON_SYNCHRONIZABLE_STORAGE_TYPE;
// Chosen arbitrary. Should be enough
const LAST_FEW_EVENTS_COUNT = 10;

init();

function init() {
  addListeners();
}

function addListeners() {
  /**
   * @typedef {'install'|'update'|'chrome_update'|'shared_module_update'} OnInstalledReason
   */

  /**
   * @typedef {object[]} InstallationDetails
   * @property {OnInstalledReason} reason - The reason that this event is being dispatched.
   * @property {string} [previousVersion] - Indicates the previous version of the extension, which has just been updated. This is present only if 'reason' is 'update'.
   * @property {string} [id] - Indicates the ID of the imported shared module extension which updated. This is present only if 'reason' is 'shared_module_update'.
   */

  /**
   *
   * @param {InstallationDetails} details
   */

  browser.runtime?.onInstalled?.addListener( async ( details ) => recordEvent( EVENTS_STORAGE_KEYS.onInstalled, {
    ...details,
    permissionsGranted: await permissions.hasPermissions(),
  } ) );
  browser.runtime?.onStartup?.addListener( async () => recordEvent( EVENTS_STORAGE_KEYS.onStartup, {
    permissionsGranted: await permissions.hasPermissions(),
  } ) );
  browser.runtime?.onSuspend?.addListener( async () => recordEvent( EVENTS_STORAGE_KEYS.onSuspend, {
    permissionsGranted: await permissions.hasPermissions(),
  } ) );

  /**
   * @typedef {object} Permissions
   * @property {string[]} [permissions] - List of named permissions (does not include hosts or origins).
   * @property {string[]} [origins] - The list of host permissions, including those specified in the optional_permissions or permissions keys in the manifest, and those associated with Content Scripts.
   */

  /**
   *
   * @param {Permissions} permissions
   */

  browser.permissions?.onAdded?.addListener( ( permissions ) => recordEvent( EVENTS_STORAGE_KEYS.onPermissionsAdded, permissions ) );
  browser.permissions?.onRemoved?.addListener( ( permissions ) => recordEvent( EVENTS_STORAGE_KEYS.onPermissionsRemoved, permissions ) );

  browser.storage?.onChanged?.addListener( recordSyncStorageOnChangedEvent );
}

/**
 * @typedef {object} AdditionalEventData
 * @property {boolean} [permissionsGranted]
 */

/**
 *
 * @param {string} storageKey
 * @param {InstallationDetails|Permissions|AdditionalEventData} [data]
 */

async function recordEvent( storageKey, data ) {
  if ( ! poziworldExtension.utils.isNonEmptyString( storageKey ) ) {
    throw new Error( 'Invalid storage key provided.' );
  }

  if ( data && ! poziworldExtension.utils.isType( data, 'object' ) ) {
    throw new TypeError( 'Invalid type of event details provided.' );
  }

  if ( data && Global.isEmpty( data ) ) {
    throw new Error( 'No event details provided.' );
  }

  const lastFewEvents = await getLastFewEvents( storageKey );

  const eventsToRecord = [
    ...lastFewEvents ? lastFewEvents : [],
    {
      ...data,
      timestamp: window.Date.now(),
      ...window.Temporal && {
        temporal: window.Temporal.now.dateTime().toString(),
      },
    },
  ];

  await saveEventsInStorage( storageKey, eventsToRecord );
}

/**
 * @typedef {object} ExtensionEvent
 */

/**
 * Limit the number of last retrieved events to get, as that should be enough.
 *
 * @param {string} storageKey
 * @returns {ExtensionEvent[]}
 */

async function getLastFewEvents( storageKey ) {
  let eventsFromStorage = await getEventsFromStorage( storageKey );

  if ( Array.isArray( eventsFromStorage ) ) {
    while ( eventsFromStorage.length > LAST_FEW_EVENTS_COUNT ) {
      eventsFromStorage.shift();
    }
  }

  return eventsFromStorage;
}

/**
 *
 * @param {string} storageKey
 * @returns {ExtensionEvent[]}
 */

async function getEventsFromStorage( storageKey ) {
  return ( await utils.getFromStorage( EVENTS_STORAGE_TYPE, storageKey ) )[ storageKey ];
}

/**
 *
 * @param {string} storageKey
 * @param {ExtensionEvent[]} events
 */

async function saveEventsInStorage( storageKey, events ) {
  await utils.saveInStorage( EVENTS_STORAGE_TYPE, {
    [ storageKey ]: events,
  } );
}

async function recordSyncStorageOnChangedEvent( changes, areaName ) {
  if ( areaName === utils.SYNCHRONIZABLE_STORAGE_TYPE ) {
    await recordEvent( EVENTS_STORAGE_KEYS.onSyncStorageChange, {
      // @todo Don't pass repeated settings, only the ones that actually got changed
      ...changes,
      permissionsGranted: await permissions.hasPermissions(),
    } );
  }
}
