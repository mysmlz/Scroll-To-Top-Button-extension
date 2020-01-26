export function isEdge() {
  const EDGE_CHROMIUM_BOWSER_NAME = 'Edge (Chromium)';

  return window.bowser.name === EDGE_CHROMIUM_BOWSER_NAME;
}
