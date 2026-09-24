/**
 * Validation helpers used across auth + checkout forms.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{10,15}$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value).trim());
}

export function isValidPhone(value) {
  return PHONE_RE.test(String(value).replace(/[\s()-]/g, ""));
}

/**
 * Luhn algorithm — the actual checksum real card forms use to catch typos
 * before ever hitting a payment processor.
 */
export function isValidCardNumber(cardNumber) {
  const digits = String(cardNumber).replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function isValidExpiry(mmYY) {
  const match = /^(\d{2})\/(\d{2})$/.exec(mmYY);
  if (!match) return false;
  const [, mm, yy] = match;
  const month = Number(mm);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiry = new Date(2000 + Number(yy), month, 0); // last day of expiry month
  return expiry >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export function isValidCVV(value) {
  return /^\d{3,4}$/.test(String(value));
}

/**
 * Returns a 0-4 password strength score plus a human label.
 * Demonstrates: array-of-predicates scoring instead of nested if/else.
 */
export function passwordStrength(password = "") {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

export function isRequired(value) {
  return String(value ?? "").trim().length > 0;
}
