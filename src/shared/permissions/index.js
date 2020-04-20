export const EXPERT_BUTTON_MODES_PERMISSIONS = {
  origins: [
    '<all_urls>',
  ],
  permissions: [
    'tabs',
  ],
};

/**
 * Expert button modes require certain permissions. Check whether those permissions have been granted.
 *
 * @return {boolean}
 */

export async function hasPermissions() {
  // @todo Figure out why browser.permissions.contains returns false for origins <all_urls>, whereas browser.permissions.getAll lists it. Related: {@link https://bugs.chromium.org/p/chromium/issues/detail?id=931816}
  return browser.permissions.contains( EXPERT_BUTTON_MODES_PERMISSIONS );
}
