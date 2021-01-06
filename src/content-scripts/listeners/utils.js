/**
 * Returns a function, that, as long as it continues to be invoked, will not be triggered. The function will be called after it stops being called for N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
 *
 * @see https://davidwalsh.name/javascript-debounce-function
 *
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */

export function debounce( func, wait, immediate ) {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;

      if ( ! immediate ) {
        func.apply( context, args );
      }
    };
    const callNow = immediate && !timeout;

    clearTimeout( timeout );

    timeout = setTimeout( later, wait );

    if ( callNow ) {
      func.apply( context, args );
    }
  };
}

/**
 * Returns a function, that, as long as it continues to be invoked, will only trigger every N milliseconds. If `immediate` is passed, trigger the function on the leading edge, instead of the trailing.
 *
 * @see https://davidwalsh.name/javascript-debounce-function
 *
 * @param func
 * @param wait
 * @param immediate
 * @returns {Function}
 */

export function throttle( func, wait, immediate ) {
  let timeout;

  return function () {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;

      if ( ! immediate ) {
        func.apply( context, args );
      }
    };
    const callNow = immediate && !timeout;

    if ( ! timeout ) {
      timeout = setTimeout( later, wait );
    }

    if ( callNow ) {
      func.apply( context, args );
    }
  };
}

/**
 * @returns {boolean}
 */

export function isFullscreenActive() {
  return !! ( document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement );
}
