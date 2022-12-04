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
   * @param {boolean} [globalVarToBeUpdated] - Whether to update window.strLog.
   * @param {object} [options] - Additional options
   * @param {string} [options.level] - Requested log level ({@link https://developer.mozilla.org/en-US/docs/Web/API/console#Methods})
   */

  add: function ( eventName, details, globalVarToBeUpdated, options ) {
    if ( typeof details === 'undefined' ) {
      details = {};
    }

    /**
     * Do not pollute web page's log.
     *
     * @todo Use appropriate types (log, debug, error).
     */

    if ( typeof window.ContentScript === 'undefined' ) {
      // @todo Create constants for levels.
      let level = 'log';

      if ( options ) {
        const requestedLevel = options.level;

        if ( [ 'debug', 'error', 'info', 'warn' ].includes( requestedLevel ) ) {
          level = requestedLevel;
        }
      }

      window.console[ level ]( strConstExtensionName, strConstExtensionVersion, eventName, details );
    }

    if ( globalVarToBeUpdated ) {
      window.strLog = eventName;
    }
  }
};

/* =============================================================================

  Events

 ============================================================================ */

document.addEventListener( 'DOMContentLoaded', Log.init );
