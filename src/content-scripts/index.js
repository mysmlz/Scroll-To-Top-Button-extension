import * as activeTab from './active-tab';
import * as button from './button';

stubLog();
// @todo Don't run in browser action (advanced) modes.
activeTab.runChecks()
  .then( button.setUp )
  .then( button.init )
  .catch( abort );

/**
 * Disable logging to Dev Tools from the content script.
 *
 * @todo Refactor {@link Log} instead.
 */

function stubLog() {
  window.ContentScript = {};
}

/**
 * There is nothing left to do, abort.
 */

function abort() {
  /**
   * @todo Anything?
   */
}
