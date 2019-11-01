const http = require('http');
const controllers = require('./controllers.js');

module.exports = (list, stack) => {
  http.createServer(controllers(list, stack)).listen(3000);
};
