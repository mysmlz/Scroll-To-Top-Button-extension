( function () {
  'use strict';

  setUp();

  function setUp() {
    exposeApi();
  }

  function exposeApi() {
    if ( typeof window.poziworldExtension === 'undefined' ) {
      window.poziworldExtension = {};
    }

    window.poziworldExtension.tabs = new Tabs();
  }

  /**
   * @constructor
   */

  function Tabs() {
    /**
     * @typedef {Object} Tab
     * @property {number} intId
     * @property {number} intWindowId
     * @property {string} strUrl
     * @property {string} strDomain
     */

    /**
     * @type {Tab[]}
     * @private
     *
     * @todo Use Storage instead. See #3 at https://developer.chrome.com/extensions/event_pages#best-practices
     */

    let arrActiveTabs = [];

    /**
     * Return the saved active tabs info.
     *
     * @return {Tab[]}
     */

    Tabs.prototype.getSavedActiveTabs = function() {
      return arrActiveTabs;
    };

    /**
     * Save or update the active tab details.
     *
     * @param {Tab} objActiveTab
     * @param {boolean} boolIsUpdate - Whether this is a new tab or an update of the existing record.
     * @return {boolean} - Whether the operation succeeded.
     */

    Tabs.prototype.saveActiveTab = function ( objActiveTab, boolIsUpdate ) {
      strLog = 'poziworldExtension.tabs.saveActiveTab';
      Log.add( strLog, objActiveTab );

      if ( window.poziworldExtension.utils.isType( objActiveTab, 'object' ) && ! Global.isEmpty( objActiveTab ) ) {
        const intId = objActiveTab.intId;

        if ( window.poziworldExtension.utils.isType( intId, 'number' ) ) {
          let intIndex = this.getSavedActiveTabIndex( intId );

          if ( intIndex > -1 ) {
            arrActiveTabs[ intIndex ] = objActiveTab;
          }
          else {
            const intWindowId = objActiveTab.intWindowId;

            if ( window.poziworldExtension.utils.isType( intWindowId, 'number' ) ) {
              intIndex = this.getSavedActiveTabIndex( intWindowId, true );

              if ( intIndex > -1 ) {
                arrActiveTabs[ intIndex ] = objActiveTab;
              }
              else {
                arrActiveTabs.push( objActiveTab );
              }
            }
            else {
              return false;
            }
          }

          if ( ! window.poziworldExtension.utils.isType( boolIsUpdate, 'boolean' ) || ! boolIsUpdate ) {
            this.onActiveTabsChange.dispatch();
          }

          return true;
        }
      }

      return false;
    };

    /**
     * If the tab had been saved as active, remove its info.
     *
     * @param {Tab.intId} intId
     * @return {boolean} - Whether the operation succeeded.
     */

    Tabs.prototype.removeActiveTab = function ( intId ) {
      strLog = 'poziworldExtension.tabs.removeActiveTab';
      Log.add( strLog, intId );

      if ( window.poziworldExtension.utils.isType( intId, 'number' ) ) {
        const intIndex = this.getSavedActiveTabIndex( intId );

        if ( intIndex > -1 ) {
          arrActiveTabs = arrActiveTabs.splice( intIndex, 1 );

          this.onActiveTabsChange.dispatch();

          return true;
        }
      }

      return false;
    };

    /**
     * If the tab had been saved, return the tab details object or its index in the array.
     *
     * @private
     * @param {(Tab.intId|number)} intId - The tab ID or the window ID if boolGetByWindowId is true.
     * @param {boolean} [boolGetByWindowId] - Whether to search by window ID instead of the tab ID.
     * @param {boolean} [boolGetIndex] - Whether to return the index instead of the tab itself.
     * @return {(Tab|number)}
     */

    function _getSavedActiveTabOrItsIndex( intId, boolGetByWindowId, boolGetIndex ) {
      strLog = 'poziworldExtension.tabs._getSavedActiveTabOrItsIndex';
      Log.add(
        strLog,
        {
          intId: intId,
          boolGetByWindowId: boolGetByWindowId,
          boolGetIndex: boolGetIndex
        }
      );

      boolGetIndex = window.poziworldExtension.utils.isType( boolGetIndex, 'boolean' ) && boolGetIndex;

      if ( window.poziworldExtension.utils.isType( intId, 'number' ) ) {
        const strParameterToSearchBy = ! window.poziworldExtension.utils.isType( boolGetByWindowId, 'boolean' ) || ! boolGetByWindowId ?
          'intId' :
          'intWindowId';

        return arrActiveTabs[ boolGetIndex ? 'findIndex' : 'find' ]( function( objActiveTab ) {
          return objActiveTab[ strParameterToSearchBy ] === intId;
        } );
      }

      return boolGetIndex ? -1 : {};
    }

    /**
     * If the tab had been saved, return the tab details object.
     *
     * @param {(Tab.intId|number)} intId - The tab ID or the window ID if boolGetByWindowId is true.
     * @param {boolean} [boolGetByWindowId] - Whether to search by window ID instead of the tab ID.
     * @return {number}
     */

    Tabs.prototype.getSavedActiveTab = function ( intId, boolGetByWindowId ) {
      strLog = 'poziworldExtension.tabs.getSavedActiveTab';
      Log.add(
        strLog,
        {
          intId: intId,
          boolGetByWindowId: boolGetByWindowId
        }
      );

      return _getSavedActiveTabOrItsIndex( intId, boolGetByWindowId );
    };

    /**
     * If the tab had been saved, return its index in the array.
     *
     * @param {(Tab.intId|number)} intId - The tab ID or the window ID if boolGetByWindowId is true.
     * @param {boolean} [boolGetByWindowId] - Whether to search by window ID instead of the tab ID.
     * @return {number}
     */

    Tabs.prototype.getSavedActiveTabIndex = function ( intId, boolGetByWindowId ) {
      strLog = 'poziworldExtension.tabs.getSavedActiveTabIndex';
      Log.add(
        strLog,
        {
          intId: intId,
          boolGetByWindowId: boolGetByWindowId
        }
      );

      return _getSavedActiveTabOrItsIndex( intId, boolGetByWindowId, true );
    };

    this.init();
  }

  /**
   * Whenever there is a change in arrActiveTabs (whether onRemoved, onReplaced, or onUpdated)
   */

  Tabs.prototype.onActiveTabsChange = window.poziworldExtension.event;

  /**
   * Initialize.
   */

  Tabs.prototype.init = function () {
    strLog = 'poziworldExtension.tabs.init';
    Log.add( strLog );

    this.findActiveTabs();

    browser.tabs.onActivated.addListener( this.handleTabsActivated.bind( this ) );
    browser.tabs.onRemoved.addListener( this.handleTabsRemoved.bind( this ) );
    browser.tabs.onReplaced.addListener( this.handleTabsReplaced.bind( this ) );
    browser.tabs.onUpdated.addListener( this.handleTabsUpdated.bind( this ) );
  };

  /**
   * Find active tabs in all windows (incognito or not).
   */

  Tabs.prototype.findActiveTabs = function () {
    strLog = 'poziworldExtension.tabs.findActiveTabs';
    Log.add( strLog );

    const objQuery = {
      active: true
    };

    browser.tabs.query( objQuery ).then( this.handleActiveTabsQueryComplete.bind( this ) );
  };

  /**
   * Get a domain and a full URL of the active tab in each window (incognito or not).
   *
   * @param {Object[]} arrTabs - Array of the active tabs details objects.
   */

  Tabs.prototype.handleActiveTabsQueryComplete = function ( arrTabs ) {
    strLog = 'poziworldExtension.tabs.onActiveTabsQueryComplete';
    Log.add( strLog, arrTabs );

    for ( let i = 0, l = arrTabs.length; i < l; i++ ) {
      this.processTabInfo( arrTabs[ i ] );
    }
  };

  /**
   * Fires when the active tab in a window changes.
   *
   * @param {Object} objActiveInfo - Lists the changes to the state of the tab that was updated.
   * @param {Tab.intId} objActiveInfo.tabId - The ID of the tab that has become active.
   * @param {Tab.intWindowId} objActiveInfo.windowId - The ID of the window the active tab changed inside of.
   */

  Tabs.prototype.handleTabsActivated = function ( objActiveInfo ) {
    strLog = 'poziworldExtension.tabs.handleTabsActivated';
    Log.add( strLog, objActiveInfo );

    this.getTabInfoById( objActiveInfo.tabId );
  };

  /**
   * Fired when a tab is closed.
   *
   * @param {Tab.intId} intId
   */

  Tabs.prototype.handleTabsRemoved = function ( intId ) {
    strLog = 'poziworldExtension.tabs.handleTabsRemoved';
    Log.add( strLog, intId );

    if ( this.removeActiveTab( intId ) ) {
      this.findActiveTabs();
    }
  };

  /**
   * Fired when a tab is replaced with another tab due to prerendering or instant (most likely loaded from cache).
   *
   * @param {Tab.intId} intAddedTabId
   * @param {Tab.intId} intRemovedTabId
   */

  Tabs.prototype.handleTabsReplaced = function ( intAddedTabId, intRemovedTabId ) {
    strLog = 'poziworldExtension.tabs.handleTabsReplaced';
    Log.add(
      strLog,
      {
        intAddedTabId: intAddedTabId,
        intRemovedTabId: intRemovedTabId
      }
    );

    this.getTabInfoById( intAddedTabId );
    this.removeActiveTab( intRemovedTabId );
  };

  /**
   * Fired when a tab is updated (most likely not loaded from cache).
   *
   * @param {Tab.intId} intId
   * @param {Object} objChangeInfo - Lists the changes to the state of the tab that was updated.
   * @param {Object} objTab - Gives the state of the tab that was updated.
   */

  Tabs.prototype.handleTabsUpdated = function ( intId, objChangeInfo, objTab ) {
    strLog = 'poziworldExtension.tabs.handleTabsUpdated';
    Log.add(
      strLog,
      {
        intId: intId,
        objChangeInfo: objChangeInfo,
        objTab: objTab
      }
    );

    if ( objChangeInfo.status === 'complete' ) {
      this.processTabInfo( objTab );
    }
  };

  /**
   * Retrieves details about the specified tab.
   *
   * @param {Tab.intId} intId
   */

  Tabs.prototype.getTabInfoById = function ( intId ) {
    strLog = 'poziworldExtension.tabs.getTabInfoById';
    Log.add( strLog, intId );

    /**
     * @todo Prevent “Unchecked runtime.lastError while running tabs.get: No tab with id: ...”
     */

    browser.tabs.get( intId ).then( this.processTabInfo.bind( this ) );
  };

  /**
   * Get a domain and a full URL of the specified tab.
   *
   * @param {Object} objTab - The specified tab info object.
   */

  Tabs.prototype.processTabInfo = function ( objTab ) {
    strLog = 'poziworldExtension.tabs.processTabInfo';
    Log.add( strLog, objTab );

    if ( window.poziworldExtension.utils.isType( objTab, 'object' ) && ! Global.isEmpty( objTab ) ) {
      const boolIsActive = objTab.active;

      if ( ! window.poziworldExtension.utils.isType( boolIsActive, 'boolean' ) || ! boolIsActive ) {
        return;
      }

      const intId = objTab.id;
      let strUrl = objTab.url;
      let strDomain;

      // Not available if the “tabs” permission is not granted
      if ( window.poziworldExtension.utils.isNonEmptyString( strUrl ) ) {
        const $a = document.createElement( 'a' );
        let strDomainTemp;

        $a.href = strUrl;
        strDomainTemp = $a.hostname;

        strDomain = punycode.toUnicode( strDomainTemp );
        strUrl = strUrl.replace( strDomainTemp, strDomain );
      }

      this.saveActiveTab( {
        intId: intId,
        intWindowId: objTab.windowId,
        strDomain: strDomain,
        strUrl: strUrl
      } );
    }
  };
}() );
