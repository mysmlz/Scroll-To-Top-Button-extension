import './scroll-to-top-button-container.css';

import * as feedback from 'Shared/feedback';

/**
 * Scroll To Top Button button container custom element to avoid style collisions.
 *
 * @class
 * @extends HTMLElement
 */

export class ScrollToTopButtonContainer extends HTMLElement {
  #FIRST_DETECTION_INDEX = 1;
  #WARNING_COUNT = 10;

  #styleWatcher;
  #styleChangesDetectedCount = 0;
  #firstDetectionTimestamp;

  connectedCallback() {
    this.#watchStyleChanges();
  }

  #watchStyleChanges() {
    // @todo Figure out why “static get observedAttributes() { return [ 'data-default-background-color', 'style', ]; }” and “attributeChangedCallback() { this.#resetStyle(); }” didn't work
    this.#styleWatcher = new MutationObserver( ( mutations ) => { this.#handleStyleAttributeChanges( mutations ); } );

    this.#styleWatcher.observe( this, {
      attributes: true,
      attributeFilter: [
        'style',
      ],
    } );
  }

  #stopWatchingStyleChanges() {
    this.#styleWatcher.disconnect();
  }

  #handleStyleAttributeChanges( mutations ) {
    if ( this.#isStyleEmpty( mutations ) ) {
      return;
    }

    this.#stopWatchingIfMaxCount();
    this.#resetStyle();
  }

  #isStyleEmpty( mutations ) {
    return ! poziworldExtension.utils.isNonEmptyString( mutations[ 0 ].target.getAttribute( 'style' ) );
  }

  /**
   * In order to not increase the CPU usage, stop fighting the style attribute changes after the threshold number of changes and notify the user.
   */

  #stopWatchingIfMaxCount() {
    this.#styleChangesDetectedCount += 1;

    if ( this.#styleChangesDetectedCount === this.#FIRST_DETECTION_INDEX ) {
      this.#firstDetectionTimestamp = getTimestamp();
    }
    else if ( this.#styleChangesDetectedCount === this.#WARNING_COUNT ) {
      const timeFromFirstDetection = getTimestamp() - this.#firstDetectionTimestamp;

      const ISSUE_MESSAGE_JSON_KEY = 'containerStyleAttributeRepeatedChangesIssue';
      // Don't translate, as this gets sent to developer
      const ISSUE_TITLE = 'Repeated style attribute changes issue';
      // Don't translate, as this gets sent to developer
      // @todo Pass extension version.
      const debuggingInformation = `
Attempts so far: ${ this.#WARNING_COUNT }
Milliseconds since first attempt: ${ new Intl.NumberFormat().format( timeFromFirstDetection ) }
Current URL: ${ window.location.href }`;

      feedback.requestToReportIssue( ISSUE_MESSAGE_JSON_KEY, ISSUE_TITLE, debuggingInformation );
      this.#stopWatchingStyleChanges();
    }
  }

  #resetStyle() {
    this.removeAttribute( 'style' );
  }
}

function getTimestamp() {
  return new Date().getTime();
}
