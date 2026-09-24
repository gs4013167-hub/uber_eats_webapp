# UberEatsClone

A full single-page app clone of the Uber Eats ordering flow, built in **vanilla HTML, CSS, and JavaScript** — no frameworks, no bundler, no build step. It uses native ES Modules, so the browser does the "bundling" for you at request time.

## Running it

Browsers block ES module imports from the `file://` origin, so you must serve this over `http://` with a local static server. Pick one:

```bash
# Python (built-in on most systems)
cd uber-eats-clone
python3 -m http.server 8080

# Node (no install needed)
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html -> "Open with Live Server"
```

Then open `http://localhost:8080` (or whatever port your tool prints).

## What's included

A real SPA — one `index.html` shell, with a client-side router swapping page modules in and out of `#app` without full page reloads, matching how the real Uber Eats web app behaves.

**Pages:** Home, Search, Restaurant Detail, Checkout, Order Confirmation, Order Tracking, Order History, Login, Signup, Account, 404.

**Demo login:** `alex@example.com` / `Password1!` — or just sign up with a new account, it's stored in memory for the session.

## Folder structure

```
uber-eats-clone/
├── index.html                  # SPA shell — the only HTML file
├── src/
│   ├── core/
│   │   ├── app.js               # Bootstraps the app, wires global error handling
│   │   ├── router.js            # History API router, route guards, lazy page loading
│   │   ├── state/                # Observable stores (cart, user, location)
│   │   └── config/constants.js
│   ├── services/                 # "API layer" — swap these for real fetch() calls later
│   │   ├── api/apiClient.js       # Simulated network client (AbortController, retries)
│   │   ├── restaurantService.js
│   │   ├── authService.js
│   │   └── orderService.js
│   ├── data/                     # Mock "database" the services read from
│   ├── components/                # Reusable UI: Header, Footer, Modal, Toast, CartDrawer, RestaurantCard
│   ├── pages/                     # One folder per route, each exporting render()/destroy()
│   └── styles/                    # base -> layout -> components -> pages, imported by main.css
└── README.md
```

## Why it's structured this way

- **`services/` never touches the DOM, `pages/` never touches `data/` directly.** Swapping the mock backend for a real API means editing only the `services/` files — nothing else in the app needs to change.
- **Every page module exports `render()` and optionally `destroy()`.** The router always calls the outgoing page's `destroy()` before mounting the next one, so intervals, observers, and in-flight requests get cleaned up on navigation. Skipping this is one of the most common real-world sources of memory leaks in SPAs.
- **State stores are observable** (`subscribe()`/`setState()`), not global mutable objects. Components re-render themselves in response to state changes instead of other code reaching in and manipulating their DOM directly.
- **The cart and user session persist to `localStorage`** via the base `Store` class, so refreshing the page or navigating between pages doesn't lose your cart — the gap identified earlier in this project's development.

## Extending it

- Add a new page: create `src/pages/yourPage/yourPage.js` exporting `render(container, { params, query })`, then add one line to the `routes` array in `src/core/router.js`.
- Add a new API-backed feature: add a function to the relevant file in `src/services/`, following the existing `simulateRequest()` pattern — later, replace the body with a real `fetch()` call and nothing calling it needs to change.
- Swap mock data for a real backend: replace the contents of `src/data/*.js` imports inside `src/services/*.js` with real HTTP calls. The `apiClient.js` abstraction is designed so this is a contained change.

See `CONCEPTS.md` for a map of which JavaScript/frontend concept lives in which file — useful if you're using this project to study.
