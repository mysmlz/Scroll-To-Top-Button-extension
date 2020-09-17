import * as settingsHelpers from 'Shared/settings';

const EXTENSION_UPDATED_REASON = 'updated';
const BACKGROUND_JS_STORAGE_SAVING_DELAY = 1000;


init();

function init() {
  addListeners();
}

function addListeners() {
  browser.runtime.onStartup.addListener( scheduleWarning );
  browser.runtime.onInstalled.addListener( warnIfHadVersion8InstalledBefore );
}

function warnIfHadVersion8InstalledBefore( details ) {
  Log.add( 'warnIfHadVersion8InstalledBefore', details, true );

  if ( details.reason === EXTENSION_UPDATED_REASON ) {
    scheduleWarning();
  }
}

/**
 * Wait for background.js to finish saving the required variables in browser.storage.local.
 */

function scheduleWarning() {
  setTimeout( warnAboutBreakingChanges, BACKGROUND_JS_STORAGE_SAVING_DELAY );
}

async function warnAboutBreakingChanges() {
  if ( await settingsHelpers.mightHaveHadVersion8InstalledBefore() && ! await settingsHelpers.hadAskedToNotShowWarningAgain() && ! await settingsHelpers.haveGrantedPermissionsAtLeastOnce() ) {
    window.Global.openOptionsPage( 'breaking-changes-warning' );
  }
}
