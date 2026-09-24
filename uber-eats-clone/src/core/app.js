import { initRouter } from "./router.js";
import { mountHeader } from "../components/Header.js";
import { mountFooter } from "../components/Footer.js";
import { mountToast, showToast } from "../components/Toast.js";
import { mountCartDrawer } from "../components/CartDrawer.js";

/**
 * Global error handling — catches errors that happen OUTSIDE any try/catch,
 * such as a bug in a render function or a rejected promise nobody awaited.
 * Real production apps wire this to an error-reporting service (Sentry, etc.);
 * here it degrades gracefully with a toast instead of a silent white screen.
 */
function installGlobalErrorHandling() {
  window.addEventListener("error", (event) => {
    console.error("[global error]", event.error ?? event.message);
    showToast("Something went wrong. Please try again.");
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("[unhandled promise rejection]", event.reason);
    showToast("Something went wrong. Please try again.");
  });
}

function init() {
  installGlobalErrorHandling();

  mountHeader(document.getElementById("header"));
  mountFooter(document.getElementById("footer"));
  mountToast();
  mountCartDrawer();

  initRouter(document.getElementById("app"));
}

document.addEventListener("DOMContentLoaded", init);
