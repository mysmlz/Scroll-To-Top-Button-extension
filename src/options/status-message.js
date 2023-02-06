import utils from 'Shared/utils';
import * as i18n from 'Shared/i18n';

const MESSAGE_LONGEVITY = 5_000;
const EMPTY_MESSAGE_TEXT = '';

let messageElement = null;

export function init( element ) {
  setElement( element );
}

function setElement( element ) {
  messageElement = element;
}

export async function show( translationKey ) {
  try {
    const message = await i18n.getMessage( translationKey );

    setText( message );
    toggleAccessibilityAttributes( {
      showing: true,
    } );
    await utils.sleep( MESSAGE_LONGEVITY );
    hide();
  }
  catch ( error ) {
    window.alert( error );
  }
}

export function hide() {
  toggleAccessibilityAttributes( {
    showing: false,
  } );
  setText( EMPTY_MESSAGE_TEXT );
}

function setText( message ) {
  messageElement.textContent = message;
}

function toggleAccessibilityAttributes( { showing } ) {
  const role = showing ?
    'status' :
    'none';
  const ariaLive = showing ?
    'polite' :
    'off';

  messageElement?.setAttribute( 'role', role );
  messageElement?.setAttribute( 'aria-live', ariaLive );
}
