/* eslint-disable no-underscore-dangle */

module.exports = class Node {
  constructor (value, next = null) {
    this._value = value;
    this._next = next;
  }

  getValue () {
    return this._value;
  }

  setValue (newValue) {
    this._value = newValue;
  }

  getNext () {
    return this._next;
  }

  setNext (newNext) {
    this._next = newNext;
  }
};
