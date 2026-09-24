import { h, qs, qsa, clearNode } from "../../utils/dom.js";
import { formatMoney } from "../../utils/formatters.js";
import { debounce } from "../../utils/debounce.js";
import { restaurantService } from "../../services/restaurantService.js";
import { CartState } from "../../core/state/cartState.js";
import { openModal } from "../../components/Modal.js";
import { showToast } from "../../components/Toast.js";
import { navigate } from "../../core/router.js";

let categoryObserver = null;
let abortController = null;

export async function render(container, { params }) {
  const restaurantId = params.id;
  abortController = new AbortController();

  container.appendChild(h("div", { class: "route-loading" }, "Loading restaurant\u2026"));

  let restaurant, menu;
  try {
    [restaurant, menu] = await Promise.all([
      restaurantService.getRestaurantById(restaurantId, { signal: abortController.signal }),
      restaurantService.getMenu(restaurantId, { signal: abortController.signal }),
    ]);
  } catch (err) {
    if (err.name === "AbortError") return;
    clearNode(container);
    container.appendChild(h("p", { class: "error-text" }, "Restaurant not found."));
    return;
  }

  clearNode(container);
  buildPage(container, restaurant, menu);
}

function itemCardNode(item, onOpen) {
  return h("button", { class: "menu-item", onClick: () => onOpen(item) }, [
    h("div", { class: "menu-item-info" }, [
      item.popular ? h("span", { class: "menu-item-popular" }, "Popular") : null,
      h("div", { class: "menu-item-name" }, item.name),
      h("p", { class: "menu-item-desc" }, item.desc),
      h("div", { class: "menu-item-price" }, formatMoney(item.priceCents)),
    ]),
    h("div", { class: "menu-item-img-wrap" }, [
      h("img", { class: "menu-item-img", src: item.img, alt: item.name, loading: "lazy" }),
      h("span", { class: "menu-item-add", "aria-hidden": "true" }, "+"),
    ]),
  ]);
}

function buildPage(container, restaurant, menu) {
  const feeText = restaurant.deliveryFeeCents === 0
    ? "Free delivery"
    : `${formatMoney(restaurant.deliveryFeeCents)} delivery fee`;

  container.appendChild(
    h("div", {}, [
      h("button", { class: "back-btn", onClick: () => navigate("/") }, "\u2190 Back"),
      h("div", { class: "hero" }, [h("img", { class: "hero-img", src: restaurant.heroImage, alt: restaurant.name })]),
      h("section", { class: "restaurant-info" }, [
        h("h1", { class: "restaurant-name" }, restaurant.name),
        h("div", { class: "restaurant-meta" },
          `\u2605 ${restaurant.rating} (${restaurant.ratingCount.toLocaleString()}) \u2022 ${restaurant.cuisines.join(", ")}`
        ),
        h("div", { class: "restaurant-meta secondary" },
          `${restaurant.etaMinutes[0]}\u2013${restaurant.etaMinutes[1]} min \u2022 ${feeText}`
        ),
      ]),
      h("input", {
        type: "search",
        class: "menu-search-input",
        id: "menuSearchInput",
        placeholder: `Search ${restaurant.name}`,
      }),
      h("nav", { class: "category-nav", id: "categoryNav" }, [
        h("div", { class: "category-nav-track", id: "categoryNavTrack" }),
      ]),
      h("section", { class: "menu", id: "menuSection" }),
      h("p", { class: "no-results", id: "noResults", hidden: true }, "No items match your search."),
    ])
  );

  const categoryNavTrack = qs("#categoryNavTrack", container);
  const menuSection = qs("#menuSection", container);
  const noResults = qs("#noResults", container);

  function renderCategoryTabs() {
    clearNode(categoryNavTrack);
    menu.forEach((cat, i) => {
      categoryNavTrack.appendChild(
        h(
          "button",
          {
            class: `category-tab${i === 0 ? " active" : ""}`,
            dataset: { cat: cat.id },
            onClick: () => scrollToCategory(cat.id),
          },
          cat.title
        )
      );
    });
  }

  function scrollToCategory(catId) {
    const section = document.getElementById(catId);
    if (!section) return;
    const navHeight = qs("#categoryNav", container).offsetHeight;
    const top = section.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function renderMenu(filterText = "") {
    const query = filterText.trim().toLowerCase();
    clearNode(menuSection);
    let visibleCount = 0;

    menu.forEach((cat) => {
      const items = query
        ? cat.items.filter((i) => i.name.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query))
        : cat.items;
      if (!items.length) return;
      visibleCount += items.length;

      menuSection.appendChild(
        h("div", { class: "menu-category", id: cat.id }, [
          h("h2", { class: "menu-category-title" }, cat.title),
          ...items.map((item) => itemCardNode(item, openItemModal)),
        ])
      );
    });

    noResults.hidden = visibleCount !== 0;
  }

  qs("#menuSearchInput", container).addEventListener(
    "input",
    debounce((e) => renderMenu(e.target.value), 150)
  );

  // Scroll-spy via IntersectionObserver: each category section reports when
  // it crosses a thin trigger zone near the top of the viewport, and we mark
  // its tab active — no manual scroll math needed.
  function setupScrollSpy() {
    categoryObserver?.disconnect();
    const navHeight = qs("#categoryNav", container)?.offsetHeight ?? 0;

    categoryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          qsa(".category-tab", container).forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.cat === entry.target.id);
          });
        });
      },
      { rootMargin: `-${navHeight + 4}px 0px -70% 0px`, threshold: 0 }
    );

    qsa(".menu-category", container).forEach((section) => categoryObserver.observe(section));
  }

  function openItemModal(item) {
    const modalState = { qty: 1 };

    const optionsHTML = item.optionGroups.map((group) =>
      h("div", { class: "option-group", dataset: { groupId: group.id, required: String(group.required) } }, [
        h("div", { class: "option-group-header" }, [
          h("span", { class: "option-group-title" }, group.title),
          group.required ? h("span", { class: "option-group-required" }, "Required") : null,
        ]),
        ...group.choices.map((choice, idx) =>
          h("label", { class: "option-row" }, [
            h("div", { class: "option-row-left" }, [
              h("input", {
                class: "option-input",
                type: group.type,
                name: `group-${group.id}`,
                value: choice.id,
                dataset: { group: group.id, price: choice.priceCents },
                checked: group.type === "radio" && idx === 0 && group.required,
              }),
              h("span", { class: "option-row-label" }, choice.label),
            ]),
            h("span", { class: "option-row-price" }, choice.priceCents ? `+${formatMoney(choice.priceCents)}` : ""),
          ])
        ),
      ])
    );

    const qtyValueEl = h("span", { class: "qty-value" }, "1");
    const addBtnLabel = h("span", {}, "Add to cart");
    const addBtnPrice = h("span", {}, `\u2022 ${formatMoney(item.priceCents)}`);
    const notesInput = h("textarea", {
      id: "specialInstructions",
      rows: "2",
      maxlength: "200",
      placeholder: "e.g. no onions, extra spicy",
    });

    const content = h("div", { class: "item-modal" }, [
      h("img", { class: "modal-img", src: item.img, alt: item.name }),
      h("div", { class: "modal-body" }, [
        h("h2", { id: "itemModalTitle", class: "modal-title" }, item.name),
        h("p", { class: "modal-desc" }, item.desc),
        h("p", { class: "modal-price" }, formatMoney(item.priceCents)),
        h("div", { class: "modal-options" }, optionsHTML),
        h("div", { class: "modal-field" }, [h("label", { for: "specialInstructions" }, "Special instructions"), notesInput]),
      ]),
      h("div", { class: "modal-footer" }, [
        h("div", { class: "qty-stepper" }, [
          h("button", { class: "qty-btn", id: "qtyMinus", disabled: true }, "\u2212"),
          qtyValueEl,
          h("button", { class: "qty-btn", id: "qtyPlus" }, "+"),
        ]),
        h("button", { class: "btn-primary add-to-cart-btn", id: "addToCartBtn" }, [addBtnLabel, addBtnPrice]),
      ]),
    ]);

    function getSelectedOptions() {
      return qsa(".option-input:checked", content).map((input) => ({
        groupId: input.dataset.group,
        choiceId: input.value,
        label: input.closest(".option-row").querySelector(".option-row-label").textContent,
        priceCents: Number(input.dataset.price),
      }));
    }

    function isValid() {
      return qsa(".option-group", content).every((group) => {
        if (group.dataset.required !== "true") return true;
        return !!group.querySelector(".option-input:checked");
      });
    }

    function unitPrice() {
      return item.priceCents + getSelectedOptions().reduce((sum, o) => sum + o.priceCents, 0);
    }

    function refreshFooter() {
      const total = unitPrice() * modalState.qty;
      addBtnPrice.textContent = `\u2022 ${formatMoney(total)}`;
      const valid = isValid();
      addToCartBtn.disabled = !valid;
      addBtnLabel.textContent = valid ? "Add to cart" : "Select required options";
    }

    content.querySelector(".modal-options").addEventListener("change", refreshFooter);

    const qtyMinus = content.querySelector("#qtyMinus");
    const qtyPlus = content.querySelector("#qtyPlus");
    const addToCartBtn = content.querySelector("#addToCartBtn");

    qtyMinus.addEventListener("click", () => {
      if (modalState.qty <= 1) return;
      modalState.qty -= 1;
      qtyValueEl.textContent = String(modalState.qty);
      qtyMinus.disabled = modalState.qty <= 1;
      refreshFooter();
    });
    qtyPlus.addEventListener("click", () => {
      modalState.qty += 1;
      qtyValueEl.textContent = String(modalState.qty);
      qtyMinus.disabled = false;
      refreshFooter();
    });

    addToCartBtn.addEventListener("click", () => {
      if (!isValid()) return;
      CartState.addLine(restaurant.id, restaurant.name, {
        lineId: `${item.id}-${Date.now()}`,
        itemId: item.id,
        name: item.name,
        unitPriceCents: unitPrice(),
        qty: modalState.qty,
        selections: getSelectedOptions(),
        note: notesInput.value.trim(),
      });
      showToast(`Added ${item.name} to cart`);
      close();
    });

    refreshFooter();
    const close = openModal({ content, labelledBy: "itemModalTitle" });
  }

  renderCategoryTabs();
  renderMenu();
  setupScrollSpy();
}

export function destroy() {
  categoryObserver?.disconnect();
  categoryObserver = null;
  abortController?.abort();
  abortController = null;
}
