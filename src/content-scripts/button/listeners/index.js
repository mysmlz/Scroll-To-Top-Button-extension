import { addButtonsClickListeners } from './click';
import { addButtonsHoverListeners } from './hover';

/**
 * Set up event listeners.
 */

export function addButtonsListeners() {
  addButtonsHoverListeners();
  addButtonsClickListeners();
}
