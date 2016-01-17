if ( localStorage[ 'contextmenu' ] == 'on' ) {
  var arrContexts = [ 'page', 'image' ];

  for ( var i = 0, l = arrContexts.length; i < l; i++ ) {
    var strContext = arrContexts[ i ];

    chrome.contextMenus.create( {
        'id' : 'sttb_' + strContext
      , 'title' : strConstExtensionName + ' Options'
      , 'contexts' : [ strContext ]
    } );
  }

  chrome.contextMenus.onClicked.addListener( function( objInfo ) {
    Global.openOptionsPage( objInfo.menuItemId );
  } );
}
