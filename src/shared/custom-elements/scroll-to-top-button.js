const KEY_CODES = {
  ENTER: 13,
  SPACEBAR: 32,
};

/**
 * Scroll To Top Button button custom element to avoid style collisions.
 *
 * @class
 * @extends HTMLElement
 */

export class ScrollToTopButton extends HTMLElement {
  /**
   * Define all the functionality the element will have when an instance of it is instantiated.
   */

  constructor() {
    super();

    addListeners( this );
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element. This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
   */

  connectedCallback() {
    addSemantics( this );
  }
}

/**
 * The addition of event handlers to handle commonly-expected button behaviours helps convey the semantics of the button to Web browser users.
 *
 * Reference: https://w3c.github.io/webcomponents/spec/custom/#drawbacks-of-autonomous-custom-elements
 *
 * @param {ScrollToTopButton} element
 */

function addListeners( element ) {
  element.addEventListener( 'keydown', simulateClick );
}

/**
 * 1) The addition of the tabindex attribute makes an element interactive content, thus making it focusable.
 * 2) Setting the role attribute to "button" will convey the semantics that this is a button, enabling users to successfully interact with the control using usual button-like interactions in their accessibility technology.
 *
 * Reference: https://w3c.github.io/webcomponents/spec/custom/#drawbacks-of-autonomous-custom-elements
 *
 * @param {ScrollToTopButton} element
 */

function addSemantics( element ) {
  element.setAttribute( 'role', 'button' );
  element.setAttribute( 'tabindex', '0' );
}

/**
 * Pressing Enter or Spacebar should act as a mouse click.
 *
 * @param {MouseEvent} event
 */

function simulateClick( event ) {
  /**
   * @todo Switch to code or key.
   */

  const keyCode = event.keyCode || event.which;

  if ( keyCode === KEY_CODES.ENTER || keyCode === KEY_CODES.SPACEBAR ) {
    this.dispatchEvent( new MouseEvent( 'click', {
      bubbles: true,
      cancelable: true,
    } ) );
  }
}
