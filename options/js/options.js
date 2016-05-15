/* =============================================================================

  Product: Scroll To Top Button
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Listeners

 ============================================================================ */

( function () {
  'use strict';

/* =============================================================================

  Listeners

 ============================================================================ */

  document.addEventListener( 'DOMContentLoaded', function (  ) {
    poziworldExtension.page.init( 'options' );

    var $$translateLink = document.getElementById( 'translateLink' )
      , $$releaseLink = document.getElementById( 'releaseLink' )
      ;

    if ( document.contains( $$translateLink ) ) {
      $$translateLink.href = 'https://www.transifex.com/poziworld/scroll-to-top-button';
    }

    if ( document.contains( $$releaseLink ) ) {
      $$releaseLink.href = 'https://github.com/PoziWorld/Scroll-to-Top-Button-Extension/releases';
    }

    document.getElementById( 'incentivizePaypalLink' ).href = 'https://www.paypal.me/ScrollToTopButton';
    document.getElementById( 'incentivizeSquarecashLink' ).href = 'https://cash.me/$ScrollToTopButton';
    document.getElementById( 'incentivizeCoinbaseLink' ).href = 'https://www.coinbase.com/checkouts/de5afdbcf22ffea5d5fbc1b5f6b3fa4a';
  } );

}() );
