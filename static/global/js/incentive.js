( function() {
  'use strict';

  if ( typeof window.poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  window.poziworldExtension.incentive = {
    setLinks: setLinks
  };

  /**
   * Translations contain <a /> elements, but href attributes aren't specified there.
   */

  function setLinks() {
    const links = [
      [
        'incentivizePaypalLink',
        'https://www.paypal.me/ScrollToTopButton'
      ],
      [
        'incentivizeSquarecashLink',
        'https://cash.me/$ScrollToTopButton'
      ],
      [
        'incentivizeCoinbaseLink',
        'https://commerce.coinbase.com/checkout/60af24ed-830b-4ef3-b501-caae08411af5'
      ]
    ];

    window.poziworldExtension.page.setLinks( links );
  }
} )();
