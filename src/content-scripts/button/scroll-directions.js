export const UP = 'up';
export const DOWN = 'down';

export let currentDirection = UP;

/**
 * Change current direction.
 *
 * @param {string} direction
 */

export function setCurrentDirection( direction ) {
  currentDirection = direction;
}
