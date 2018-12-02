( function () {
  'use strict';

  function ContextMenus() {
  }

  /**
   * Check settings to find out whether context menus should be created or removed.
   */

  ContextMenus.prototype.init = function() {
    strLog = 'sttb.contextMenus.init';
    Log.add( strLog );

    poziworldExtension.utils.getSettings( strLog, sttb.contextMenus.enableOrDisable );
  };

  /**
   * Create and show the appropriate context menus when enabled in Options.
   * Otherwise, remove all.
   *
   * @param {object} settings - Key-value pairs.
   */

  ContextMenus.prototype.enableOrDisable = function( settings ) {
    if ( poziworldExtension.utils.isType( settings, 'object' ) && ! Global.isEmpty( settings ) && settings.contextMenu === 'on' ) {
      const contexts = [
        'page',
        'image'
      ];

      for ( let i = 0, l = contexts.length; i < l; i++ ) {
        const context = contexts[ i ];

        browser.contextMenus.create( {
          'id': 'sttb_' + context,
          'title': poziworldExtension.i18n.getMessage( 'optionsTitle' ),
          'contexts': [ context ]
        } );
      }

      browser.contextMenus.onClicked.addListener( sttb.contextMenus.handleContextMenuClick );
    }
    else {
      browser.contextMenus.removeAll();
    }
  };

  /**
   * Fired when a context menu item is clicked.
   *
   * @param {object} info - Information about the item clicked and the context where the click happened.
   */

  ContextMenus.prototype.handleContextMenuClick = function( info ) {
    Global.openOptionsPage( info.menuItemId );
  };

  sttb.contextMenus = new ContextMenus();
} )();
