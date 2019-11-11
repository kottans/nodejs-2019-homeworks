const server = require('./server/server.js');
const LinkedList = require('./data-structures/linkedList.js');
const Stack = require('./data-structures/stack.js');

server(new LinkedList(), new Stack());
