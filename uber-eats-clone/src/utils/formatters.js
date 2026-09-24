/**
 * Formatting helpers — leans on the built-in Intl APIs rather than hand-rolled
 * string math, which is what real production code does for currency/dates.
 */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(cents) {
  return currencyFormatter.format(cents / 100);
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** e.g. "3 minutes ago", "in 2 hours" */
export function formatRelativeTime(date) {
  const diffMs = new Date(date).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) return relativeTimeFormatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeTimeFormatter.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return relativeTimeFormatter.format(diffDays, "day");
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(date) {
  return dateFormatter.format(new Date(date));
}

/** Masks a card number for display: •••• 4242 */
export function maskCardNumber(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, "");
  return `\u2022\u2022\u2022\u2022 ${digits.slice(-4)}`;
}

/** Auto-inserts spaces every 4 digits as the user types a card number. */
export function formatCardNumberInput(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
