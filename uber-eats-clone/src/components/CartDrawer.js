import { h, qsa } from "../utils/dom.js";
import { formatMoney } from "../utils/formatters.js";
import { CartState } from "../core/state/cartState.js";
import { UserState } from "../core/state/userState.js";
import { eventBus, EVENTS } from "../utils/eventBus.js";
import { openModal } from "./Modal.js";
import { navigate } from "../core/router.js";

function cartLineNode(line) {
  const modsText = line.selections?.map((s) => s.label).join(", ") || "";
  return h("div", { class: "cart-item", dataset: { lineId: line.lineId } }, [
    h("div", { class: "cart-item-qty" }, `${line.qty}x`),
    h("div", { class: "cart-item-info" }, [
      h("div", { class: "cart-item-name" }, line.name),
      modsText ? h("div", { class: "cart-item-mods" }, modsText) : null,
      h("button", { class: "cart-item-remove", "data-remove-line": line.lineId }, "Remove"),
    ]),
    h("div", { class: "cart-item-price" }, formatMoney(line.unitPriceCents * line.qty)),
  ]);
}

function buildDrawerContent() {
  const { lines, restaurantName } = CartState.getState();
  const { subtotalCents, deliveryFeeCents, taxCents, totalCents } = CartState.totals();

  const wrapper = h("div", { class: "drawer" }, []);
  const header = h("div", { class: "drawer-header" }, [
    h("h2", { id: "cartDrawerTitle" }, restaurantName ? `Cart \u2022 ${restaurantName}` : "Your cart"),
    h("button", { class: "modal-close", "aria-label": "Close cart", id: "cartDrawerCloseBtn" }, "\u2715"),
  ]);
  wrapper.appendChild(header);

  if (!lines.length) {
    wrapper.appendChild(
      h("div", { class: "drawer-empty" }, [
        h("p", {}, "Your cart is empty"),
        h("span", {}, "Add items from a restaurant to get started"),
      ])
    );
    return wrapper;
  }

  const body = h("div", { class: "drawer-body" }, lines.map(cartLineNode));
  wrapper.appendChild(body);

  const footer = h("div", { class: "drawer-footer" }, [
    h("div", { class: "cart-line" }, [h("span", {}, "Subtotal"), h("span", {}, formatMoney(subtotalCents))]),
    h("div", { class: "cart-line" }, [h("span", {}, "Delivery fee"), h("span", {}, formatMoney(deliveryFeeCents))]),
    h("div", { class: "cart-line" }, [h("span", {}, "Taxes & fees"), h("span", {}, formatMoney(taxCents))]),
    h("div", { class: "cart-line cart-total" }, [h("span", {}, "Total"), h("span", {}, formatMoney(totalCents))]),
    h("button", { class: "btn-primary checkout-btn", id: "goToCheckoutBtn" }, "Go to checkout"),
  ]);
  wrapper.appendChild(footer);

  return wrapper;
}

function wireDrawerEvents(root, close) {
  root.querySelector("#cartDrawerCloseBtn")?.addEventListener("click", close);

  qsa("[data-remove-line]", root).forEach((btn) => {
    btn.addEventListener("click", () => CartState.removeLine(btn.dataset.removeLine));
  });

  root.querySelector("#goToCheckoutBtn")?.addEventListener("click", () => {
    close();
    if (!UserState.isAuthenticated()) {
      navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    navigate("/checkout");
  });
}

export function mountCartDrawer() {
  eventBus.on(EVENTS.CART_OPEN, () => {
    let unsubscribe;
    let currentNode = buildDrawerContent();

    const close = openModal({
      content: currentNode,
      labelledBy: "cartDrawerTitle",
      onClose: () => unsubscribe?.(),
    });

    wireDrawerEvents(currentNode, close);

    // Keep the open drawer live if items are removed/added while it's open.
    let isFirstEmit = true;
    unsubscribe = CartState.subscribe(() => {
      if (isFirstEmit) { isFirstEmit = false; return; } // skip the immediate fire on subscribe
      const fresh = buildDrawerContent();
      wireDrawerEvents(fresh, close);
      currentNode.replaceWith(fresh);
      currentNode = fresh;
    });
  });
}
