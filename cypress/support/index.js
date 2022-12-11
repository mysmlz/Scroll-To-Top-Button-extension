import './commands';

import * as runtime from '../shared/runtime';
import * as buttonSettings from '../shared/button-settings';

setUp();

/**
 * Define all tests' prerequisites.
 */

function setUp() {
  beforeEach( resetExtensionSettings );
}

/**
 * Start clean every time: reset extension settings.
 */

function resetExtensionSettings() {
  cy.clearExtensionStorage( 'sync' )
    .clearExtensionStorage( 'local' );

  // @todo Have one source of truth (make all places reference the same settings object).
  buttonSettings.setButtonSettings( {
    buttonMode: 'off',
    scrollUpSpeed: 1000,
    scrollUpSpeedCustom: 1000,
    scrollDownSpeed: 1000,
    scrollDownSpeedCustom: 1000,
    infiniteScrollDown: 'off',
    infiniteScrollDownRecheckDelay: 2000,
    infiniteScrollDownRecheckDelayActiveIndicator: 'on',
    distanceLength: 400,
    buttonSize: '50px',
    buttonWidthCustom: 60,
    buttonHeightCustom: 60,
    buttonDesign: 'arrow_blue',
    buttonLocation: 'TR',
    notActiveButtonOpacity: '0.5',
    keyboardShortcuts: 'arrows',
    contextMenu: 'on',
    homeEndKeysControlledBy: 'sttb',
    clickthroughKeys: 'ctrl|shift',
    scroll: 'jswing',
  } );

  runtime.requestToSimulateExtensionUpdate();
}
