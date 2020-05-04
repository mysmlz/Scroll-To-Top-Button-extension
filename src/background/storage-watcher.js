import * as scrollExecutors from './scroll-executors';

const TARGET_STORAGE_AREA = 'local';
const REQUEST_TO_SIMULATE_EXTENSION_UPDATE_KEY = 'requestedToSimulateExtensionUpdate';
const REQUEST_TO_SIMULATE_EXTENSION_UPDATE_VALUE = true;

setUp();

/**
 * Module-specific configuration.
 */

function setUp() {
  addListeners();
}

/**
 * Add the necessary listeners.
 */

function addListeners() {
  addOnChangedListener();
}

/**
 * Watch for changes in the Storage.
 *
 * @see {@link https://developer.chrome.com/extensions/storage#event-onChanged}
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/onChanged}
 */

function addOnChangedListener() {
  // @todo Add only when in development mode.
  browser.storage.onChanged.addListener( checkForExtensionUpdateSimulationRequest );
  browser.storage.onChanged.addListener( () => scrollExecutors.setController( 'storageChanged' ) );
}

/**
 * Check whether the testing framework requested to have the extension simulate an extension update.
 *
 * @param {object} changes - Object describing the change. This contains one property for each key that changed. The name of the property is the name of the key that changed, and its value is a {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageChange storage.StorageChange} object describing the change to that item.
 * @param {string} areaName - The name of the storage area ("sync", "local" or "managed") to which the changes were made.
 */

function checkForExtensionUpdateSimulationRequest( changes, areaName ) {
  if ( areaName === TARGET_STORAGE_AREA ) {
    const requestToSimulateExtensionUpdate = changes[ REQUEST_TO_SIMULATE_EXTENSION_UPDATE_KEY ];

    if ( poziworldExtension.utils.isType( requestToSimulateExtensionUpdate, 'object' ) && requestToSimulateExtensionUpdate.newValue === REQUEST_TO_SIMULATE_EXTENSION_UPDATE_VALUE ) {
      poziworldExtension.background.requestToSimulateExtensionUpdate();
    }
  }
}
