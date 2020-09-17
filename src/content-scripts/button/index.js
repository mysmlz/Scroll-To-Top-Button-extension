import * as settingsHelpers from 'Shared/settings';

import * as settingsModuleHelpers from './settings';
import * as modes from './settings/modes';
import * as elements from './elements';
import * as visualProperties from './visual-properties';
import * as listeners from '../listeners';

export async function setUp() {
  const settings = await settingsHelpers.getSettings();

  settingsModuleHelpers.normalizeSettings( settings );
}

/**
 * Inject the button(s) (if needed), add listeners.
 */

export function init() {
  if ( ! modes.isBrowserActionTopOnlyMode() && ! modes.isKeyboardOnlyMode() ) {
    elements.createElements();
    listeners.addNonKeyboardOnlyModeListeners();
    visualProperties.switchVisualProperties();
  }

  listeners.addAllModeListeners();
}
