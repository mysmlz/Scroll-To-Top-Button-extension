import utils from 'Shared/utils';
import * as pages from 'Shared/pages';
import * as incentives from 'Shared/incentives';

const GENERIC_CONTACT_FORM_LINK = 'https://goo.gl/forms/QMZFZfgKjQHOnRCX2';

/**
 * Translations contain <a /> elements, but href attributes aren't specified there.
 */

export function setLinks() {
  const links = [
    [
      'issueReportingLink',
      getGenericContactFormLink(),
    ],
    [
      'genericContactFormLink',
      getGenericContactFormLink(),
    ],
    [
      'translateLink',
      'https://www.transifex.com/poziworld/scroll-to-top-button/'
    ],
    [
      'releaseLink',
      'https://github.com/PoziWorld/Scroll-to-Top-Button-Extension/releases'
    ],
    [
      'officialWebsiteLink',
      'https://scroll-to-top-button.com'
    ],
  ];

  pages.setLinks( links );
  incentives.setLinks();

  const translatedBy = document.getElementById( 'translatedBy' );
  const rateLink = document.getElementById( 'rateLink' );

  if ( translatedBy && translatedBy.textContent.length > 1 ) {
    translatedBy.hidden = false;
  }

  if ( rateLink ) {
    let strRateLink = 'https://chrome.google.com/webstore/detail/scroll-to-top-button/chinfkfmaefdlchhempbfgbdagheknoj/reviews';

    // Show appropriate link for Opera (snippet from http://stackoverflow.com/a/9851769)
    if ( ( !! window.opr && !! opr.addons ) || !! window.opera || navigator.userAgent.indexOf( ' OPR/' ) >= 0 ) {
      strRateLink = 'https://addons.opera.com/extensions/details/scroll-to-top-button/';
    }
    // Firefox
    else if ( typeof InstallTrigger !== 'undefined' ) {
      strRateLink = 'https://addons.mozilla.org/firefox/addon/scroll-to-top-button-extension/';
    }
    else if ( utils.isEdge() ) {
      strRateLink = getGenericContactFormLink();
    }

    document.getElementById( 'rateLink' ).href = strRateLink;
  }
}

export function getGenericContactFormLink() {
  return GENERIC_CONTACT_FORM_LINK;
}
