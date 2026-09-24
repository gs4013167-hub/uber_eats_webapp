import { h, qs } from "../../utils/dom.js";
import { isValidEmail, isRequired, passwordStrength } from "../../utils/validators.js";
import { authService } from "../../services/authService.js";
import { UserState } from "../../core/state/userState.js";
import { showToast } from "../../components/Toast.js";
import { navigate } from "../../core/router.js";

export async function render(container, { query }) {
  container.appendChild(
    h("section", { class: "auth-page" }, [
      h("h1", {}, "Create account"),
      h("form", { id: "signupForm", novalidate: true }, [
        h("div", { class: "form-field", id: "name-wrap" }, [
          h("label", { for: "name" }, "Full name"),
          h("input", { type: "text", id: "name", autocomplete: "name" }),
          h("span", { class: "field-error", id: "name-error" }),
        ]),
        h("div", { class: "form-field", id: "email-wrap" }, [
          h("label", { for: "email" }, "Email"),
          h("input", { type: "email", id: "email", autocomplete: "email" }),
          h("span", { class: "field-error", id: "email-error" }),
        ]),
        h("div", { class: "form-field", id: "password-wrap" }, [
          h("label", { for: "password" }, "Password"),
          h("input", { type: "password", id: "password", autocomplete: "new-password" }),
          h("div", { class: "password-strength", id: "passwordStrength" }),
          h("span", { class: "field-error", id: "password-error" }),
        ]),
        h("button", { type: "submit", class: "btn-primary", id: "signupBtn" }, "Create account"),
      ]),
      h("p", { class: "auth-switch" }, ["Already have an account? ", h("a", { href: "/login", "data-link": true }, "Sign in")]),
    ])
  );

  const passwordInput = qs("#password", container);
  const strengthEl = qs("#passwordStrength", container);

  passwordInput.addEventListener("input", (e) => {
    const { score, label } = passwordStrength(e.target.value);
    strengthEl.textContent = e.target.value ? label : "";
    strengthEl.className = `password-strength strength-${score}`;
  });

  function setFieldError(id, message) {
    qs(`#${id}-error`, container).textContent = message ?? "";
    qs(`#${id}-wrap`, container).classList.toggle("has-error", !!message);
  }

  qs("#signupForm", container).addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = qs("#name", container).value.trim();
    const email = qs("#email", container).value.trim();
    const password = passwordInput.value;

    const errors = {};
    if (!isRequired(name)) errors.name = "Name is required.";
    if (!isValidEmail(email)) errors.email = "Enter a valid email.";
    if (passwordStrength(password).score < 2) errors.password = "Choose a stronger password.";
    ["name", "email", "password"].forEach((id) => setFieldError(id, errors[id]));
    if (Object.keys(errors).length) {
      qs(`#${Object.keys(errors)[0]}`, container).focus();
      return;
    }

    const btn = qs("#signupBtn", container);
    btn.disabled = true;
    btn.textContent = "Creating account\u2026";

    try {
      const { token, profile } = await authService.signup(name, email, password);
      UserState.login(token, profile);
      showToast(`Welcome, ${profile.name}!`);
      navigate(query.redirect || "/", { replace: true });
    } catch (err) {
      setFieldError("email", err.message);
      btn.disabled = false;
      btn.textContent = "Create account";
    }
  });
}
