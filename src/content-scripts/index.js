import * as doubleInjectionProtection from 'Shared/double-injection-protection';
import * as activeTab from './active-tab';
import * as button from './button';

init();

async function init() {
  stubLog();
  doubleInjectionProtection.addMessageListener();

  try {
    // @todo Don't run in browser action (advanced) modes.
    await activeTab.runChecks();
    await button.init();
  }
  catch ( error ) {
    // @todo
  }
}

/**
 * Disable logging to Dev Tools from the content script.
 *
 * @todo Refactor {@link Log} instead.
 */

function stubLog() {
  window.ContentScript = {};
}
