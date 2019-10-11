const { Server } = require('./server/server');
const { LinkedList } = require('./data_structures/linkedList');
const { Stack } = require('./data_structures/stack');

new Server(new Stack(), new LinkedList()).run();
