import { h } from "../../utils/dom.js";

export async function render(container) {
  container.appendChild(
    h("section", { class: "not-found-page" }, [
      h("h1", {}, "404"),
      h("p", {}, "We couldn't find that page."),
      h("a", { href: "/", "data-link": true, class: "btn-primary" }, "Back to home"),
    ])
  );
}
