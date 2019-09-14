import * as utils from './utils';

const MOUSEMOVE_DEBOUNCE_DELAY = 200;
export const cursorPosition = {
  x: 0,
  y: 0,
};

/**
 * Listen for the mousemove event, so when a “clickthrough key” is unpressed the “keyup” event can check the position of the cursor (not natively accessible on a key-related event) and if it's over the button then the button doesn't get shown.
 */

export function addMousemoveListener() {
  const debouncedHandler = utils.debounce( saveCursorPosition, MOUSEMOVE_DEBOUNCE_DELAY );

  document.addEventListener( 'mousemove', debouncedHandler );
}

/**
 * Save the cursor position, so when a “clickthrough key” is unpressed the “keyup” event can check the position of the cursor (not natively accessible on a key-related event) and if it's over the button then the button doesn't get shown.
 *
 * @param {MouseEvent} event - The event.
 */

function saveCursorPosition( event ) {
  cursorPosition.x = event.clientX;
  cursorPosition.y = event.clientY;
}
