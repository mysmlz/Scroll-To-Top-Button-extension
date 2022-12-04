import utils from 'Shared/utils';

const MARKDOWN_STYLE_LINK_REGEXP_GROUP_NAME = 'markdownStyleLink';
const LINK_TEXT_REGEXP_GROUP_NAME = 'linkText';
const LINK_URL_REGEXP_GROUP_NAME = 'linkUrl';
// Markdown-style link: [John Doe](https://example.com/John-Doe)
const markdownStyleLinkRegExp = new RegExp( String.raw`(?<${ MARKDOWN_STYLE_LINK_REGEXP_GROUP_NAME }>(\[)(?<${ LINK_TEXT_REGEXP_GROUP_NAME }>[^\]]+\.?)(\])(\()(?<${ LINK_URL_REGEXP_GROUP_NAME }>http[s]:\/\/(-\.)?([^\s\/?\.\#\-]+\.?)+(\/[^\s]*)?)(\)))`, 'g' );

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
        let sanitizedHtml = utils.getSanitizedHtml( localizedMessage );
        let matchGroups;

        for ( const linkMatch of sanitizedHtml.matchAll( markdownStyleLinkRegExp ) ) {
          matchGroups = linkMatch.groups;
          sanitizedHtml = sanitizedHtml.replace( matchGroups[ MARKDOWN_STYLE_LINK_REGEXP_GROUP_NAME ], `<a href="${ matchGroups[ LINK_URL_REGEXP_GROUP_NAME ] }" target="_blank" class="pwLink externalLink">${ matchGroups[ LINK_TEXT_REGEXP_GROUP_NAME ] }</a>` )
        }

        elementToLocalize.innerHTML = sanitizedHtml;
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
