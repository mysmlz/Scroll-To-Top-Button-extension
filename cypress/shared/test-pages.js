/**
 * Open a page of a website that would have the button (the page is long enough).
 */

export function openTestPage() {
  // @todo Pick the safest site to load in terms of speed, security, & not to DoS it.
  cy.visit( 'https://developers.cloudflare.com/sponsorships/' );
}

/**
 * Button doesn't get injected on page load because of misreported page height that equals 0, but the extension re-evaluates whether to inject on scroll.
 * Emulate scrolling, so button gets injected onto the page.
 */

export function forceButtonInjection() {
  // @todo Figure out how to get elements injected on page load.
  cy.scrollTo( 'bottom' );
}

