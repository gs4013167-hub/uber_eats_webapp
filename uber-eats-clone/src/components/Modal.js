const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Generic modal shell with a real focus trap — Tab/Shift+Tab cycle only
 * within the modal while it's open, and focus returns to whatever triggered
 * it on close. This is the accessibility requirement most tutorial modals
 * skip entirely.
 *
 * @param {Object} options
 * @param {HTMLElement} options.content - the modal's inner content node
 * @param {Function} [options.onClose] - called after the modal is removed
 * @returns {Function} close - call to programmatically close the modal
 */
export function openModal({ content, onClose, labelledBy }) {
  const previouslyFocused = document.activeElement;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const dialog = document.createElement("div");
  dialog.className = "modal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  if (labelledBy) dialog.setAttribute("aria-labelledby", labelledBy);
  dialog.appendChild(content);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  function getFocusable() {
    return Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR));
  }

  function trapFocus(e) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = getFocusable();
    if (!focusable.length) return;
    const [first, last] = [focusable[0], focusable[focusable.length - 1]];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleOverlayClick(e) {
    if (e.target === overlay) close();
  }

  function close() {
    document.removeEventListener("keydown", trapFocus);
    overlay.removeEventListener("click", handleOverlayClick);
    overlay.remove();
    document.body.style.overflow = "";
    previouslyFocused?.focus?.();
    onClose?.();
  }

  document.addEventListener("keydown", trapFocus);
  overlay.addEventListener("click", handleOverlayClick);

  // Focus the first focusable element once the modal is in the DOM.
  requestAnimationFrame(() => getFocusable()[0]?.focus());

  return close;
}
