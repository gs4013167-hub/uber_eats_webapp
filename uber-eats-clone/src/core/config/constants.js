export const CONFIG = Object.freeze({
  DELIVERY_FEE_CENTS: 49,
  TAX_RATE: 0.0875,
  SIMULATED_NETWORK_DELAY_MS: 500,
  SIMULATED_FAILURE_RATE: 0.05, // ~5% of mock requests randomly fail, to exercise error handling
});

export const ROUTES = Object.freeze({
  HOME: "/",
  SEARCH: "/search",
  RESTAURANT: "/restaurant/:id",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation/:orderId",
  ORDER_TRACKING: "/order-tracking/:orderId",
  ORDER_HISTORY: "/orders",
  LOGIN: "/login",
  SIGNUP: "/signup",
  ACCOUNT: "/account",
});
