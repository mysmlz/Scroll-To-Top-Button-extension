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
