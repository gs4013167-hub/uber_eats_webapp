import { h, clearNode } from "../../utils/dom.js";
import { restaurantService } from "../../services/restaurantService.js";
import { RestaurantCard, RestaurantCardSkeleton } from "../../components/RestaurantCard.js";
import { LocationState } from "../../core/state/locationState.js";

let observer = null; // IntersectionObserver — must be disconnected in destroy()
let abortController = null; // in-flight request — must be aborted in destroy()

export async function render(container) {
  const state = { page: 1, category: "All", hasMore: true, loading: false };

  const address = LocationState.getState().address;

  container.appendChild(
    h("section", { class: "home-page" }, [
      h("div", { class: "home-hero" }, [
        h("h1", {}, `Delivering to ${address}`),
        h("p", {}, "Restaurants near you"),
      ]),
      h("div", { class: "category-chips", id: "categoryChips" }),
      h("div", { class: "restaurant-grid", id: "restaurantGrid" }),
      h("div", { id: "infiniteScrollSentinel", class: "scroll-sentinel" }),
    ])
  );

  const chipsEl = container.querySelector("#categoryChips");
  const gridEl = container.querySelector("#restaurantGrid");
  const sentinel = container.querySelector("#infiniteScrollSentinel");

  function renderChips() {
    const categories = restaurantService.getCategories();
    clearNode(chipsEl);
    categories.forEach((cat) => {
      chipsEl.appendChild(
        h(
          "button",
          {
            class: `chip${cat === state.category ? " chip-active" : ""}`,
            onClick: () => selectCategory(cat),
          },
          cat
        )
      );
    });
  }

  function showSkeletons(count = 4) {
    for (let i = 0; i < count; i++) gridEl.appendChild(RestaurantCardSkeleton());
  }

  async function loadPage() {
    if (state.loading || !state.hasMore) return;
    state.loading = true;

    if (state.page === 1) clearNode(gridEl);
    showSkeletons();

    abortController?.abort();
    abortController = new AbortController();

    try {
      const { items, hasMore } = await restaurantService.getRestaurants({
        page: state.page,
        category: state.category,
        signal: abortController.signal,
      });

      clearNode(gridEl); // remove skeletons
      // Re-render all pages loaded so far isn't ideal at scale, but for a demo
      // dataset this keeps state management simple and correct.
      if (state.page === 1) clearNode(gridEl);
      items.forEach((r) => gridEl.appendChild(RestaurantCard(r)));

      state.hasMore = hasMore;
      state.page += 1;
    } catch (err) {
      if (err.name === "AbortError") return; // expected when category changes mid-request
      clearNode(gridEl);
      gridEl.appendChild(h("p", { class: "error-text" }, "Couldn't load restaurants. Please try again."));
    } finally {
      state.loading = false;
    }
  }

  function selectCategory(cat) {
    if (cat === state.category) return;
    state.category = cat;
    state.page = 1;
    state.hasMore = true;
    renderChips();
    loadPage();
  }

  // IntersectionObserver replaces a manual scroll listener + getBoundingClientRect math —
  // the modern, performant way to detect "this element scrolled into view".
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadPage();
    },
    { rootMargin: "200px" }
  );
  observer.observe(sentinel);

  renderChips();
  await loadPage();
}

export function destroy() {
  observer?.disconnect();
  observer = null;
  abortController?.abort();
  abortController = null;
}
