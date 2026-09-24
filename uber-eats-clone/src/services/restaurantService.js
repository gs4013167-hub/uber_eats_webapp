import { simulateRequest, withRetry } from "./api/apiClient.js";
import { RESTAURANTS, CATEGORIES } from "../data/restaurants.js";
import { MENUS } from "../data/menus.js";

const PAGE_SIZE = 4;

export const restaurantService = {
  /** Paginated + optionally category-filtered restaurant listing (home page + infinite scroll). */
  async getRestaurants({ page = 1, category = "All", signal } = {}) {
    return withRetry(() =>
      simulateRequest(() => {
        const filtered = category === "All"
          ? RESTAURANTS
          : RESTAURANTS.filter((r) => r.cuisines.includes(category));

        const start = (page - 1) * PAGE_SIZE;
        const items = filtered.slice(start, start + PAGE_SIZE);
        return { items, hasMore: start + PAGE_SIZE < filtered.length, total: filtered.length };
      }, { signal })
    );
  },

  getCategories() {
    return CATEGORIES;
  },

  /**
   * Free-text search. Accepts an AbortSignal so the search page can cancel
   * a stale in-flight request when the user keeps typing (real-world pattern
   * to avoid race conditions where an old response arrives after a newer one).
   */
  async search(query, { signal } = {}) {
    return simulateRequest(() => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      return RESTAURANTS.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisines.some((c) => c.toLowerCase().includes(q))
      );
    }, { signal, delay: 350 });
  },

  async getRestaurantById(id, { signal } = {}) {
    return withRetry(() =>
      simulateRequest(() => {
        const restaurant = RESTAURANTS.find((r) => r.id === id);
        if (!restaurant) throw new Error(`Restaurant "${id}" not found`);
        return restaurant;
      }, { signal })
    );
  },

  async getMenu(restaurantId, { signal } = {}) {
    return withRetry(() =>
      simulateRequest(() => MENUS[restaurantId] ?? [], { signal })
    );
  },
};
