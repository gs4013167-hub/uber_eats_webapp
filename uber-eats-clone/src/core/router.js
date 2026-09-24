import { UserState } from "./state/userState.js";
import { eventBus, EVENTS } from "../utils/eventBus.js";

/**
 * Each route maps a path pattern to a LAZY page loader (dynamic import).
 * This is real-world code-splitting: the browser only downloads
 * pages/checkout/checkout.js the moment someone actually navigates there,
 * not on initial page load.
 *
 * Every page module must export an async `render(container, { params, query })`
 * function, and MAY export a `destroy()` function for cleanup (clearing
 * intervals, aborting in-flight requests, removing listeners) — the router
 * always calls the previous page's destroy() before mounting the next page,
 * which is exactly how memory leaks are avoided in long-lived SPAs.
 */
const routes = [
  { path: "/", loader: () => import("../pages/home/home.js") },
  { path: "/search", loader: () => import("../pages/search/search.js") },
  { path: "/restaurant/:id", loader: () => import("../pages/restaurant/restaurant.js") },
  { path: "/checkout", loader: () => import("../pages/checkout/checkout.js"), requiresAuth: true },
  { path: "/order-confirmation/:orderId", loader: () => import("../pages/orderConfirmation/orderConfirmation.js") },
  { path: "/order-tracking/:orderId", loader: () => import("../pages/orderTracking/orderTracking.js") },
  { path: "/orders", loader: () => import("../pages/orderHistory/orderHistory.js"), requiresAuth: true },
  { path: "/login", loader: () => import("../pages/auth/login.js") },
  { path: "/signup", loader: () => import("../pages/auth/signup.js") },
  { path: "/account", loader: () => import("../pages/account/account.js"), requiresAuth: true },
];

const notFoundLoader = () => import("../pages/notFound/notFound.js");

let appRoot = null;
let currentPageModule = null; // holds the loaded module so we can call .destroy()

/** Converts "/restaurant/:id" into a regex + param names. */
function compileRoute(path) {
  const paramNames = [];
  const pattern = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        paramNames.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { regex: new RegExp(`^${pattern}$`), paramNames };
}

const compiledRoutes = routes.map((route) => ({ ...route, ...compileRoute(route.path) }));

function matchRoute(pathname) {
  for (const route of compiledRoutes) {
    const match = route.regex.exec(pathname);
    if (match) {
      const params = {};
      route.paramNames.forEach((name, i) => (params[name] = match[i + 1]));
      return { route, params };
    }
  }
  return null;
}

function parseQuery(search) {
  return Object.fromEntries(new URLSearchParams(search));
}

async function renderRoute(pathname, search) {
  // Clean up the outgoing page before mounting the new one.
  if (currentPageModule?.destroy) {
    try {
      currentPageModule.destroy();
    } catch (err) {
      console.error("[router] Error during page destroy()", err);
    }
  }
  currentPageModule = null;

  const matched = matchRoute(pathname);

  if (matched?.route.requiresAuth && !UserState.isAuthenticated()) {
    navigate(`/login?redirect=${encodeURIComponent(pathname)}`, { replace: true });
    return;
  }

  appRoot.innerHTML = '<div class="route-loading">Loading\u2026</div>';

  try {
    const loader = matched ? matched.route.loader : notFoundLoader;
    const pageModule = await loader();
    currentPageModule = pageModule;

    appRoot.innerHTML = "";
    await pageModule.render(appRoot, {
      params: matched?.params ?? {},
      query: parseQuery(search),
    });

    window.scrollTo(0, 0);
    eventBus.emit(EVENTS.ROUTE_CHANGED, { pathname });
  } catch (err) {
    console.error("[router] Failed to load/render route", err);
    appRoot.innerHTML = `
      <div class="route-error">
        <h2>Something went wrong</h2>
        <p>${err.message ?? "Please try again."}</p>
        <button onclick="location.reload()">Reload</button>
      </div>`;
  }
}

export function navigate(path, { replace = false } = {}) {
  const url = new URL(path, window.location.origin);
  if (replace) {
    window.history.replaceState({}, "", url);
  } else {
    window.history.pushState({}, "", url);
  }
  renderRoute(url.pathname, url.search);
}

function handleLinkClick(e) {
  const link = e.target.closest("[data-link]");
  if (!link) return;
  // Let the browser handle modified clicks (new tab, etc.) normally.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === "_blank") return;

  e.preventDefault();
  navigate(link.getAttribute("href"));
}

export function initRouter(rootElement) {
  appRoot = rootElement;

  document.addEventListener("click", handleLinkClick);
  window.addEventListener("popstate", () => {
    renderRoute(window.location.pathname, window.location.search);
  });

  renderRoute(window.location.pathname, window.location.search);
}
