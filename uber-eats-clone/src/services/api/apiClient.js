import { CONFIG } from "../../core/config/constants.js";

/**
 * There is no real backend here, so this client simulates one: network
 * latency via setTimeout, occasional random failures, and support for
 * request cancellation via AbortController — exactly the shape a real
 * `fetch()`-based client has. Swapping this file's internals for real
 * `fetch(url, { signal })` calls would require NO changes to any service
 * or page that imports it. That boundary is the entire point of a
 * services/api layer.
 */

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Simulates a network call.
 * @param {Function} resolver - () => T, computes the "response" synchronously
 * @param {Object} options
 * @param {AbortSignal} [options.signal] - cancels the pending request
 * @param {number} [options.delay] - override simulated latency
 */
export function simulateRequest(resolver, { signal, delay = CONFIG.SIMULATED_NETWORK_DELAY_MS } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = setTimeout(() => {
      if (Math.random() < CONFIG.SIMULATED_FAILURE_RATE) {
        reject(new ApiError("Network request failed. Please try again.", 503));
        return;
      }
      try {
        resolve(resolver());
      } catch (err) {
        reject(err instanceof ApiError ? err : new ApiError(err.message, 400));
      }
    }, delay);

    // Real AbortController support — cancels the "in-flight" timer.
    signal?.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/**
 * Wraps a request with automatic retry on transient failures.
 * Real APIs use this pattern for flaky networks (mobile clients especially).
 */
export async function withRetry(requestFn, { retries = 2, backoffMs = 400 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (err) {
      if (err.name === "AbortError") throw err; // never retry a deliberate cancellation
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
      }
    }
  }
  throw lastError;
}
