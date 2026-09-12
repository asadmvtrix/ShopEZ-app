const BRANDS = [
  { id: "visa", label: "Visa", pattern: /^4/, length: 16, cvvLength: 3 },
  { id: "mastercard", label: "Mastercard", pattern: /^(5[1-5]|2[2-7])/, length: 16, cvvLength: 3 },
  { id: "amex", label: "American Express", pattern: /^3[47]/, length: 15, cvvLength: 4 },
  { id: "discover", label: "Discover", pattern: /^6(011|5)/, length: 16, cvvLength: 3 },
];

const UNKNOWN_BRAND = { id: "unknown", label: "Card", length: 16, cvvLength: 3 };

export const ACCEPTED_BRAND_IDS = BRANDS.map((brand) => brand.id);

export function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export function detectBrand(cardNumber) {
  const digits = digitsOnly(cardNumber);
  return BRANDS.find((brand) => brand.pattern.test(digits)) ?? UNKNOWN_BRAND;
}

export function formatCardNumber(value) {
  const digits = digitsOnly(value);
  const brand = detectBrand(digits);
  const trimmed = digits.slice(0, brand.length);


  const groups = brand.id === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const parts = [];
  let cursor = 0;
  for (const size of groups) {
    if (cursor >= trimmed.length) break;
    parts.push(trimmed.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join(" ");
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function passesLuhn(cardNumber) {
  const digits = digitsOnly(cardNumber);
  if (digits.length < 12) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isExpiryInPast(expiry, now = new Date()) {
  const [month, year] = expiry.split("/").map(Number);
  if (!month || month < 1 || month > 12) return true;

  const expiresAt = new Date(2000 + year, month, 1);
  return expiresAt <= now;
}

export function validateCard({ name, number, expiry, cvv }) {
  const brand = detectBrand(number);
  const digits = digitsOnly(number);

  if (!name.trim()) {
    return { field: "name", message: "Enter the cardholder name as printed on the card." };
  }
  if (digits.length !== brand.length) {
    return { field: "number", message: `Enter the ${brand.length} digits of your card number.` };
  }
  if (!passesLuhn(digits)) {
    return { field: "number", message: "That card number is not valid. Check for typos." };
  }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { field: "expiry", message: "Use MM/YY format, for example 04/29." };
  }
  if (isExpiryInPast(expiry)) {
    return { field: "expiry", message: "This card has expired." };
  }
  if (cvv.length !== brand.cvvLength) {
    return { field: "cvv", message: `The security code is ${brand.cvvLength} digits for ${brand.label}.` };
  }
  return null;
}
