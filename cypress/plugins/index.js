const extensionLoader = require( 'cypress-browser-extension-plugin/loader' );

module.exports = ( on ) => {
  on( 'before:browser:launch', ( browser = {}, args ) => (
    extensionLoader.load( {
      alias: 'sttb',
      // @todo Grab dynamically?
      source: './dist/chromium',
      skipHooks: false,
    } )( browser, args )
  ) );
};
