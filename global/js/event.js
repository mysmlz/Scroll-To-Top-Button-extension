/* =============================================================================

  Scroll To Top Button
  © 2013-2018 PoziWorld, Inc.
  https://scroll-to-top-button.com

 ============================================================================ */

( function () {
  'use strict';

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

      if ( poziworldExtension.utils.isType( callback, 'function' ) ) {
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

  if ( typeof poziworldExtension === 'undefined' ) {
    window.poziworldExtension = {};
  }

  poziworldExtension.event = new Event();
}() );
