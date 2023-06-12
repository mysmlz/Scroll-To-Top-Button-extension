export const EVENT_NAMES = {
  noScrollableElementSet: 'noScrollableElementSet',
  scrollableElementSet: 'scrollableElementSet',
}

export function addListener( { name, callback, oneTime = false } ) {
  globalThis.addEventListener( name, callback );

  if ( oneTime ) {
    globalThis.addEventListener( name, () => globalThis.removeEventListener( name, callback ) );
  }
}

export function fireEvent( name ) {
  globalThis.dispatchEvent( new CustomEvent( name ) );
}
