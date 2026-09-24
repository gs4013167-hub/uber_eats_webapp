/**
 * DOM utilities — thin wrappers to avoid repeating querySelector boilerplate
 * across every page/component.
 */

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

/**
 * Create a DOM element with attributes/children in one call.
 * Demonstrates: rest/spread, default params, DocumentFragment for batched inserts.
 */
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") el.className = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== false && value != null) {
      el.setAttribute(key, value);
    }
  }

  const kids = Array.isArray(children) ? children : [children];
  const fragment = document.createDocumentFragment();
  kids.forEach((child) => {
    if (child == null) return;
    fragment.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  });
  el.appendChild(fragment);
  return el;
}

/** Removes all children — faster than innerHTML = "" for large lists. */
export function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

/** Escapes user-supplied text before it's ever interpolated into innerHTML. */
export function escapeHTML(str = "") {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
