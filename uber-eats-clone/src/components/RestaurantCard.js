import { h } from "../utils/dom.js";

export function RestaurantCard(restaurant) {
  const feeText = restaurant.deliveryFeeCents === 0
    ? "Free delivery"
    : `$${(restaurant.deliveryFeeCents / 100).toFixed(2)} delivery fee`;

  return h("a", { class: "restaurant-card", href: `/restaurant/${restaurant.id}`, "data-link": true }, [
    h("div", { class: "restaurant-card-img-wrap" }, [
      h("img", {
        class: "restaurant-card-img",
        src: restaurant.thumbnail,
        alt: restaurant.name,
        loading: "lazy",
      }),
    ]),
    h("div", { class: "restaurant-card-body" }, [
      h("div", { class: "restaurant-card-name" }, restaurant.name),
      h("div", { class: "restaurant-card-meta" },
        `\u2605 ${restaurant.rating} \u2022 ${restaurant.etaMinutes[0]}\u2013${restaurant.etaMinutes[1]} min \u2022 ${feeText}`
      ),
      h("div", { class: "restaurant-card-cuisines" }, restaurant.cuisines.join(", ")),
    ]),
  ]);
}

export function RestaurantCardSkeleton() {
  return h("div", { class: "restaurant-card skeleton" }, [
    h("div", { class: "restaurant-card-img-wrap skeleton-block" }),
    h("div", { class: "restaurant-card-body" }, [
      h("div", { class: "skeleton-line", style: "width: 60%" }),
      h("div", { class: "skeleton-line", style: "width: 40%" }),
      h("div", { class: "skeleton-line", style: "width: 50%" }),
    ]),
  ]);
}
