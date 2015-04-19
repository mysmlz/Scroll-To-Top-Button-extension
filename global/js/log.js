/* =============================================================================

  Product                 :           Scroll To Top Button
  Authors                 :           Cody Sherman (versions < 6.1.3), PoziWorld
  Copyright               :           Copyright (c) 2014-2015 PoziWorld
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
   * @type    method
   * @param   strEvent
   *            Event name/desc
   * @param   miscVar
   *            Optional. Var to output contents of
   * @param   boolTrack
   *            Optional. Whether to track this
   * @param   boolDoNotSendData
   *            Optional. Whether to send details of the event
   * @return  void
   **/
  add : function( strEvent, miscVar, boolTrack, boolDoNotSendData ) {
    if ( typeof miscVar === 'undefined' )
      miscVar = {};

    // Debug
    console.log( strEvent, miscVar );
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );
