/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
const { Node } = require('./node');

module.exports.Stack = class Stack {
  constructor() {
    this._root = null;
    this._length = 0;
  }

  push(value) {
    this._root = new Node(value, this._root);
    this._length++;
  }

  pop() {
    let out = null;
    if (this._length) {
      out = this._root.value;
      this._root = (this._root || {}).next;
      this._length--;
    }
    return out;
  }

  get length() {
    return this._length;
  }
};
