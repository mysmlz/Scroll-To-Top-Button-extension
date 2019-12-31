import '@poziworld/custom-elements';

import utils from 'Shared/utils';
import { ScrollToTopButtonContainer } from './scroll-to-top-button-container';
import { ScrollToTopButton } from './scroll-to-top-button';

export const CONTAINER_TAG_NAME = 'scroll-to-top-button-container';
export const BUTTON_TAG_NAME = 'scroll-to-top-button';

/**
 * Module-specific configuration.
 */

export function setUp() {
  define();
}

/**
 * Define autonomous custom elements used to avoid style collisions.
 */

function define() {
  if ( utils.canUseCustomElements() ) {
    try {
      const customElements = window.customElements;

      customElements.define( CONTAINER_TAG_NAME, ScrollToTopButtonContainer );
      customElements.define( BUTTON_TAG_NAME, ScrollToTopButton );
    }
    catch ( error ) {
      // @todo Shouldn't be a case?
    }
  }
}
