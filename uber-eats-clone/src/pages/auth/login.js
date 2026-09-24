import { h, qs } from "../../utils/dom.js";
import { isValidEmail, isRequired } from "../../utils/validators.js";
import { authService } from "../../services/authService.js";
import { UserState } from "../../core/state/userState.js";
import { showToast } from "../../components/Toast.js";
import { navigate } from "../../core/router.js";

export async function render(container, { query }) {
  container.appendChild(
    h("section", { class: "auth-page" }, [
      h("h1", {}, "Sign in"),
      h("form", { id: "loginForm", novalidate: true }, [
        h("div", { class: "form-field", id: "email-wrap" }, [
          h("label", { for: "email" }, "Email"),
          h("input", { type: "email", id: "email", autocomplete: "email" }),
          h("span", { class: "field-error", id: "email-error" }),
        ]),
        h("div", { class: "form-field", id: "password-wrap" }, [
          h("label", { for: "password" }, "Password"),
          h("input", { type: "password", id: "password", autocomplete: "current-password" }),
          h("span", { class: "field-error", id: "password-error" }),
        ]),
        h("button", { type: "submit", class: "btn-primary", id: "loginBtn" }, "Sign in"),
      ]),
      h("p", { class: "auth-hint" }, `Demo account: alex@example.com / Password1!`),
      h("p", { class: "auth-switch" }, [
        "Don't have an account? ",
        h("a", { href: "/signup", "data-link": true }, "Sign up"),
      ]),
    ])
  );

  function setFieldError(id, message) {
    qs(`#${id}-error`, container).textContent = message ?? "";
    qs(`#${id}-wrap`, container).classList.toggle("has-error", !!message);
  }

  qs("#loginForm", container).addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = qs("#email", container).value.trim();
    const password = qs("#password", container).value;

    const errors = {};
    if (!isValidEmail(email)) errors.email = "Enter a valid email.";
    if (!isRequired(password)) errors.password = "Password is required.";
    setFieldError("email", errors.email);
    setFieldError("password", errors.password);
    if (Object.keys(errors).length) {
      qs(`#${Object.keys(errors)[0]}`, container).focus();
      return;
    }

    const btn = qs("#loginBtn", container);
    btn.disabled = true;
    btn.textContent = "Signing in\u2026";

    try {
      const { token, profile } = await authService.login(email, password);
      UserState.login(token, profile);
      showToast(`Welcome back, ${profile.name}!`);
      navigate(query.redirect || "/", { replace: true });
    } catch (err) {
      setFieldError("password", err.message);
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
}
