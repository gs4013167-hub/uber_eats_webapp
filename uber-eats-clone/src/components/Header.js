import { h, qs } from "../utils/dom.js";
import { CartState } from "../core/state/cartState.js";
import { UserState } from "../core/state/userState.js";
import { LocationState } from "../core/state/locationState.js";
import { eventBus, EVENTS } from "../utils/eventBus.js";

/**
 * Mounted once into #header by app.js. Subscribes directly to the stores it
 * cares about — this is the same reactive-render idea frameworks automate,
 * done by hand: state changes -> re-render just this component's DOM.
 */
export function mountHeader(container) {
  function render() {
    const { itemCount } = CartState.totals();
    const { isAuthenticated } = UserState.getState();
    const { address } = LocationState.getState();

    container.innerHTML = "";
    container.appendChild(
      h("header", { class: "app-header" }, [
        h("a", { href: "/", "data-link": true, class: "app-logo" }, "UberEatsClone"),
        h("button", { class: "address-pill", id: "addressPillBtn" }, [
          h("span", { class: "address-pill-icon" }, "\u{1F4CD}"),
          h("span", { class: "address-pill-text" }, address),
        ]),
        h("a", { href: "/search", "data-link": true, class: "icon-btn", "aria-label": "Search" }, "\u{1F50D}"),
        h(
          "button",
          { class: "icon-btn cart-btn", id: "headerCartBtn", "aria-label": "Open cart" },
          [
            "\u{1F6D2}",
            itemCount > 0 ? h("span", { class: "cart-badge" }, String(itemCount)) : null,
          ]
        ),
        isAuthenticated
          ? h("a", { href: "/account", "data-link": true, class: "text-btn" }, "Account")
          : h("a", { href: "/login", "data-link": true, class: "text-btn" }, "Sign in"),
      ])
    );

    qs("#headerCartBtn", container).addEventListener("click", () => {
      eventBus.emit(EVENTS.CART_OPEN);
    });
  }

  render();
  // Re-render whenever cart or auth state changes — no manual DOM patching needed.
  CartState.subscribe(render);
  UserState.subscribe(render);
  LocationState.subscribe(render);
}
