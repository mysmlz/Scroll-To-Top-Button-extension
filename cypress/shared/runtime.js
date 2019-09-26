/**
 * Set a property in the Storage that will make the extension simulate an extension update.
 *
 * @todo Figure out a way to emulate the extension update.
 */

export function requestToSimulateExtensionUpdate() {
  // runtime.reload invalidates extension context.
  cy.setExtensionStorage( 'local', {
      requestedToSimulateExtensionUpdate: true,
    } )
    .wait( 250 );
}
