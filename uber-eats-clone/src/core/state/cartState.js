import { Store } from "./Store.js";
import { eventBus, EVENTS } from "../../utils/eventBus.js";

/**
 * Cart persists to localStorage under "ue_cart" — this is what fixes the
 * "cart disappears on refresh / when navigating to checkout" gap from before.
 * Each line item is scoped to a restaurantId so switching restaurants can
 * warn the user their existing cart will be cleared (handled in the UI layer).
 */
const STORAGE_KEY = "ue_cart";

const initialState = {
  restaurantId: null,
  restaurantName: null,
  lines: [], // { lineId, itemId, name, unitPriceCents, qty, selections, note }
};

const cartStore = new Store(initialState, STORAGE_KEY);

function totals() {
  const { lines } = cartStore.getState();
  const subtotalCents = lines.reduce((sum, l) => sum + l.unitPriceCents * l.qty, 0);
  const deliveryFeeCents = lines.length ? 49 : 0;
  const taxCents = Math.round(subtotalCents * 0.0875);
  const totalCents = subtotalCents + deliveryFeeCents + taxCents;
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  return { subtotalCents, deliveryFeeCents, taxCents, totalCents, itemCount };
}

export const CartState = {
  subscribe: cartStore.subscribe.bind(cartStore),
  getState: cartStore.getState.bind(cartStore),
  totals,

  addLine(restaurantId, restaurantName, line) {
    const current = cartStore.getState();

    // Switching restaurants replaces the cart — matches real Uber Eats behavior.
    const lines = current.restaurantId && current.restaurantId !== restaurantId
      ? [line]
      : [...current.lines, line];

    cartStore.setState({ restaurantId, restaurantName, lines });
    eventBus.emit(EVENTS.CART_UPDATED, cartStore.getState());
  },

  removeLine(lineId) {
    const { lines } = cartStore.getState();
    const nextLines = lines.filter((l) => l.lineId !== lineId);
    cartStore.setState({
      lines: nextLines,
      restaurantId: nextLines.length ? cartStore.getState().restaurantId : null,
      restaurantName: nextLines.length ? cartStore.getState().restaurantName : null,
    });
    eventBus.emit(EVENTS.CART_UPDATED, cartStore.getState());
  },

  clear() {
    cartStore.setState(initialState);
    eventBus.emit(EVENTS.CART_UPDATED, cartStore.getState());
  },
};
