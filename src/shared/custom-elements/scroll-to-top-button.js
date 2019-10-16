import 'dom4';

import {
  getDocumentFragment,
  getUrl,
} from '../utils';
import keyCodes from '../constants/key-codes';

import './scroll-to-top-button.css';

/**
 * Scroll To Top Button button custom element to avoid style collisions.
 *
 * @class
 * @extends HTMLElement
 */

export class ScrollToTopButton extends HTMLElement {
  /**
   * DOM and related.
   */

  #shadow;
  #image;
  #imagePath;

  /**
   * Settings.
   */

  #mode;
  #design;
  #size;
  #width;
  #height;
  #opacity;

  /**
   * Button image constants.
   */

  #IMAGE_PATH_MODE_DUAL_PLACEHOLDER = '$MODE_DUAL$';
  #IMAGE_PATH_MODE_DUAL_VALUE = '-dual';
  #IMAGE_PATH_DESIGN_PIXELATED_PLACEHOLDER = '$DESIGN_PIXELATED$';
  #IMAGE_PATH_DESIGN_PIXELATED_VALUE = '-pixelated';
  #IMAGE_PATH_NO_VALUE = '';
  #IMAGE_PATH = `shared/buttons/scroll-to-top-button${ this.#IMAGE_PATH_MODE_DUAL_PLACEHOLDER }${ this.#IMAGE_PATH_DESIGN_PIXELATED_PLACEHOLDER }.svg`;

  #IMAGE_BODY_ID = 'canvas'; // Can't use id="body"
  #IMAGE_ARROW_ID = 'arrow';

  /**
   * Mode constants.
   */

  #MODE_DUAL_VALUE = 'dual';

  /**
   * Design constants.
   */

  #CSS_PATH = 'shared/buttons/buttons.css';

  #DESIGN_VALUE_DIVIDER = '_';
  #DESIGN_PIXELATED_INDICATOR = 'pixel';
  #DESIGN_ARROW_ONLY_VALUE = 'only';
  #DESIGN_ARROW_ONLY_CLASS = 'designArrowOnly';

  #COLORS = {
    blue: '#6d8aa5',
    grey: '#707070',
    black: '#000',
    red: '#e95f5f',
    orange: '#fac300',
    yellow: '#fff853',
    green: '#66e45f',
    blue2: '#5f99e4',
    purple: '#8b6ca6',
    pink: '#f8c5ff',
  };

  /**
   * Size constants.
   */

  /** @var {string} customSizeIndicator */
  #CUSTOM_SIZE_INDICATOR = '-1'; // All values come as strings
  #SUGGESTED_SIZE_REGEXP = '\\d{2}px'; // '35px', '50px', etc.

  #DEFAULT_WIDTH = 50;
  #MIN_WIDTH = 1;
  #MAX_WIDTH = 500;

  #DEFAULT_HEIGHT = 50;
  #MIN_HEIGHT = 1;
  #MAX_HEIGHT = 500;

  /**
   * Define all the functionality the element will have when an instance of it is instantiated.
   */

  constructor() {
    super();

    this.#createShadowRoot();
    this.#addListeners();
    this.#getButtonPreferences();
    this.#setButtonImagePath();

    // Avoid race condition where arrow-only button “flashes” because CSS gets loaded after image had been appended
    const promiseImage = this.#getButtonImage()
      .then( this.#configureButtonImage );
    const promiseCss = new Promise( this.#loadButtonCss );

    Promise.all( [
      promiseImage,
      promiseCss,
    ] )
      .then( this.#setButtonImage );
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element. This will happen each time the node is moved, and may happen before the element's contents have been fully parsed.
   */

  connectedCallback() {
    this.#addSemantics();
  }

  /**
   * Avoid accidental collisions with document-level CSS by using Shadow DOM.
   *
   * Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
   */

  #createShadowRoot() {
    this.#shadow = this.attachShadow( {
      mode: 'closed',
    } );
  }

  /**
   * The addition of event handlers to handle commonly-expected button behaviors helps convey the semantics of the button to Web browser users.
   *
   * Reference: https://w3c.github.io/webcomponents/spec/custom/#drawbacks-of-autonomous-custom-elements
   */

  #addListeners() {
    this.addEventListener( 'keydown', this.#simulateClick );
  }

  /**
   * Read button settings from the data attributes of the element.
   */

  #getButtonPreferences() {
    const {
      mode,
      design,
      size,
      width,
      height,
      opacity,
    } = this.dataset;

    this.#mode = mode;
    this.#design = design;
    this.#size = size;
    this.#width = width;
    this.#height = height;
    this.#opacity = opacity;
  }

  /**
   * Pick the right button image file depending on settings.
   */

  #setButtonImagePath() {
    this.#imagePath = this.#IMAGE_PATH
      .replace(
        this.#IMAGE_PATH_MODE_DUAL_PLACEHOLDER,
        ( this.#mode === this.#MODE_DUAL_VALUE ) ?
          this.#IMAGE_PATH_MODE_DUAL_VALUE :
          this.#IMAGE_PATH_NO_VALUE
      )
      .replace(
        this.#IMAGE_PATH_DESIGN_PIXELATED_PLACEHOLDER,
        this.#design.includes( this.#DESIGN_PIXELATED_INDICATOR ) ?
          this.#IMAGE_PATH_DESIGN_PIXELATED_VALUE :
          this.#IMAGE_PATH_NO_VALUE
      );
  }

  /**
   * Request the button image file contents (markup of the SVG file).
   *
   * @return {Promise<string>}
   */

  #getButtonImage() {
    return fetch( getUrl( this.#imagePath ) )
      .then( response => response.text() );
  }

  /**
   * Request the button-related CSS file.
   */

  #loadButtonCss = ( resolve ) => {
    const link = document.createElement( 'LINK' );

    link.rel = 'stylesheet';
    link.href = getUrl( this.#CSS_PATH );
    link.addEventListener( 'load', resolve );

    this.#shadow.append( link );
  };

  /**
   * Customize the button image per user preferences (settings).
   *
   * @param {string} imageMarkup
   */

  #configureButtonImage = ( imageMarkup ) => {
    this.#prepareButtonImage( imageMarkup );
    this.#checkSizePreference();
    this.#normalizeDimensions();
    this.#setDimensions();
    this.#setColors();
  };

  /**
   * Convert the markup of the loaded button image into a DocumentFragment, so it's easy to modify its properties (size, color, etc.).
   *
   * @param {string} imageMarkup
   */

  #prepareButtonImage( imageMarkup ) {
    const imageFragment = getDocumentFragment( imageMarkup );

    this.#image = imageFragment.firstChild;
  }

  /**
   * Check whether user picked one of the suggested sizes or customized.
   */

  #checkSizePreference() {
    const size = this.#size;

    // User picked one of the suggested sizes
    if ( size !== this.#CUSTOM_SIZE_INDICATOR && RegExp( this.#SUGGESTED_SIZE_REGEXP ).test( size ) ) {
      const sizeInPixels = parseInt( size );

      this.#width = sizeInPixels;
      this.#height = sizeInPixels;
    }
  }

  /**
   * Make sure the desired button image width and height are not too big or too small.
   */

  #normalizeDimensions() {
    this.#width = this.#normalizeDimension( this.#width, this.#MIN_WIDTH, this.#MAX_WIDTH, this.#DEFAULT_WIDTH );
    this.#height = this.#normalizeDimension( this.#height, this.#MIN_HEIGHT, this.#MAX_HEIGHT, this.#DEFAULT_HEIGHT );

    if ( this.#mode === 'dual' ) {
      this.#height = this.#height / 2;
    }
  }

  /**
   * Apply the normalized width and height to the button image.
   */

  #setDimensions() {
    this.#setDimension( 'width', this.#width );
    this.#setDimension( 'height', this.#height );
  }

  /**
   * Make sure the provided button image dimension is not too big or too small.
   *
   * @param {string} dimension
   * @param {number} minValue
   * @param {number} maxValue
   * @param {number} defaultValue
   * @return {number}
   */

  #normalizeDimension( dimension, minValue, maxValue, defaultValue ) {
    if ( isNaN( dimension ) || dimension < minValue || dimension > maxValue ) {
      dimension = defaultValue;
    }

    return parseInt( dimension );
  }

  /**
   * Apply the specified dimension to the button image.
   */

  #setDimension( dimensionName, value ) {
    this.#image[ dimensionName ].baseVal.value = value;
  }

  /**
   * Set the color and opacity of the button image “body” (area around the arrow) and arrow.
   *
   * CSS implementation for color would require writing extra lines and it would still not be used when color customization is implemented (there would be CSS for default colors and JavaScript for custom colors, making it harder to maintain).
   */

  #setColors() {
    // Reverse, as color always goes last by default (see select#buttonDesign in static/options/index.html)
    const [ color, design ] = this.#design.split( this.#DESIGN_VALUE_DIVIDER ).reverse();
    let targetId = this.#IMAGE_BODY_ID;

    if ( design === this.#DESIGN_ARROW_ONLY_VALUE ) {
      targetId = this.#IMAGE_ARROW_ID;

      this.#image.classList.add( this.#DESIGN_ARROW_ONLY_CLASS );
    }

    this.#image.getElementById( targetId ).style.fill = this.#COLORS[ color ];
    this.style.opacity = this.#opacity;
  }

  /**
   * Add the image to the button element.
   */

  #setButtonImage = () => {
    this.#shadow.append( this.#image );
  };

  /**
   * 1) The addition of the tabindex attribute makes an element interactive content, thus making it focusable.
   * 2) Setting the role attribute to "button" will convey the semantics that this is a button, enabling users to successfully interact with the control using usual button-like interactions in their accessibility technology.
   *
   * Reference: https://w3c.github.io/webcomponents/spec/custom/#drawbacks-of-autonomous-custom-elements
   */

  #addSemantics() {
    this.setAttribute( 'role', 'button' );
    this.setAttribute( 'tabindex', '0' );
  }

  /**
   * Pressing Enter or Space bar should act as a mouse click.
   *
   * @param {KeyboardEvent} event
   */

  #simulateClick( event ) {
    const keyCode = event.keyCode || event.which;

    if ( keyCode === keyCodes.enter || keyCode === keyCodes.space ) {
      this.dispatchEvent( new MouseEvent( 'click', {
        bubbles: true,
        cancelable: true,
      } ) );
    }
  }
}
