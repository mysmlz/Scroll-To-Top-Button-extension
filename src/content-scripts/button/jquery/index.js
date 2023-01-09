import jQuery from 'jquery';
import 'jquery.easing';

let _jQuery;

init();

function init() {
  setJquery();
  renameJqueryGlobalVar();
}

/**
 * Use own jQuery to avoid conflicts with site's own.
 */

function setJquery() {
  _jQuery = jQuery;
}

export function getJquery() {
  return _jQuery;
}

/**
 * Protect `jQuery` from getting overridden by site's `window.jQuery`.
 */

function renameJqueryGlobalVar() {
  window.sttbJquery = _jQuery.noConflict( true );
}
