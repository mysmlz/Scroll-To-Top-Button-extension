import * as elements from '../button/elements';
import * as visualProperties from '../button/visual-properties';
import * as listenersUtils from './utils';

/**
 * Monitor for the fullscreenchange event to hide the button(s), as it's most likely a video player and it doesn't need the button(s).
 */

export function addFullscreenchangeListener() {
  document.addEventListener( 'webkitfullscreenchange', handleFullscreenchangeEvent );
  document.addEventListener( 'mozfullscreenchange', handleFullscreenchangeEvent );
  document.addEventListener( 'msfullscreenchange', handleFullscreenchangeEvent );
  document.addEventListener( 'fullscreenchange', handleFullscreenchangeEvent );
}

/**
 * Hide the button(s) when fullscreen is activated (most likely, a video player).
 */

function handleFullscreenchangeEvent() {
  if ( document.contains( elements.container ) ) {
    const buttonsToBeVisible = ! listenersUtils.isFullscreenActive();

    visualProperties.toggleButtons( buttonsToBeVisible );
  }
}
