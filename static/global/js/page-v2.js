/* =============================================================================

  Product: Scroll To Top Button
  Author: PoziWorld
  Copyright: (c) 2016 PoziWorld
  License: pozitone.com/license

  Table of Contents:

    Page
      init()
      localize()

 ============================================================================ */

( function() {
  'use strict';

  setUp();

  /**
   * Make the logic readily available.
   */

  function setUp() {
    exposeApi();
  }

  /**
   * Create an instance of the page API and expose it to other parts of the extension.
   */

  function exposeApi() {
    if ( typeof poziworldExtension === 'undefined' ) {
      window.poziworldExtension = {};
    }

    poziworldExtension.page = new Page();
  }

  function Page() {
  }

  /**
   * Initialize.
   *
   * @param {string} [pageName] - The name of the page this is called from.
   * @return {Promise}
   */

  Page.prototype.init = function ( pageName ) {
    return new Promise( initI18n.bind( this, pageName ) );
  };

  /**
   * Provide text in the appropriate language for HTML elements that expect it.
   *
   * @param {string} [strPageName] - The name of the page this is called from.
   * @param {string} [strCustomSelectorParent] - If only part of the page needs to be localized.
   */

  Page.prototype.localize = function ( strPageName, strCustomSelectorParent ) {
    var boolIsCustomSelectorParentPresent = typeof strCustomSelectorParent === 'string'
      , strSelectorPrefix = boolIsCustomSelectorParentPresent ? strCustomSelectorParent + ' ' : ''
      , $allLocalizableElements = document.querySelectorAll( strSelectorPrefix + '[data-i18n]' )
      ;

    for ( var i = 0, l = $allLocalizableElements.length; i < l; i++ ) {
        var $localizableElement = $allLocalizableElements[ i ]
          , strI18 = $localizableElement.getAttribute( 'data-i18n' )
          , strI18Parameters = $localizableElement.getAttribute( 'data-i18n-parameters' )
          , arrI18Parameters
          ;

        if ( typeof strI18Parameters === 'string' && strI18Parameters !== '' ) {
          arrI18Parameters = strI18Parameters.split( '|' );
        }

        var strMessage = poziworldExtension.i18n.getMessage( strI18, arrI18Parameters );

        if ( $localizableElement.nodeName === 'LABEL' ) {
          $localizableElement.innerHTML = $localizableElement.innerHTML + strMessage;
        }
        else if ( $localizableElement.nodeName === 'A'
              &&  ! $localizableElement.classList.contains( 'i18nNoInner' )
        ) {
          $localizableElement.innerHTML = strMessage;

          if ( $localizableElement.href === '' ) {
            $localizableElement.href = poziworldExtension.i18n.getMessage( strI18 + 'Href' );
          }
        }
        else if ( $localizableElement.nodeName === 'IMG' ) {
          $localizableElement.alt = strMessage;
        }
        else if ( $localizableElement.nodeName === 'OPTGROUP' ) {
          $localizableElement.label = strMessage;
        }
        else if ( ! $localizableElement.classList.contains( 'i18nNoInner' ) ) {
          $localizableElement.innerHTML = strMessage;
        }

        if ( $localizableElement.classList.contains( 'i18nTitle' ) ) {
          $localizableElement.setAttribute( 'title', strMessage );
        }
        else {
          const tooltip = $localizableElement.getAttribute( 'data-i18n-tooltip' );

          if ( poziworldExtension.utils.isNonEmptyString( tooltip ) ) {
            $localizableElement.setAttribute( 'title', poziworldExtension.i18n.getMessage( tooltip ) );
          }
        }
    }

    if ( ! boolIsCustomSelectorParentPresent && strPageName ) {
      document.title = poziworldExtension.i18n.getMessage( strPageName + 'Title' );
    }
  };

  /**
   * Translations contain <a /> elements, but href attributes aren't specified there.
   *
   * @param {string[][]} links
   */

  Page.prototype.setLinks = function ( links ) {
    if ( Array.isArray( links ) ) {
      for ( let i = 0, l = links.length; i < l; i++ ) {
        const link = links[ i ];
        const linkElement = document.getElementById( link[ 0 ] );

        if ( linkElement ) {
          linkElement.href = link[ 1 ];
        }
      }
    }
  };

  /**
   * Before starting to localize, make sure i18n is initialized.
   *
   * @param {string} [pageName] - The name of the page this is called from.
   * @param {resolve} resolve
   */

  function initI18n( pageName, resolve ) {
    poziworldExtension.i18n.init()
      .then( resolve )
      .then( this.localize.bind( this, pageName ) );
  }

  /**
   * Resolve promise.
   *
   * @callback resolve
   */
}() );
