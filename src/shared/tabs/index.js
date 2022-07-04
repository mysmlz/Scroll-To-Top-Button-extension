export function createOrUpdate( url ) {
  if ( ! window.poziworldExtension.utils.isNonEmptyString( url ) ) {
    return;
  }

  if ( browser.tabs ) {
    // @todo Why does window.Global not work?
    Global.createTabOrUpdate( url );
  }
  else {
    window.open( url, null, 'noopener' );
  }
}
