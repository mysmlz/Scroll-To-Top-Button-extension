import * as settings from 'Shared/settings';

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
// Some users experience an issue where after browser restart ALL_URLS_ORIGIN is no longer there for some reason (haven't been able to reproduce to fix it)
export const EXPERT_BUTTON_MODES_ALTERNATIVE_PERMISSIONS = {
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
  const permissionsGranted = await browser.permissions.contains( EXPERT_BUTTON_MODES_PERMISSIONS );
  Log.add( 'hasPermissions', permissionsGranted, true );

  if ( ! permissionsGranted ) {
    // @todo Figure out why browser.permissions.contains returns false for origins <all_urls>, whereas browser.permissions.getAll lists it. Related: {@link https://bugs.chromium.org/p/chromium/issues/detail?id=931816}
    const {
      [ ORIGINS_KEY ]: origins,
      [ PERMISSIONS_KEY ]: permissions,
    } = await browser.permissions.getAll();
    const originsIncluded = origins.includes( ALL_URLS_ORIGIN ) || origins.includes( ALL_URLS_ALTERNATIVE_ORIGIN );
    const permissionsIncluded = permissions.includes( TABS_PERMISSION );

    Log.add( 'hasPermissions fallback', {
      origins,
      originsIncluded,
      permissions,
      permissionsIncluded,
    }, true );

    return ( originsIncluded && permissionsIncluded );
  }

  return permissionsGranted;
}

export async function requestPermissions( fallbackPermissionIncluded ) {
  return browser.permissions.request( fallbackPermissionIncluded ?
    EXPERT_BUTTON_MODES_ALTERNATIVE_PERMISSIONS :
    EXPERT_BUTTON_MODES_PERMISSIONS );
}

export async function rememberGrantedAtLeastOnce( granted ) {
  try {
    await browser.storage.local.set( {
      [ settings.HAVE_GRANTED_PERMISSIONS_AT_LEAST_ONCE_KEY ]: granted,
    } );
  }
  catch ( error ) {
    // @todo
  }
}
