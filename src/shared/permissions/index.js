import utils from 'Shared/utils';
import * as feedback from 'Shared/feedback';
import * as settingsHelpers from 'Shared/settings';

const ORIGINS_KEY = 'origins';
const ALL_URLS_ORIGIN = '<all_urls>';
const ALL_URLS_ALTERNATIVE_ORIGIN = '*://*/*';
const PERMISSIONS_KEY = 'permissions';
const TABS_PERMISSION = 'tabs';
export const EXPERT_BUTTON_MODES_PERMISSIONS = {
  [ ORIGINS_KEY ]: [
    ALL_URLS_ORIGIN,
  ],
  [ PERMISSIONS_KEY ]: [
    TABS_PERMISSION,
  ],
};
export const EXPERT_BUTTON_MODES_COMBINED_PERMISSIONS = {
  [ ORIGINS_KEY ]: [
    ALL_URLS_ORIGIN,
    ALL_URLS_ALTERNATIVE_ORIGIN,
  ],
  [ PERMISSIONS_KEY ]: [
    TABS_PERMISSION,
  ],
};

/**
 * Expert button modes require certain permissions. Check whether those permissions have been granted.
 *
 * @returns {boolean}
 */

export async function hasPermissions() {
  let permissionsGranted = false;

  try {
    // Test a theory that users' strange loss of permissions happens because of browser.permissions.contains() - Rely on .getAll only for now
    const {
      [ ORIGINS_KEY ]: origins,
      [ PERMISSIONS_KEY ]: permissions,
    } = await browser.permissions.getAll();
    const originsIncluded = origins.includes( ALL_URLS_ORIGIN ) || origins.includes( ALL_URLS_ALTERNATIVE_ORIGIN );
    const permissionsIncluded = permissions.includes( TABS_PERMISSION );

    Log.add( `hasPermissions fallback${ strLogSuccess }`, {
      origins,
      originsIncluded,
      permissions,
      permissionsIncluded,
    }, true );

    return ( originsIncluded && permissionsIncluded );
  }
  catch ( error ) {
    Log.add( `hasPermissions fallback${ strLogError }`, error, true );
    await requestToReportPermissionsCheckIssue( error );
  }

  return permissionsGranted;
}

async function requestToReportPermissionsCheckIssue( error ) {
  const installationId = await utils.getInstallationId();
  const ISSUE_MESSAGE_JSON_KEY = 'permissionsCheckIssue';
  // Don't translate, as this gets sent to developer
  const ISSUE_TITLE = 'Permissions check issue';
  // Don't translate, as this gets sent to developer
  // @todo Move out generic error report.
  const debuggingInformation = `
Version: ${ strConstExtensionVersion }
Error: ${ JSON.stringify( error ) }
Browser: ${ window.navigator.userAgent }
Anonymous installation ID: ${ installationId }`;

  await feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
}

export async function requestPermissions() {
  // Perhaps, there is still ({@link https://bugs.chromium.org/p/chromium/issues/detail?id=310815}) an issue with “<all_urls>”. Request its alternative – “*://*/*”
  return browser.permissions.request( EXPERT_BUTTON_MODES_PERMISSIONS );
}

export async function revokePermissions() {
  return browser.permissions.remove( EXPERT_BUTTON_MODES_COMBINED_PERMISSIONS );
}

export async function rememberGrantedAtLeastOnce( granted ) {
  try {
    await browser.storage.local.set( {
      [ settingsHelpers.HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY ]: granted,
    } );
  }
  catch ( error ) {
    // @todo
  }
}
