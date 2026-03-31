/*
  constants.js
*/

// Name of the token to use for local storage
const TOKEN_KEY = "jwt";

// TinyMCE API Key
const TINYMCE_API_KEY = "1q6gypqshnpwk2s1lwqq8xlbjkc6ddmwrggybi21da8a7sp2";

/**
 * Generates a random hexadecimal string of a specified length.
 * @param {number} length The length of the desired hex string.
 * @returns {string} The random hex string.
 */
function generateRandomHexString(length) {
  let result = "";
  while (result.length < length) {
    // Generate a random number between 0 and 15, convert to hex, and append.
    result += Math.floor(Math.random() * 16).toString(16);
  }
  // Return the string sliced to the exact length requested.
  return result.slice(0, length);
}
function generateRandomHexColor() {
  // Generate a random number between 0 and 16777215 (FFFFFF in decimal)
  const randomNumber = Math.floor(Math.random() * 16777215);

  // Convert the number to a hexadecimal string
  let hexColor = randomNumber.toString(16);

  // Pad the string with leading zeros if it's less than 6 characters long
  hexColor = hexColor.padStart(6, "0");

  return hexColor;
}

export {
  TOKEN_KEY,
  TINYMCE_API_KEY,
  generateRandomHexString,
  generateRandomHexColor,
};
