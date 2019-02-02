( function () {
  'use strict';

  let _this;

  expose();

  /**
   * Create an instance of the context menus API and expose it to other parts of the extension.
   */

  function expose() {
    sttb.contextMenus = new ContextMenus();
  }

  /**
   * Define a ContextMenus constructor.
   *
   * @constructor
   */

  function ContextMenus() {
    setInstance( this );
  }

  /**
   * Check settings to find out whether context menus should be created or removed.
   */

  ContextMenus.prototype.init = function() {
    strLog = 'sttb.contextMenus.init';
    Log.add( strLog );

    const _this = getInstance();

    poziworldExtension.utils.getSettings( strLog, _this.toggle );
  };

  /**
   * Create and show the appropriate context menus when enabled in Options.
   * Otherwise, remove all.
   *
   * @param {object} settings - Key-value pairs.
   */

  ContextMenus.prototype.toggle = function( settings ) {
    const contextMenus = browser.contextMenus;

    if ( contextMenus ) {
      if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) && settings.contextMenu === 'on' ) {
        browser.contextMenus.removeAll().then( createContextMenus );
      }
      else {
        browser.contextMenus.removeAll();
      }
    }
  };

  /**
   * Create a context-menu option allowing to open the Scroll To Top Button Options from any page or image.
   */

  function createContextMenus() {
    const contexts = [
      'page',
      'image'
    ];

    while ( contexts.length ) {
      const context = contexts.shift();
      const contextMenuProperties = {
        id: 'sttb_' + context,
        title: poziworldExtension.i18n.getMessage( 'optionsTitle' ),
        contexts: [
          context
        ]
      };

      browser.contextMenus.create( contextMenuProperties );
    }

    addListeners();
  }

  /**
   * Context menus are actionable. Add a click listener.
   */

  function addListeners() {
    browser.contextMenus.onClicked.addListener( handleContextMenuClick );
  }

  /**
   * Fired when a context menu item is clicked.
   *
   * @param {object} info - Information about the item clicked and the context where the click happened.
   */

  function handleContextMenuClick( info ) {
    Global.openOptionsPage( info.menuItemId );
  }

  /**
   * Return the ContextMenus instance.
   *
   * @param {ContextMenus} instance
   */

  function setInstance( instance ) {
    _this = instance;
  }

  /**
   * Return the ContextMenus instance.
   *
   * @return {ContextMenus}
   */

  function getInstance() {
    return _this;
  }
} )();
