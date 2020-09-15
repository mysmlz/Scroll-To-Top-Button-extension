/**
 * In the markup, languages are sorted by language codes.
 * When showing to user, sort by language names in the current language.
 */

export function sortLanguages() {
  const uiLanguage = document.getElementById( 'uiLanguage' );

  if ( uiLanguage ) {
    const currentLanguage = uiLanguage.value;
    const languages = Array.from( uiLanguage.children );
    // Keep “Automatic (browser default)” always first in the sorted list
    const automaticLanguage = languages.shift();

    languages.sort( sortByTextContent );

    const sortedLanguages = [ automaticLanguage ].concat( languages );

    uiLanguage.innerHTML = '';

    while ( sortedLanguages.length ) {
      uiLanguage.append( sortedLanguages.shift() );
    }

    // Once sorted, the last option gets selected, if the language hasn't been previously set
    uiLanguage.value = currentLanguage;
  }
}

/**
 * Sort Nodes by their text content.
 *
 * @todo Abstract away and move out.
 * @param {Node} a
 * @param {Node} b
 * @returns {number}
 */

function sortByTextContent( a, b ) {
  const aTextContent = a.textContent;
  const bTextContent = b.textContent;

  if ( aTextContent < bTextContent ) {
    return -1;
  }
  else if ( aTextContent > bTextContent ) {
    return 1;
  }

  return 0;
}

/**
 * Set lang attribute value on <html />.
 */

export function setDocumentLanguage() {
  const i18n = window.i18next;

  if ( i18n ) {
    const language = i18n.language;

    if ( poziworldExtension.utils.isNonEmptyString( language ) ) {
      const PLATFORM_LANGUAGE_SEPARATOR = '_';
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang#Language_tag_syntax
      const LANGUAGE_TAG_SEPARATOR = '-';

      document.documentElement.lang = language.replace( PLATFORM_LANGUAGE_SEPARATOR, LANGUAGE_TAG_SEPARATOR );
    }
  }
}

/**
 * Check whether a new language has been chosen.
 *
 * @param {object} settings - Key-value pairs of the main extension settings (the ones set on the Options page).
 * @param {object} originalSettings - Key-value pairs of the main extension settings, which user has had on page load before any changes.
 * @returns {boolean}
 */

export function isLanguageBeingChanged( settings, originalSettings ) {
  const newUiLanguage = settings.uiLanguage;

  if ( poziworldExtension.utils.isNonEmptyString( newUiLanguage ) ) {
    return newUiLanguage !== originalSettings.uiLanguage;
  }

  return false;
}
