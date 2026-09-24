import { h, qs } from "../../utils/dom.js";
import { orderService } from "../../services/orderService.js";
import { ORDER_STATUS_SEQUENCE, ORDER_STATUS_LABELS } from "../../data/orders.js";

let pollIntervalId = null; // MUST be cleared in destroy() or it keeps firing after navigating away

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

  container.innerHTML = "";
  container.appendChild(
    h("section", { class: "tracking-page" }, [
      h("h1", {}, `Order from ${order.restaurantName}`),
      h("div", { class: "status-track", id: "statusTrack" }),
      h("p", { id: "statusLabel", class: "status-label" }),
    ])
  );

  const trackEl = qs("#statusTrack", container);
  const labelEl = qs("#statusLabel", container);

  ORDER_STATUS_SEQUENCE.forEach((status) => {
    trackEl.appendChild(h("div", { class: "status-dot", dataset: { status } }));
  });

  function renderStatus() {
    labelEl.textContent = ORDER_STATUS_LABELS[order.status];
    ORDER_STATUS_SEQUENCE.forEach((status, i) => {
      const dot = trackEl.querySelector(`[data-status="${status}"]`);
      dot.classList.toggle("done", i <= order.statusIndex);
    });
  }

  renderStatus();

  // Simulates a live-updating order (stand-in for WebSocket/SSE push updates
  // a real delivery app would use). This is exactly the kind of timer that
  // causes memory leaks and "ghost" background work if not cleared when the
  // user navigates away — which is why destroy() below exists.
  pollIntervalId = setInterval(() => {
    if (order.statusIndex >= ORDER_STATUS_SEQUENCE.length - 1) {
      clearInterval(pollIntervalId);
      return;
    }
    order = orderService.advanceOrderStatus(order.id);
    renderStatus();
  }, 3000);
}

export function destroy() {
  clearInterval(pollIntervalId);
  pollIntervalId = null;
}
