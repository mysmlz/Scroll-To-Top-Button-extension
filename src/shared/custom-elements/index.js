import { SttbContainer } from './sttb-container';
import { Sttb } from './sttb';

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
  customElements.define( 'scroll-to-top-button-container', SttbContainer );
  customElements.define( 'scroll-to-top-button', Sttb );
}
