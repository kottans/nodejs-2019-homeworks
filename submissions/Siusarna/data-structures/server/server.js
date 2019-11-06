const http = require('http');
const controllers = require('./controllers.js');
const responseSender = require('./httpResponce.js');

module.exports = (list, stack) => {
  http
    .createServer((req, res) => {
      const promiseWithResult = controllers(list, stack)(req, res);
      promiseWithResult.then(objWithStatusAndData => {
        if (objWithStatusAndData.status === 'error') {
          responseSender.error(res, objWithStatusAndData.data);
        } else {
          responseSender.success(res, objWithStatusAndData.data);
        }
      });
    })
    .listen(3000);
};
