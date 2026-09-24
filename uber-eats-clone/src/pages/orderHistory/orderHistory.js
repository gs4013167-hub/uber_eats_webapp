import { h } from "../../utils/dom.js";
import { formatMoney, formatRelativeTime } from "../../utils/formatters.js";
import { orderService } from "../../services/orderService.js";

export async function render(container) {
  container.appendChild(h("div", { class: "route-loading" }, "Loading orders\u2026"));

  const orders = await orderService.getOrderHistory();

  container.innerHTML = "";

  if (!orders.length) {
    container.appendChild(
      h("div", { class: "empty-page" }, [
        h("p", {}, "You haven't placed any orders yet."),
        h("a", { href: "/", "data-link": true, class: "btn-primary" }, "Browse restaurants"),
      ])
    );
    return;
  }

  container.appendChild(
    h("section", { class: "order-history-page" }, [
      h("h1", {}, "Your orders"),
      h(
        "div",
        { class: "order-history-list" },
        orders.map((order) => {
          const totalCents = order.lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0) + order.tipCents;
          return h("a", { href: `/order-tracking/${order.id}`, "data-link": true, class: "order-history-item" }, [
            h("div", {}, [
              h("div", { class: "order-history-restaurant" }, order.restaurantName),
              h("div", { class: "order-history-meta" }, `${formatRelativeTime(order.placedAt)} \u2022 ${order.lines.length} items`),
            ]),
            h("div", { class: "order-history-total" }, formatMoney(totalCents)),
          ]);
        })
      ),
    ])
  );
}
