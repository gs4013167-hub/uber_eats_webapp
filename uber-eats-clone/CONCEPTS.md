# JS & Frontend Concepts Used — Where to Find Them

A map from concept to the actual file/line so you can study each one in context, rather than just reading a definition.

## Language fundamentals
| Concept | File |
|---|---|
| ES Modules (`import`/`export`) | Every `.js` file |
| Dynamic `import()` (code-splitting) | `src/core/router.js` — `routes` array |
| ES2022 private class fields (`#field`) | `src/core/state/Store.js` |
| Classes, `extends` on a built-in (`EventTarget`) | `src/utils/eventBus.js` |
| Closures | `src/utils/debounce.js`, `throttle.js` |
| Destructuring, spread/rest, template literals, optional chaining, nullish coalescing | throughout, especially `src/core/state/cartState.js` |
| Array methods (`map`/`filter`/`reduce`/`find`/`some`/`every`) | `src/services/restaurantService.js`, `src/pages/restaurant/restaurant.js` |

## Async JavaScript
| Concept | File |
|---|---|
| Promises, `async`/`await` | `src/services/api/apiClient.js` and every service |
| `try/catch` error handling around async calls | `src/pages/checkout/checkout.js` submit handler |
| `AbortController` (request cancellation) | `src/pages/search/search.js`, `src/services/api/apiClient.js` |
| Retry-with-backoff pattern | `src/services/api/apiClient.js` — `withRetry()` |
| Custom `Error` subclasses | `src/services/api/apiClient.js` — `ApiError` |
| `Promise.all` for parallel requests | `src/pages/restaurant/restaurant.js` — loads restaurant + menu together |

## Browser APIs
| Concept | File |
|---|---|
| History API (`pushState`, `popstate`) | `src/core/router.js` |
| `localStorage` with error handling | `src/utils/storage.js` |
| Cross-tab sync via the `storage` event | `src/utils/storage.js` — `onExternalChange()` |
| `IntersectionObserver` (scroll-spy + infinite scroll) | `src/pages/restaurant/restaurant.js`, `src/pages/home/home.js` |
| `CustomEvent` / `EventTarget` (pub-sub) | `src/utils/eventBus.js` |
| `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat` | `src/utils/formatters.js` |
| Focus trapping, `aria-*` attributes | `src/components/Modal.js` |
| `requestAnimationFrame` | `src/components/Modal.js` — focusing the first field on open |
| `setInterval`/`clearInterval` with cleanup | `src/pages/orderTracking/orderTracking.js` |

## Architecture patterns
| Concept | File |
|---|---|
| Observer/pub-sub state store | `src/core/state/Store.js` |
| Client-side routing with route guards | `src/core/router.js` |
| Component lifecycle (`render()`/`destroy()`) | every file in `src/pages/` |
| Service layer separating data from UI | `src/services/` |
| Debounce vs. throttle (when to use which) | `src/pages/search/search.js` (debounce) vs. what a scroll-position tracker would use (throttle) |
| Global error boundary | `src/core/app.js` — `window.onerror` / `unhandledrejection` |

## Forms & validation
| Concept | File |
|---|---|
| Regex-based validation | `src/utils/validators.js` |
| Luhn algorithm (real credit card checksum) | `src/utils/validators.js` — `isValidCardNumber()` |
| Live input formatting (card number spacing) | `src/utils/formatters.js` — `formatCardNumberInput()` |
| Password strength scoring | `src/utils/validators.js` — `passwordStrength()` |
| Focus management on validation error | `src/pages/checkout/checkout.js` — `validateForm()` |

## What's intentionally NOT included
These are real-world concepts this project does **not** cover, since they need tooling beyond plain HTML/CSS/JS:
- **TypeScript** — type safety would catch several classes of bugs silently possible here.
- **A build tool** (Vite/Webpack) — this project relies on native ES modules instead, which works but skips bundling, minification, and dev-server hot reload.
- **Automated tests** (Jest/Vitest/Playwright) — nothing here is unit- or end-to-end tested.
- **A real backend** — everything in `src/data/` is fake and resets on refresh (except cart/user, which persist to `localStorage`).
