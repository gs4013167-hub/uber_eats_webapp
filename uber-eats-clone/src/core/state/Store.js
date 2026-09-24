import { storage } from "../../utils/storage.js";

/**
 * Base observable store. Real apps almost always reinvent this exact pattern
 * before reaching for Redux/Zustand/Context — understanding it by hand makes
 * those libraries make sense later.
 *
 * Demonstrates: ES2022 private class fields (#), optional persistence,
 * functional setState updates, subscribe returning an unsubscribe fn.
 */
export class Store {
  #state;
  #listeners = new Set();
  #storageKey;

  constructor(initialState, storageKey = null) {
    this.#storageKey = storageKey;
    const persisted = storageKey ? storage.get(storageKey) : null;
    this.#state = persisted ?? initialState;

    // Keep this tab in sync if the same store is changed from another tab.
    if (storageKey) {
      storage.onExternalChange(storageKey, (newValue) => {
        if (newValue == null) return;
        this.#state = newValue;
        this.#notify();
      });
    }
  }

  getState() {
    return this.#state;
  }

  /** Accepts either a partial object to merge, or an updater function. */
  setState(patch) {
    const nextState =
      typeof patch === "function"
        ? patch(this.#state)
        : { ...this.#state, ...patch };

    this.#state = nextState;
    if (this.#storageKey) storage.set(this.#storageKey, this.#state);
    this.#notify();
  }

  /** Returns an unsubscribe function — always clean up in a page's destroy(). */
  subscribe(listener) {
    this.#listeners.add(listener);
    listener(this.#state); // fire immediately with current state
    return () => this.#listeners.delete(listener);
  }

  #notify() {
    this.#listeners.forEach((listener) => listener(this.#state));
  }
}
