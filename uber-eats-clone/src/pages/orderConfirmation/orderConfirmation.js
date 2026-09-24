import { h } from "../../utils/dom.js";
import { formatMoney, formatDateTime } from "../../utils/formatters.js";
import { orderService } from "../../services/orderService.js";

export async function render(container, { params }) {
  container.appendChild(h("div", { class: "route-loading" }, "Loading order\u2026"));

  let order;
  try {
    order = await orderService.getOrderById(params.orderId);
  } catch {
    container.innerHTML = "";
    container.appendChild(h("p", { class: "error-text" }, "Order not found."));
    return;
  }

  const totalCents =
    order.lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0) + order.tipCents - order.promoDiscountCents + 49;

  container.innerHTML = "";
  container.appendChild(
    h("section", { class: "confirmation-page" }, [
      h("div", { class: "confirmation-icon" }, "\u2705"),
      h("h1", {}, "Order confirmed!"),
      h("p", {}, `Your order from ${order.restaurantName} has been placed.`),
      h("div", { class: "checkout-card" }, [
        h("div", { class: "cart-line" }, [h("span", {}, "Order #"), h("span", {}, order.id)]),
        h("div", { class: "cart-line" }, [h("span", {}, "Placed"), h("span", {}, formatDateTime(order.placedAt))]),
        h("div", { class: "cart-line" }, [h("span", {}, "Delivering to"), h("span", {}, order.address)]),
        h("div", { class: "cart-line cart-total" }, [h("span", {}, "Total"), h("span", {}, formatMoney(totalCents))]),
      ]),
      h("a", {
        href: `/order-tracking/${order.id}`,
        "data-link": true,
        class: "btn-primary",
      }, "Track your order"),
    ])
  );
}
