import utils from 'Shared/utils';

export async function init( callerPageName ) {
  await window.poziworldExtension.i18n.init();
  localize( callerPageName );
}

export function localize( callerPageName, customParentSelector ) {
  const customParentToBeUsed = window.poziworldExtension.utils.isNonEmptyString( customParentSelector );
  const parentSelector = customParentToBeUsed ? `${ customParentSelector } ` : '';
  const elementsToLocalize = [ ... document.querySelectorAll( `${ parentSelector }[data-i18n]` ) ];

  while ( elementsToLocalize.length ) {
    const elementToLocalize = elementsToLocalize.shift();
    const localeKey = elementToLocalize.getAttribute( 'data-i18n' );
    const nonLocalizedSubstitutionsString = elementToLocalize.getAttribute( 'data-i18n-parameters' );
    let localizedMessage;

    if ( window.poziworldExtension.utils.isNonEmptyString( localeKey ) ) {
      let substitutions;

      if ( window.poziworldExtension.utils.isNonEmptyString( nonLocalizedSubstitutionsString ) ) {
        substitutions = nonLocalizedSubstitutionsString
          .split( '|' )
          .map( ( substitution ) => window.poziworldExtension.i18n.getMessage( substitution ) );
      }

      localizedMessage = window.poziworldExtension.i18n.getMessage( localeKey, substitutions );

      if ( elementToLocalize.nodeName === 'LABEL' ) {
        elementToLocalize.innerHTML = utils.getSanitizedHtml( `${ elementToLocalize.innerHTML }${ localizedMessage }` );
      }
      else if ( elementToLocalize.nodeName === 'A' && shouldHaveInnerHtml( elementToLocalize ) ) {
        elementToLocalize.innerHTML = utils.getSanitizedHtml( localizedMessage );

        if ( elementToLocalize.href === '' ) {
          elementToLocalize.href = window.poziworldExtension.i18n.getMessage( `${ localeKey }Href` );
        }
      }
      else if ( elementToLocalize.nodeName === 'IMG' ) {
        elementToLocalize.alt = localizedMessage;
      }
      else if ( elementToLocalize.nodeName === 'OPTGROUP' ) {
        elementToLocalize.label = localizedMessage;
      }
      else if ( shouldHaveInnerHtml( elementToLocalize ) ) {
        elementToLocalize.innerHTML = utils.getSanitizedHtml( localizedMessage );
      }
    }

    if ( elementToLocalize.classList.contains( 'i18nTitle' ) ) {
      elementToLocalize.title = localizedMessage;
    }
    else {
      const tooltip = elementToLocalize.getAttribute( 'data-i18n-tooltip' );

      if ( window.poziworldExtension.utils.isNonEmptyString( tooltip ) ) {
        elementToLocalize.title = window.poziworldExtension.i18n.getMessage( tooltip );
      }
    }
  }

  if ( ! customParentToBeUsed && callerPageName ) {
    document.title = window.poziworldExtension.i18n.getMessage( `${ callerPageName }Title` );
  }
}

function shouldHaveInnerHtml( element ) {
  return ! element.classList.contains( 'i18nNoInner' );
}

/**
 * Translations contain <a /> elements, but href attributes aren't specified there.
 *
 * @param {string[][]} links
 */

export function setLinks( links ) {
  const LINK_ELEMENT_ID_INDEX = 0;
  const LINK_URL_INDEX = 1;

  while ( links.length ) {
    const link = links.shift();
    const linkElement = document.getElementById( link[ LINK_ELEMENT_ID_INDEX ] );

    if ( linkElement ) {
      linkElement.href = link[ LINK_URL_INDEX ];
    }
  }
}
