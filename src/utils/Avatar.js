/*
    Avatar.js
    Avatar creation abstraction class
    Supports: DiceBear, MultiAvatar
*/

import DiceBearAvatar from "./DiceBearAvatar.js";
import MultiAvatar from "./MultiAvatar.js";

export default class Avatar {
  constructor({
    type = "MultiAvatar",
    defaultValue = null,
    target = "",
    limit = 10,
    onSuccess = null,
    onError = null,
    options = {},
  }) {
    this._target = target;
    this._options = options;
    this._history = [];
    this._limit = limit;
    this._index = -1;
    this._onSuccess = onSuccess;
    this._onError = onError;
    this._defaultValue = defaultValue;
    this._generators = {
      DiceBear: new DiceBearAvatar(this._options),
      MultiAvatar: new MultiAvatar(this._options),
    };
    this._generator = null;
    this.setType(type);
  }
  _handleSuccess(avatar) {
    if (typeof this._onSuccess === "function") {
      this._onSuccess(avatar);
    }
  }
  _handleError(err) {
    if (typeof this._onError === "function") {
      this._onError(err);
    }
  }
  _add(avatar) {
    this._history.push(avatar);
    this._index = this._history.length - 1;
    this.display();
    //clear history if too long
    if (this._history.length > 10) {
      this._history.shift();
      this._index--;
    }
  }
  generate() {
    if (!this._generator) {
      return this._handleError(new Error("No Avatar Generator Available"));
    }
    if (this._history.length === 0 && this._defaultValue) {
      // on first run, display and store default value if it exists
      this._add(this._defaultValue);
    } else {
      this._generator
        .generate()
        .then((avatar) => {
          this._add(avatar);
        })
        .catch((err) => {
          this._handleError(err);
        });
    }
  }
  display() {
    if (this._index > -1 && this._history.length) {
      const avatar = this._history[this._index];
      if (this._target) {
        const tgt = document.getElementById(this._target);
        if (tgt) tgt.innerHTML = avatar;
      }
      this._handleSuccess(avatar);
    }
  }
  prev() {
    this._index = this._index <= 0 ? this._index : this._index - 1;
    this.display();
  }
  next() {
    this._index =
      this._index >= this._history.length - 1 ? this._index : this._index + 1;
    this.display();
  }
  setType(type) {
    this._type = type;
    this._generator =
      type === "DiceBear"
        ? this._generators["DiceBear"]
        : this._generators["MultiAvatar"];
  }
  getCurrentPosition() {
    return this._index;
  }
  getHistoryLength() {
    return this._history.length;
  }
  resetToDefault() {
    if (this._defaultValue) {
      this._history = [];
      this._index = -1;
      this.generate();
    }
  }
}
