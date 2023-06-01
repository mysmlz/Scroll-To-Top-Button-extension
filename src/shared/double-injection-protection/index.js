/**
 * @file Avoid executing the same logic, such as injecting the button(s), multiple times on the same page: The same content scripts could be injected multiple times on one page: 1) In Basic mode, when clicking the browser action. 2) When navigating between different views/pages of a single-page application (SPA), such as going from Inbox to Sent and vice versa on Gmail, changes the URL, but it's still the same page, only the email list changes.
 */

const READY_TO_INJECT_FILES_EVENT = 'filesReady';
const STATE_READY = 'ready';

export async function isAlreadyInjected( tabId ) {
  try {
    const { state } = await browser.tabs.sendMessage( tabId, {
      event: READY_TO_INJECT_FILES_EVENT,
    } );

    if ( state === STATE_READY ) {
      return true;
    }
  }
  catch ( error ) {
    // @todo
  }

  return false;
}

export function addMessageListener() {
  browser.runtime.onMessage.addListener( handleMessage );
}

function handleMessage( { event }, sender, sendResponse ) {
  if ( event === READY_TO_INJECT_FILES_EVENT ) {
    sendResponse( {
      state: STATE_READY,
    } );
  }

  // @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#addlistener_syntax}
  return false;
}
