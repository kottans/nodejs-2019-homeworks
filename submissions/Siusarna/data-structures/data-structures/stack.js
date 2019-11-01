/* eslint-disable no-underscore-dangle */

const Node = require('./Element.js');

module.exports = class Stack {
  constructor() {
    this._head = null;
    this._size = 0;
  }

  push(inputValue) {
    this._head = new Node(inputValue, this._head);
    this._size += 1;
  }

  pop() {
    if (this._size) {
      const removedValue = this._head.getValue();
      this._head = this._head.getNext() || null;
      this._size -= 1;
      return removedValue;
    }
    throw new Error('Stack is empty');
  }

  getSize() {
    return this._size;
  }
};
