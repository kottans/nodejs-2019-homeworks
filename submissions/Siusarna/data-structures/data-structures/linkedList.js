/* eslint-disable no-underscore-dangle */

const Node = require('./Element.js');

module.exports = class LinkedList {
  constructor() {
    this._head = null;
    this._size = 0;
  }

  insert(inputValue, successor = null) {
    if (this._head === null) {
      this._head = new Node(inputValue);
      this._size += 1;
    } else {
      let iteratorNode = this._head;
      while (iteratorNode.getNext() && iteratorNode.getValue() !== successor) {
        iteratorNode = iteratorNode.getNext();
      }
      if (successor && iteratorNode.getValue() !== successor) {
        throw new Error('not found successor');
      }
      const prevForInsertedNode = iteratorNode;
      const currentNode = new Node(inputValue, prevForInsertedNode.getNext());
      prevForInsertedNode.setNext(currentNode);
      this._size += 1;
    }
  }

  remove(inputValue) {
    if (this._head.getValue() === inputValue) {
      this._head = this._head.getNext();
      this._size -= 1;
    } else {
      let iteratorNode = this._head;
      while (
        iteratorNode.getNext() &&
        iteratorNode.getNext().getValue() !== inputValue
      ) {
        iteratorNode = iteratorNode.getNext();
      }
      if (iteratorNode.getNext()) {
        const prevForRemovedNode = iteratorNode;
        const nextForRemovedNode = prevForRemovedNode.getNext().getNext();
        prevForRemovedNode.setNext(nextForRemovedNode);
        this._size -= 1;
      } else {
        throw new Error('not found this value');
      }
    }
  }

  show() {
    let iteratorNode = this._head;
    const allValueInList = [];
    if (this._head) {
      while (iteratorNode.getNext()) {
        allValueInList.push(iteratorNode.getValue());
        iteratorNode = iteratorNode.getNext();
      }
      const lastNode = iteratorNode;
      allValueInList.push(lastNode.getValue());
    }
    return allValueInList.reverse();
  }
};
