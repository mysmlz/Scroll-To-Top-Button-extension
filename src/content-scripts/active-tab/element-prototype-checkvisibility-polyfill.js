/**
 * @file There doesn't seem to be a polyfill available for `Element.checkVisibility()` yet. This is a band-aid.
 *
 * @see {@link https://drafts.csswg.org/cssom-view-1/#dom-element-checkvisibility}
 * @todo Remove this file when there is a proper polyfill available.
 */

if ( ! Element.prototype.checkVisibility ) {
  Element.prototype.checkVisibility = function() {
    return this.style.display !== 'none' &&
           this.parentElement &&
           this.parentElement.style.display !== 'none' &&
           this.style.opacity !== 0 &&
           this.style.visibility !== 'hidden' &&
           this.style.contentVisibility !== 'hidden';
  };
}
