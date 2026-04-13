/*
  constants.js
*/
import { formatRelative, parseISO } from "date-fns";

import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Name of the token to use for local storage
const TOKEN_KEY = "jwt";

// TinyMCE API Key
const TINYMCE_API_KEY = "1q6gypqshnpwk2s1lwqq8xlbjkc6ddmwrggybi21da8a7sp2";

// Generates a random hexadecimal string of a specified length.
function generateRandomHexString(length) {
  let result = "";
  while (result.length < length) {
    // Generate a random number between 0 and 15, convert to hex, and append.
    result += Math.floor(Math.random() * 16).toString(16);
  }
  // Return the string sliced to the exact length requested.
  return result.slice(0, length);
}

// Generates a random hexadecimal color string
function generateRandomHexColor() {
  // Generate a random number between 0 and 16777215 (FFFFFF in decimal)
  const randomNumber = Math.floor(Math.random() * 16777215);

  // Convert the number to a hexadecimal string
  let hexColor = randomNumber.toString(16);

  // Pad the string with leading zeros if it's less than 6 characters long
  hexColor = hexColor.padStart(6, "0");

  return hexColor;
}

// Nicer date formatting (e.g. "22 hours ago")
function prettyDateFormat(dt) {
  const rtf = new Intl.RelativeTimeFormat(undefined, {
    numeric: "auto",
  });

  const diff = (Date.now() - new Date(dt)) / 1000;

  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  return rtf.format(-Math.floor(diff / 86400), "day");
}

// Nicer date formating for Scheduling (e.g "today at 7:00 PM" or "tomorrow at 11:00 PM")
function friendlyDate(isoString) {
  const date = parseISO(isoString);
  let relativeDate = formatRelative(date, new Date());
  relativeDate =
    relativeDate.substring(0, 1).toUpperCase() + relativeDate.substring(1);
  return relativeDate;
}

function hasBadWords(str) {
  return matcher.hasMatch(str);
}

export {
  TOKEN_KEY,
  TINYMCE_API_KEY,
  generateRandomHexString,
  generateRandomHexColor,
  prettyDateFormat,
  friendlyDate,
  hasBadWords,
};
