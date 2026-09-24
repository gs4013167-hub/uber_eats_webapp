import { h } from "../../utils/dom.js";
import { UserState } from "../../core/state/userState.js";
import { showToast } from "../../components/Toast.js";
import { navigate } from "../../core/router.js";

export async function render(container) {
  const { profile } = UserState.getState();

  container.appendChild(
    h("section", { class: "account-page" }, [
      h("h1", {}, "Account"),
      h("div", { class: "checkout-card" }, [
        h("div", { class: "cart-line" }, [h("span", {}, "Name"), h("span", {}, profile.name)]),
        h("div", { class: "cart-line" }, [h("span", {}, "Email"), h("span", {}, profile.email)]),
      ]),
      h("a", { href: "/orders", "data-link": true, class: "account-link" }, "Order history \u2192"),
      h(
        "button",
        {
          class: "btn-primary",
          id: "logoutBtn",
          style: "margin-top: 24px; background: #cc0000;",
        },
        "Log out"
      ),
    ])
  );

  container.querySelector("#logoutBtn").addEventListener("click", () => {
    UserState.logout();
    showToast("Signed out");
    navigate("/");
  });
}
