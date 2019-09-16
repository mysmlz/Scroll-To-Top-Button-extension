const loadExtension = require( 'cypress-browser-extension-plugin/loader' ).load;

module.exports = ( on ) => {
  on( 'before:browser:launch', loadExtension( {
    // @todo Grab dynamically?
    source: './dist/chromium',
    skipHooks: true,
  } ) );
};
