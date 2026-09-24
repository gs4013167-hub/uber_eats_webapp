/**
 * App-wide event bus, built on the browser's native EventTarget/CustomEvent
 * rather than a hand-rolled pub-sub array. This is the real-world pattern —
 * decoupled components communicate without holding references to each other.
 *
 * Example: the cart drawer opens because the header emits "cart:open",
 * and the header never needs to import the cart drawer module at all.
 */
class EventBus extends EventTarget {
  emit(eventName, detail) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /** Returns an unsubscribe function, matching the Store.subscribe() convention. */
  on(eventName, handler) {
    this.addEventListener(eventName, handler);
    return () => this.removeEventListener(eventName, handler);
  }

  once(eventName, handler) {
    this.addEventListener(eventName, handler, { once: true });
  }
}

export const eventBus = new EventBus();

/** Central place to document every event name in use — avoids typo bugs. */
export const EVENTS = Object.freeze({
  CART_OPEN: "cart:open",
  CART_UPDATED: "cart:updated",
  AUTH_CHANGED: "auth:changed",
  TOAST_SHOW: "toast:show",
  ROUTE_CHANGED: "route:changed",
});
