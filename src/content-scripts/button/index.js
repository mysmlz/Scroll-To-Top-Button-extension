import * as settings from './settings';
import * as modes from './settings/modes';
import * as elements from './elements';
import * as visualProperties from './visual-properties';
import * as listeners from '../listeners';

/**
 * To get started, retrieve the settings from the Storage and normalize them.
 *
 * @param {resolve} resolve
 * @param {reject} reject
 * @returns {Promise<void>}
 */

export function setUp( resolve, reject ) {
  return new Promise( settings.retrieveSettingsFromStorage )
    .then( settings.normalizeSettings );
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
