/*
  MultiAvatar.js
  Generates a random Avatar image using MultiAvatar
*/
import multiavatar from "@multiavatar/multiavatar";

import { generateRandomHexString } from "./constants.js";
export default class MultiAvatar {
  /*constructor(options) {}*/

  generate() {
    // Avatar.js expects a Promise
    try {
      return new Promise((resolve) => {
        /** TBD handle reject */
        const randomString = generateRandomHexString(10);
        resolve(multiavatar(randomString));
      });
    } catch (err) {
      return Promise.reject(`Error: ${err.message}`);
    }
  }
}
