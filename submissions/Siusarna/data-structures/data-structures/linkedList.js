/* eslint-disable no-underscore-dangle */

const Node = require('./Element.js');

function getSuccessorNode (prevNode, successor) {
  let successorNode = prevNode;
  if (!successor) {
    return successorNode;
  }
  // successor value saved in prevNode or prevNode._next() so we check these node
  if (prevNode.getValue() === successor) {
    successorNode = prevNode;
  } else if (prevNode.getNext()) {
    successorNode = prevNode.getNext();
  } else {
    throw new Error('not found this successor');
  }
  return successorNode;
}

module.exports = class LinkedList {
  constructor () {
    this._head = null;
    this._size = 0;
  }

  searchForPrevNode (inputValue) {
    let iteratorNode = this._head;
    while (
      iteratorNode.getNext() &&
      iteratorNode.getNext().getValue() !== inputValue
    ) {
      iteratorNode = iteratorNode.getNext();
    }
    return iteratorNode;
  }

  insert (inputValue, successor = null) {
    if (this._head === null) {
      this._head = new Node(inputValue);
    } else {
      const prevNode = this.searchForPrevNode(successor);
      const successorNode = getSuccessorNode(prevNode, successor);
      const currentNode = new Node(inputValue, successorNode.getNext());
      successorNode.setNext(currentNode);
    }
    this._size += 1;
  }

  remove (inputValue) {
    if (this._head.getValue() === inputValue) {
      this._head = this._head.getNext();
    } else {
      const prevNodeForInputValue = this.searchForPrevNode(inputValue);
      if (!prevNodeForInputValue.getNext()) {
        throw new Error('not found this value');
      }
      const nextForRemovedNode = prevNodeForInputValue.getNext().getNext();
      prevNodeForInputValue.setNext(nextForRemovedNode);
    }
    this._size -= 1;
  }

  show () {
    let iteratorNode = this._head;
    const allValueInList = [];
    if (this._head) {
      while (iteratorNode) {
        allValueInList.push(iteratorNode.getValue());
        iteratorNode = iteratorNode.getNext();
      }
    }
    return allValueInList.reverse();
  }
};
