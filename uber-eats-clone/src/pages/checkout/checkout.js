import { h, qs } from "../../utils/dom.js";
import { formatMoney, formatCardNumberInput } from "../../utils/formatters.js";
import { isValidCardNumber, isValidExpiry, isValidCVV, isRequired } from "../../utils/validators.js";
import { CartState } from "../../core/state/cartState.js";
import { LocationState } from "../../core/state/locationState.js";
import { orderService } from "../../services/orderService.js";
import { showToast } from "../../components/Toast.js";
import { navigate } from "../../core/router.js";

const PROMO_CODES = { EATS6: 600, SAVE10: 1000 };

export async function render(container) {
  const cart = CartState.getState();

  if (!cart.lines.length) {
    container.appendChild(
      h("div", { class: "empty-page" }, [
        h("p", {}, "Your cart is empty."),
        h("a", { href: "/", "data-link": true, class: "btn-primary" }, "Browse restaurants"),
      ])
    );
    return;
  }

  const state = { promoDiscountCents: 0, tipCents: 300, submitting: false };

  container.appendChild(
    h("section", { class: "checkout-page" }, [
      h("h1", {}, "Checkout"),

      h("div", { class: "checkout-card" }, [
        h("h2", {}, "Delivery address"),
        h("p", {}, LocationState.getState().address),
      ]),

      h("form", { id: "checkoutForm", novalidate: true }, [
        h("div", { class: "checkout-card" }, [
          h("h2", {}, "Payment"),
          formField("cardName", "Name on card", "text"),
          formField("cardNumber", "Card number", "text", { placeholder: "4242 4242 4242 4242", inputmode: "numeric" }),
          h("div", { class: "form-row" }, [
            formField("cardExpiry", "Expiry (MM/YY)", "text", { placeholder: "12/28" }),
            formField("cardCVV", "CVV", "text", { inputmode: "numeric", maxlength: "4" }),
          ]),
        ]),

        h("div", { class: "checkout-card" }, [
          h("h2", {}, "Promo code"),
          h("div", { class: "promo-row" }, [
            h("input", { type: "text", id: "promoInput", placeholder: "Enter code" }),
            h("button", { type: "button", id: "applyPromoBtn", class: "text-btn" }, "Apply"),
          ]),
          h("p", { id: "promoMessage", class: "promo-message" }),
        ]),

        h("div", { class: "checkout-card" }, [
          h("h2", {}, "Add a tip"),
          h("div", { class: "tip-options", id: "tipOptions" }),
        ]),

        h("div", { class: "checkout-card order-summary" }, [
          h("h2", {}, "Order summary"),
          h("div", { id: "orderSummaryLines" }),
        ]),

        h("button", { type: "submit", class: "btn-primary place-order-btn", id: "placeOrderBtn" }, "Place order"),
      ]),
    ])
  );

  function formField(id, label, type, extra = {}) {
    return h("div", { class: "form-field", id: `${id}-wrap` }, [
      h("label", { for: id }, label),
      h("input", { type, id, name: id, ...extra }),
      h("span", { class: "field-error", id: `${id}-error` }),
    ]);
  }

  // --- Tip selector ---
  const tipOptionsEl = qs("#tipOptions", container);
  [0, 200, 300, 500].forEach((cents) => {
    tipOptionsEl.appendChild(
      h(
        "button",
        {
          type: "button",
          class: `chip${cents === state.tipCents ? " chip-active" : ""}`,
          dataset: { tip: cents },
        },
        cents === 0 ? "No tip" : formatMoney(cents)
      )
    );
  });
  tipOptionsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tip]");
    if (!btn) return;
    state.tipCents = Number(btn.dataset.tip);
    tipOptionsEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip-active"));
    btn.classList.add("chip-active");
    renderSummary();
  });

  // --- Card number auto-formatting ---
  const cardNumberInput = qs("#cardNumber", container);
  cardNumberInput.addEventListener("input", (e) => {
    e.target.value = formatCardNumberInput(e.target.value);
  });

  // --- Promo code (async, simulated) ---
  qs("#applyPromoBtn", container).addEventListener("click", async () => {
    const code = qs("#promoInput", container).value.trim().toUpperCase();
    const messageEl = qs("#promoMessage", container);
    const btn = qs("#applyPromoBtn", container);

    btn.disabled = true;
    btn.textContent = "Checking\u2026";
    await new Promise((r) => setTimeout(r, 400)); // simulated validation call
    btn.disabled = false;
    btn.textContent = "Apply";

    if (PROMO_CODES[code]) {
      state.promoDiscountCents = PROMO_CODES[code];
      messageEl.textContent = `Promo applied: \u2212${formatMoney(PROMO_CODES[code])}`;
      messageEl.className = "promo-message success";
    } else {
      state.promoDiscountCents = 0;
      messageEl.textContent = "Invalid promo code.";
      messageEl.className = "promo-message error";
    }
    renderSummary();
  });

  // --- Order summary ---
  function renderSummary() {
    const { subtotalCents, deliveryFeeCents, taxCents } = CartState.totals();
    const totalCents = subtotalCents + deliveryFeeCents + taxCents + state.tipCents - state.promoDiscountCents;

    const lines = [
      ["Subtotal", subtotalCents],
      ["Delivery fee", deliveryFeeCents],
      ["Taxes & fees", taxCents],
      ["Tip", state.tipCents],
    ];
    if (state.promoDiscountCents) lines.push(["Promo discount", -state.promoDiscountCents]);

    const summaryEl = qs("#orderSummaryLines", container);
    summaryEl.innerHTML = "";
    lines.forEach(([label, cents]) => {
      summaryEl.appendChild(
        h("div", { class: "cart-line" }, [h("span", {}, label), h("span", {}, formatMoney(cents))])
      );
    });
    summaryEl.appendChild(
      h("div", { class: "cart-line cart-total" }, [h("span", {}, "Total"), h("span", {}, formatMoney(Math.max(totalCents, 0)))])
    );
  }
  renderSummary();

  // --- Field-level validation ---
  function setFieldError(id, message) {
    qs(`#${id}-error`, container).textContent = message ?? "";
    qs(`#${id}-wrap`, container).classList.toggle("has-error", !!message);
  }

  function validateForm() {
    const values = {
      cardName: qs("#cardName", container).value,
      cardNumber: qs("#cardNumber", container).value,
      cardExpiry: qs("#cardExpiry", container).value,
      cardCVV: qs("#cardCVV", container).value,
    };

    const errors = {};
    if (!isRequired(values.cardName)) errors.cardName = "Name is required.";
    if (!isValidCardNumber(values.cardNumber)) errors.cardNumber = "Enter a valid card number.";
    if (!isValidExpiry(values.cardExpiry)) errors.cardExpiry = "Enter a valid expiry (MM/YY).";
    if (!isValidCVV(values.cardCVV)) errors.cardCVV = "Enter a valid CVV.";

    ["cardName", "cardNumber", "cardExpiry", "cardCVV"].forEach((id) => setFieldError(id, errors[id]));

    const firstErrorId = Object.keys(errors)[0];
    if (firstErrorId) qs(`#${firstErrorId}`, container).focus(); // move focus to the first invalid field

    return { valid: Object.keys(errors).length === 0, values };
  }

  // --- Submit ---
  qs("#checkoutForm", container).addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.submitting) return;

    const { valid, values } = validateForm();
    if (!valid) return;

    const submitBtn = qs("#placeOrderBtn", container);
    state.submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing order\u2026";

    try {
      const order = await orderService.placeOrder({
        cart,
        address: LocationState.getState().address,
        payment: { cardNumber: values.cardNumber.replace(/\s/g, "") },
        tipCents: state.tipCents,
        promoDiscountCents: state.promoDiscountCents,
      });
      CartState.clear();
      showToast("Order placed!");
      navigate(`/order-confirmation/${order.id}`, { replace: true });
    } catch (err) {
      showToast(err.message ?? "Couldn't place your order. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Place order";
      state.submitting = false;
    }
  });
}
