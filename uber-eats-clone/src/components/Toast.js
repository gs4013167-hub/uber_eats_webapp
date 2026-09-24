import { eventBus, EVENTS } from "../utils/eventBus.js";

/**
 * Mounted once by app.js. Any module anywhere can trigger a toast just by
 * emitting an event — no import of this file needed. This is the payoff
 * of the event bus pattern: true decoupling.
 */
export function mountToast() {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.hidden = true;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);

  let hideTimer;
  eventBus.on(EVENTS.TOAST_SHOW, (event) => {
    toast.textContent = event.detail.message;
    toast.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.hidden = true;
    }, event.detail.duration ?? 2200);
  });
}

export function showToast(message, duration) {
  eventBus.emit(EVENTS.TOAST_SHOW, { message, duration });
}
