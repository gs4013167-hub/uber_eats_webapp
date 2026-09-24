/**
 * Debounce: delays invoking `fn` until `wait` ms have passed since the LAST call.
 * Use for: search-as-you-type, resize handlers, form auto-save.
 */
export function debounce(fn, wait = 250) {
  let timeoutId;
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}
