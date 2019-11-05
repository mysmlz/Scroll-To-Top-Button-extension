import 'cypress-shadow-dom';
import addCommands from '@poziworld/cypress-browser-extension-plugin/commands';

setUp();

/**
 * Add commands made available by plugins.
 */

function setUp() {
  addCommands( Cypress, {
    alias: 'sttb',
    debug: true,
    timeout: 5000,
  } );
}
