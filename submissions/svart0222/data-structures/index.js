const http = require('http');
const fs = require('fs');
const Stack = require('./structures/Stack');
const LikedList = require('./structures/LinkedList');

const stack = new Stack();
const linkedList = new LikedList();

const server = http.createServer(function create (req, res) {
  if (req.url === '/') {
    fs.readFile(`${__dirname}/index.html`, (err, data) => {
      if (err) throw err;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data);
      res.end();
    });
  }

  if (req.url === '/list') {
    let jsonString = '';
    let answer;

    req.on('data', data => {
      jsonString += data;
    });

    req.on('end', () => {
      const data = JSON.parse(jsonString);
      if (!data) {
        answer = 'You can send only this type of data: string, number!';
      }
      switch (data.action) {
        case 'insert': {
          const result = linkedList.addNode(data.value);
          if (res.prev) {
            answer = `Insert ${result.current} before ${result.prev}`;
          } else {
            answer = `Insert ${result.current}`;
          }
          break;
        }
        case 'show': {
          const result = linkedList.showNodes();
          if (result) {
            answer = `Show all: ${result.join(' - ')} will be returned`;
          } else {
            answer = "Couldn't find any items in the list";
          }
          break;
        }
        default: {
          const result = linkedList.removeNode(data.value);
          if (result) {
            answer = `Remove ${result}`;
          } else {
            answer = "Couldn't find any items with this value";
          }
        }
      }

      res.end(answer);
    });
  }

  if (req.url === '/stack') {
    let jsonString = '';
    let answer;

    req.on('data', data => {
      jsonString += data;
    });

    req.on('end', () => {
      const data = JSON.parse(jsonString);
      if (!data) {
        answer = 'You can send only this type of data: string, number!';
      }
      if (data.action === 'push') {
        stack.push(data.value);
        answer = `Push ${data.value}`;
      }
      if (data.action === 'pop') {
        if (stack.items.length) {
          answer = `Pop item: ${stack.items.pop()} will be returned`;
        }
        if (!stack.items.length) {
          answer = 'Sorry, but all items were returned';
        }
      }

      res.end(answer);
    });
  }
});

server.listen(3030);
