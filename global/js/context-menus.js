( function () {
  'use strict';

  function ContextMenus() {}

  /**
   * Create and show the appropriate context menus when enabled in Options.
   * Otherwise, remove all.
   */

  ContextMenus.prototype.toggle = function() {
    if ( localStorage[ 'contextmenu' ] == 'on' ) {
      var arrContexts = [ 'page', 'image' ];

      for ( var i = 0, l = arrContexts.length; i < l; i++ ) {
        var strContext = arrContexts[ i ];

        chrome.contextMenus.create( {
            'id' : 'sttb_' + strContext
          , 'title' : chrome.i18n.getMessage( 'optionsTitle' )
          , 'contexts' : [ strContext ]
        } );
      }

      chrome.contextMenus.onClicked.addListener( function( objInfo ) {
        Global.openOptionsPage( objInfo.menuItemId );
      } );
    }
    else {
      chrome.contextMenus.removeAll();
    }
  };

  sttb.contextMenus = new ContextMenus();
} )();
