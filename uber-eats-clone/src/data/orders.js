/**
 * In-memory order "database" — populated at runtime by orderService.placeOrder().
 * Resets on page refresh since this is a mock; a real backend would persist it.
 */
export const ORDERS = [];

export const ORDER_STATUS_SEQUENCE = [
  "placed",
  "confirmed",
  "preparing",
  "picked_up",
  "delivered",
];

export const ORDER_STATUS_LABELS = {
  placed: "Order placed",
  confirmed: "Restaurant confirmed",
  preparing: "Preparing your food",
  picked_up: "Courier picked up your order",
  delivered: "Delivered",
};
