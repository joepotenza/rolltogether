/*
    DiceBearAvatar.js
    Generates a random Avatar image using DiceBear
*/
import {
  generateRandomHexColor,
  generateRandomHexString,
} from "./constants.js";
export default class DiceBearAvatar {
  constructor(options) {
    this._options = options;
  }
  generate() {
    const randomString = generateRandomHexString(10);
    const bgcolor = generateRandomHexColor();
    try {
      return fetch(
        `https://api.dicebear.com/9.x/adventurer/svg?seed=${randomString}&radius=50&backgroundColor=${bgcolor}&translateY=5`,
      ).then((res) => res.text());
    } catch (err) {
      return Promise.reject(`Error: ${err.message}`);
    }
  }
}
