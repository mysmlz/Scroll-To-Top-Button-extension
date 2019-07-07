import '@webcomponents/webcomponentsjs/bundles/webcomponents-sd-ce';

import { ScrollToTopButtonContainer } from './scroll-to-top-button-container';
import { ScrollToTopButton } from './scroll-to-top-button';

import './custom-elements.css';

setUp();

/**
 * Module-specific configuration.
 */

function setUp() {
  define();
}

/**
 * Define autonomous custom elements used to avoid style collisions.
 */

function define() {
  customElements.define( 'scroll-to-top-button-container', ScrollToTopButtonContainer );
  customElements.define( 'scroll-to-top-button', ScrollToTopButton );
}
