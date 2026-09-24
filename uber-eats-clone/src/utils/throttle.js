/**
 * Throttle: guarantees `fn` runs at most once per `limit` ms, no matter how
 * often it's called. Different from debounce — this fires at a steady rate
 * DURING continuous events, rather than waiting for them to stop.
 * Use for: scroll listeners, mousemove drag handlers, infinite-scroll checks.
 */
export function throttle(fn, limit = 200) {
  let inCooldown = false;
  let lastArgs = null;

  function throttled(...args) {
    if (inCooldown) {
      lastArgs = args; // remember the most recent call to run once cooldown ends
      return;
    }
    fn.apply(this, args);
    inCooldown = true;
    setTimeout(() => {
      inCooldown = false;
      if (lastArgs) {
        fn.apply(this, lastArgs);
        lastArgs = null;
      }
    }, limit);
  }
  return throttled;
}
