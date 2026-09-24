import { h, clearNode } from "../../utils/dom.js";
import { debounce } from "../../utils/debounce.js";
import { restaurantService } from "../../services/restaurantService.js";
import { RestaurantCard } from "../../components/RestaurantCard.js";

let abortController = null;

export async function render(container, { query }) {
  container.appendChild(
    h("section", { class: "search-page" }, [
      h("div", { class: "search-input-wrap" }, [
        h("input", {
          type: "search",
          id: "searchInput",
          placeholder: "Search restaurants or cuisines",
          value: query.q ?? "",
          autofocus: true,
        }),
      ]),
      h("div", { id: "searchResults", class: "restaurant-grid" }),
      h("p", { id: "searchHint", class: "search-hint" }, "Search for a restaurant, cuisine, or dish."),
    ])
  );

  const input = container.querySelector("#searchInput");
  const resultsEl = container.querySelector("#searchResults");
  const hintEl = container.querySelector("#searchHint");

  async function runSearch(term) {
    clearNode(resultsEl);

    if (!term.trim()) {
      hintEl.hidden = false;
      hintEl.textContent = "Search for a restaurant, cuisine, or dish.";
      return;
    }

    // Cancel any still-pending previous request — prevents a slow earlier
    // response from overwriting a faster, more recent one (a real race
    // condition bug that AbortController exists specifically to solve).
    abortController?.abort();
    abortController = new AbortController();

    hintEl.hidden = false;
    hintEl.textContent = "Searching\u2026";

    try {
      const results = await restaurantService.search(term, { signal: abortController.signal });
      hintEl.hidden = results.length > 0;
      hintEl.textContent = `No results for "${term}".`;
      results.forEach((r) => resultsEl.appendChild(RestaurantCard(r)));
    } catch (err) {
      if (err.name === "AbortError") return;
      hintEl.hidden = false;
      hintEl.textContent = "Something went wrong. Please try again.";
    }
  }

  const debouncedSearch = debounce((value) => runSearch(value), 300);

  input.addEventListener("input", (e) => debouncedSearch(e.target.value));

  if (query.q) runSearch(query.q);
}

export function destroy() {
  abortController?.abort();
  abortController = null;
}
