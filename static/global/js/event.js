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

    window.poziworldExtension.event = new Event();
  }

  /**
   * @constructor
   */

  function Event() {
    /**
     * Callbacks that will be triggered when the event is dispatched.
     *
     * @type {Function[]}
     * @private
     */

    let _arrCallbacks = [];

    /**
     * Listen for the event.
     *
     * @param callback
     * @return {boolean} - Whether the operation succeeded.
     */

    Event.prototype.addListener = function( callback ) {
      strLog = 'poziworldExtension.event.addListener';
      Log.add( strLog, callback );

      if ( window.poziworldExtension.utils.isType( callback, 'function' ) ) {
        _arrCallbacks.push( callback );

        return true;
      }

      return false;
    };

    /**
     * Dispatch the event, trigger the callbacks.
     */

    Event.prototype.dispatch = function() {
      strLog = 'poziworldExtension.event.dispatch';
      Log.add( strLog );

      for ( let i = 0, l = _arrCallbacks.length; i < l; i++ ) {
        _arrCallbacks[ i ].apply( null, arguments );
      }
    };
  }
}() );
