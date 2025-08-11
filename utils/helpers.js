/**
 * Validates an email string format (simple regex).
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Formats a Date object or ISO string to 'YYYY-MM-DD HH:mm' (local time).
 * @param {Date|string|null} date
 * @returns {string|null}
 */
function formatDateTime(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null; // invalid date
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Safely parse JSON, returning default if invalid
 * @param {string} jsonString
 * @param {any} defaultValue
 * @returns {any}
 */
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}

/**
 * Checks if a value is null, undefined, empty string, empty array, or empty object
 * @param {any} value
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (
    typeof value === 'object' &&
    !Array.isArray(value) &&
    value !== null &&
    Object.keys(value).length === 0
  ) {
    return true;
  }
  return false;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} str
 * @returns {string}
 */
function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  isValidEmail,
  formatDateTime,
  safeJSONParse,
  isEmpty,
  capitalizeFirstLetter,
};
