/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2016 PoziWorld
  File                    :           global/js/log.js
  Description             :           Log JavaScript

  Table of Contents:

    Log
      init()
      add()
    Events

 ============================================================================ */

/* =============================================================================

  Log

 ============================================================================ */

const
    strLogDo              = ', do'
  , strLogDoNot           = ', do not'
  , strLogDone            = ', done'
  , strLogError           = ', error'
  , strLogSuccess         = ', success'
  , strLogNoSuccess       = ', no success'
  ;

var
    strLog                = ''

  , Log                   = {

  /**
   * Initialize
   *
   * @type    method
   * @param   No Parameters Taken
   * @return  void
   **/
  init : function() {
  }
  ,

  /**
   * Add new item to the log (console.log + track)
   *
   * @param {string} eventName - Event name/description.
   * @param {*} [details] - Var to output contents of.
   **/
  add : function( eventName, details ) {
    if ( typeof details === 'undefined' ) {
      details = {};
    }

    /**
     * Do not pollute web page's log.
     *
     * @todo Use appropriate types (log, debug, error).
     */

    if ( typeof ContentScript === 'undefined' ) {
      console.log( eventName, details );
    }
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );
