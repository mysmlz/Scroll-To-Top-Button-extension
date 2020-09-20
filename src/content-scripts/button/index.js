import * as settingsHelpers from 'Shared/settings';

import * as settingsModuleHelpers from './settings';
import * as modes from './settings/modes';
import * as elements from './elements';
import * as visualProperties from './visual-properties';
import * as listeners from '../listeners';

/**
 * Inject the button(s) (if needed), add listeners.
 */

export async function init() {
  if ( ! settingsHelpers.areSettingsReady() ) {
    settingsHelpers.addSettingsReadyEventListener( init );

    return;
  }

  try {
    const settings = await settingsHelpers.getSettings();

    settingsModuleHelpers.normalizeSettings( settings );
  }
  catch ( error ) {
    Log.add( 'Failed to set up buttons', error, false, {
      level: 'error',
    } );
  }

  if ( ! modes.isBrowserActionTopOnlyMode() && ! modes.isKeyboardOnlyMode() ) {
    elements.createElements();
    listeners.addNonKeyboardOnlyModeListeners();
    visualProperties.switchVisualProperties();
  }

  listeners.addAllModeListeners();
}
