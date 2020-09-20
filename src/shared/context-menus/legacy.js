import * as settingsHelpers from 'Shared/settings';

// Context menu items
const SCROLL_TO_TOP_ONLY_BASIC_ID = 'scrollToTopOnlyBasic';
const SEPARATOR_ID = 'separator';
const OPTIONS_ID = 'options';

/**
 * @type {string[]}
 * @see {@link https://developer.chrome.com/extensions/contextMenus#type-ContextType}
 */

const contexts = [
  'all',
];

let _this;

setUp();

/**
 * Make the logic readily available.
 */

function setUp() {
  exposeApi();
}

/**
 * Create an instance of the context menus API and expose it to other parts of the extension.
 */

function exposeApi() {
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

ContextMenus.prototype.init = async function() {
  strLog = 'sttb.contextMenus.init';
  Log.add( strLog );

  const _this = getInstance();

  try {
    const settings = await settingsHelpers.getSettings();

    _this.toggle( settings );
  }
  catch ( error ) {
    Log.add( 'Failed to initialize context menus', error, false, {
      level: 'error',
    } );
  }
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
      browser.contextMenus.removeAll()
        .then( createContextMenu )
        .then( addListeners );
    }
    else {
      browser.contextMenus.removeAll();
    }
  }
};

function createContextMenu() {
  const items = [
    {
      id: SCROLL_TO_TOP_ONLY_BASIC_ID,
      title: poziworldExtension.i18n.getMessage( 'scrollToTopOnlyBasicContextMenuItemTitle' ),
    },
    {
      id: SEPARATOR_ID,
      type: 'separator',
    },
    {
      id: OPTIONS_ID,
      title: poziworldExtension.i18n.getMessage( 'optionsContextMenuItemTitle' ),
    },
  ];

  while ( items.length ) {
    createContextMenuItem( items.shift() );
  }
}

function createContextMenuItem( properties ) {
  const mergedProperties = Object.assign( {
    contexts: contexts,
  }, properties );

  browser.contextMenus.create( mergedProperties, () => handleItemCreationResult( properties ) );
}

function handleItemCreationResult( properties ) {
  if ( browser.runtime.lastError ) {
    Log.add(
      'Failed to create context menu item',
      // @todo Stringify behind the scenes
      JSON.stringify( {
        error: browser.runtime.lastError,
        properties: properties,
      } ),
    );
  }
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
  const menuItemId = info.menuItemId;

  switch ( menuItemId ) {
    case SCROLL_TO_TOP_ONLY_BASIC_ID:
      triggerScrollToTopBasic();

      break;
    case OPTIONS_ID:
      Global.openOptionsPage( menuItemId );

      break;
  }
}

/**
 * Ask another extension component to scroll the active tab to top.
 */

function triggerScrollToTopBasic() {
  const TARGET_ORIGIN = '*';

  window.postMessage( {
    trigger: SCROLL_TO_TOP_ONLY_BASIC_ID,
  }, TARGET_ORIGIN );
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
