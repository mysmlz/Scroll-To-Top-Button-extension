const settingsReadyEventFiredOnObject = globalThis;
// @todo Is there a better way? Setting local boolean doesn't work, as different modules that include this one save different state
const SETTINGS_READY_KEY = '__STTB_SETTINGS_READY__';
const SETTINGS_READY_EVENT = 'settingsReady';
const SETTINGS_NOT_READY_EVENT = 'settingsNotReady';
const SETTINGS_READY_DEFAULT = true;

const callbacks = {};

init();

function init() {
  addListeners();
}

function addListeners() {
  browser.runtime.onMessage.addListener( handleMessage );
}

function handleMessage( { event } ) {
  if ( event === SETTINGS_NOT_READY_EVENT ) {
    signalSettingsNotReady();
  }
  else if ( event === SETTINGS_READY_EVENT ) {
    signalSettingsReady();
  }
}

export function areSettingsReady() {
  return settingsReadyEventFiredOnObject[ SETTINGS_READY_KEY ] ?? SETTINGS_READY_DEFAULT;
}

export function addSettingsReadyEventListener( callback, callbackName ) {
  // Prevent multiple calls of the same callback
  if ( callbackName ) {
    if ( callbacks[ callbackName ] ) {
      return;
    }

    callbacks[ callbackName ] = true;
  }

  settingsReadyEventFiredOnObject.addEventListener( SETTINGS_READY_EVENT, callback );
  settingsReadyEventFiredOnObject.addEventListener( SETTINGS_READY_EVENT, () => settingsReadyEventFiredOnObject.removeEventListener( SETTINGS_READY_EVENT, callback ) );
}

export function signalSettingsNotReady() {
  Log.add( 'signalSettingsNotReady', null, false, {
    level: 'debug',
  } );

  const SETTINGS_READY = false;

  setSettingsReady( SETTINGS_READY );
}

export function signalSettingsReady() {
  Log.add( 'signalSettingsReady', null, false, {
    level: 'debug',
  } );

  const SETTINGS_READY = true;

  setSettingsReady( SETTINGS_READY );
  fireEvent();
}

// @todo Reset/recheck on any settings/storage change (from Options)?
function setSettingsReady( ready ) {
  settingsReadyEventFiredOnObject[ SETTINGS_READY_KEY ] = ready;
}

function fireEvent() {
  const event = new CustomEvent( SETTINGS_READY_EVENT );

  settingsReadyEventFiredOnObject.dispatchEvent( event );
}

export function requestToSignalSettingsToBeUpdated() {
  browser.runtime.sendMessage( {
    event: SETTINGS_NOT_READY_EVENT,
  } );
}

export function requestToSignalSettingsGotUpdated() {
  browser.runtime.sendMessage( {
    event: SETTINGS_READY_EVENT,
  } );
}
