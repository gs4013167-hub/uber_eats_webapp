import { h } from "../utils/dom.js";

export function mountFooter(container) {
  container.appendChild(
    h("footer", { class: "app-footer" }, [
      h("p", {}, `\u00A9 ${new Date().getFullYear()} UberEatsClone \u2014 built for learning purposes`),
    ])
  );
}
