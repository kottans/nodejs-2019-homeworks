/* eslint-disable no-underscore-dangle */
const http = require('http');
const { dataHandler } = require('./handler');

module.exports.Server = class Server {
  constructor(stack, list) {
    this._stack = stack;
    this._list = list;
    this._server = http.createServer(dataHandler(this._stack, this._list));
  }

  run(port = 8000, host = 'localhost') {
    this._server.listen(port, host);
  }
};
