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
    if ( typeof window.poziworldExtension === 'undefined' ) {
      window.poziworldExtension = {};
    }

    window.poziworldExtension.page = new Page();
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
        const $localizableElement = $allLocalizableElements[ i ];
        const strI18 = $localizableElement.getAttribute( 'data-i18n' );
        const strI18Parameters = $localizableElement.getAttribute( 'data-i18n-parameters' );
        let arrI18Parameters;
        let strMessage;

        if ( window.poziworldExtension.utils.isNonEmptyString( strI18 ) ) {
          if ( typeof strI18Parameters === 'string' && strI18Parameters !== '' ) {
            // @todo Move out the callback.
            arrI18Parameters = strI18Parameters.split( '|' ).map( function ( parameter ) {
              return window.poziworldExtension.i18n.getMessage( parameter );
            } );
          }

          strMessage = window.poziworldExtension.i18n.getMessage( strI18, arrI18Parameters );

          if ( $localizableElement.nodeName === 'LABEL' ) {
            $localizableElement.innerHTML = $localizableElement.innerHTML + strMessage;
          }
          else if ( $localizableElement.nodeName === 'A'
                &&  ! $localizableElement.classList.contains( 'i18nNoInner' )
          ) {
            $localizableElement.innerHTML = strMessage;

            if ( $localizableElement.href === '' ) {
              $localizableElement.href = window.poziworldExtension.i18n.getMessage( strI18 + 'Href' );
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
        }

        if ( $localizableElement.classList.contains( 'i18nTitle' ) ) {
          $localizableElement.setAttribute( 'title', strMessage );
        }
        else {
          const tooltip = $localizableElement.getAttribute( 'data-i18n-tooltip' );

          if ( window.poziworldExtension.utils.isNonEmptyString( tooltip ) ) {
            $localizableElement.setAttribute( 'title', window.poziworldExtension.i18n.getMessage( tooltip ) );
          }
        }
    }

    if ( ! boolIsCustomSelectorParentPresent && strPageName ) {
      document.title = window.poziworldExtension.i18n.getMessage( strPageName + 'Title' );
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
    window.poziworldExtension.i18n.init()
      .then( resolve )
      .then( this.localize.bind( this, pageName ) );
  }

  /**
   * Resolve promise.
   *
   * @callback resolve
   */
}() );
