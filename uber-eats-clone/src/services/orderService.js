import { simulateRequest } from "./api/apiClient.js";
import { ORDERS, ORDER_STATUS_SEQUENCE } from "../data/orders.js";

let nextOrderId = 1000;

export const orderService = {
  async placeOrder({ cart, address, payment, tipCents, promoDiscountCents = 0 }) {
    return simulateRequest(() => {
      const order = {
        id: String(nextOrderId++),
        restaurantName: cart.restaurantName,
        lines: cart.lines,
        address,
        paymentLast4: payment.cardNumber.slice(-4),
        tipCents,
        promoDiscountCents,
        placedAt: new Date().toISOString(),
        status: "placed",
        statusIndex: 0,
      };
      ORDERS.push(order);
      return order;
    }, { delay: 900 });
  },

  async getOrderById(orderId, { signal } = {}) {
    return simulateRequest(() => {
      const order = ORDERS.find((o) => o.id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);
      return order;
    }, { signal });
  },

  async getOrderHistory({ signal } = {}) {
    return simulateRequest(() => [...ORDERS].reverse(), { signal });
  },

  /**
   * Advances a mock order to its next status. orderTracking.js polls this
   * on an interval to simulate a live-updating delivery — a stand-in for
   * what a real app would receive over WebSockets/SSE.
   */
  advanceOrderStatus(orderId) {
    const order = ORDERS.find((o) => o.id === orderId);
    if (!order || order.statusIndex >= ORDER_STATUS_SEQUENCE.length - 1) return order;
    order.statusIndex += 1;
    order.status = ORDER_STATUS_SEQUENCE[order.statusIndex];
    return order;
  },
};
