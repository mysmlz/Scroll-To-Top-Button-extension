import * as settings from 'Shared/settings';

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
  console.log( 'onInstalled', details );

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
  if ( await settings.mightHaveHadVersion8InstalledBefore() && ! await settings.hadAskedToNotShowWarningAgain() && ! await settings.haveGrantedPermissionsAtLeastOnce() ) {
    window.Global.openOptionsPage( 'breaking-changes-warning' );
  }
}
