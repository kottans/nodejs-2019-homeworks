/* eslint-disable no-underscore-dangle */
module.exports.Node = class Node {
  constructor(value, next) {
    this._value = value;
    this._next = next;
  }

  get value() {
    return this._value;
  }

  set value(value) {
    this._value = value;
  }

  get next() {
    return this._next;
  }

  set next(next) {
    this._next = next;
  }
};
