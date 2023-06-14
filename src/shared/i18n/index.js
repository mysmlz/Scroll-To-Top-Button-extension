import * as eventsHelpers from 'Shared/events';

const legacyI18n = getI18n();

function getI18n() {
  if ( ! window.poziworldExtension?.i18n ) {
    eventsHelpers.addListener( {
      name: eventsHelpers.EVENT_NAMES.i18nExposed,
      callback: getI18n,
      oneTime: true,
    } );

    return null;
  }

  return window.poziworldExtension.i18n;
}

export async function getMessage( key, substitutions ) {
  await legacyI18n.init();

  return legacyI18n.getMessage( key, substitutions );
}
