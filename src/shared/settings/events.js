const settingsReadyEventFiredOnObject = globalThis;
// @todo Is there a better way? Setting local boolean doesn't work, as different modules that include this one save different state
const SETTINGS_READY_KEY = '__STTB_SETTINGS_READY__';
const SETTINGS_READY_EVENT = 'settingsReady';
const SETTINGS_READY_DEFAULT = true;

export function areSettingsReady() {
  return settingsReadyEventFiredOnObject[ SETTINGS_READY_KEY ] ?? SETTINGS_READY_DEFAULT;
}

export function addSettingsReadyEventListener( callback ) {
  settingsReadyEventFiredOnObject.addEventListener( SETTINGS_READY_EVENT, callback );
  settingsReadyEventFiredOnObject.addEventListener( SETTINGS_READY_EVENT, () => settingsReadyEventFiredOnObject.removeEventListener( SETTINGS_READY_EVENT, callback ) );
}

export function signalSettingsNotReady() {
  const SETTINGS_READY = false;

  setSettingsReady( SETTINGS_READY );
}

export function signalSettingsReady() {
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
