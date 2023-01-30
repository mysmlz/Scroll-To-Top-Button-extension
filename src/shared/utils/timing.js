/**
 * Pause/suspend execution for the specified period of time.
 *
 * @param {number} ms - Delay in milliseconds.
 * @returns {Promise<void>}
 */

export function sleep( ms ) {
  return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}
