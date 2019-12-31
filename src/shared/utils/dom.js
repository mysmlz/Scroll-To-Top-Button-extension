import dompurify from 'dompurify';

/**
 * Sanitize HTML, while preventing XSS attacks, and return a DOM DocumentFragment.
 *
 * @param markup
 * @return {String|Node|null|string|*}
 */

export function getDocumentFragment( markup ) {
  return dompurify.sanitize( markup, {
    RETURN_DOM_FRAGMENT: true,
  } );
}

/**
 * Determine whether custom elements are supported.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements}
 *
 * @return {boolean}
 */

export function canUseCustomElements() {
  return Boolean( window.customElements );
}

/**
 * Determine whether the shadow DOM is supported.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM}
 *
 * @return {boolean}
 */

export function canUseShadowDom() {
  return Boolean( window.document.body.attachShadow );
}
