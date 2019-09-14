import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce';

import { ScrollToTopButtonContainer } from './scroll-to-top-button-container';
import { ScrollToTopButton } from './scroll-to-top-button';

import './custom-elements.css';

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
  customElements.define( CONTAINER_TAG_NAME, ScrollToTopButtonContainer );
  customElements.define( BUTTON_TAG_NAME, ScrollToTopButton );
}
