class LinkedList {
  constructor() {
    this.head = null;
  }

  addNode(value) {
    const node = {
      next: this.head,
      value
    };
    let prev = null;
    if (this.head) {
      prev = this.head.value;
    }
    this.head = node;

    return {
      prev,
      current: value
    };
  }

  removeNode(value) {
    let current = this.head;
    let prev = null;

    while (current !== null) {
      if (current.value === value) {
        if (prev === null) {
          this.head = current.next;
        } else {
          prev.next = current.next;
        }
        return current.value;
      }
      prev = current;
      current = current.next;
    }

    return null;
  }

  showNode(obj) {
    if (!obj) {
      return null;
    }
    let result = [];
    if (obj.value) {
      result.push(obj.value);
    }
    if (obj.next) {
      const newResult = this.showNode(obj.next);
      result = result.concat(newResult);
    }

    return result;
  }

  showNodes() {
    const result = this.showNode(this.head);
    return result;
  }
}

module.exports = LinkedList;
