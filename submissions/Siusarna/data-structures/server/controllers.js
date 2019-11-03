const responseSender = require('./httpResponce.js');

function isJSON(req) {
  return req.headers['content-type'] === 'application/json';
}

function showList(res, list) {
  const allNodeFromList = list.show();
  const jsonObjWithAllNode = JSON.stringify({ data: allNodeFromList });
  responseSender.success(res, jsonObjWithAllNode);
}

function deleteElementsFromStack(res, stack) {
  try {
    const removedValue = stack.pop();
    const jsonObjWithRemovedValue = JSON.stringify({ data: removedValue });
    responseSender.success(res, jsonObjWithRemovedValue);
  } catch (err) {
    responseSender.error(res, err.message);
  }
}

function isValidData(inputData) {
  return typeof inputData === 'number' || typeof inputData === 'string';
}

function wrongTypeOfValue(res) {
  responseSender.error(res, 'wrong type of input value');
}

function wrongTypeOfContent(res) {
  responseSender.error(res, 'wrong type of content');
}

function insertInList(res, list, inputData) {
  if (!isValidData(inputData.data)) {
    wrongTypeOfValue(res);
    return;
  }
  if (inputData.successor && isValidData(inputData.successor)) {
    try {
      list.insert(inputData.data, inputData.successor);
    } catch (err) {
      throw new Error(err.message);
    }
  } else if (!inputData.successor) {
    list.insert(inputData.data);
  } else {
    wrongTypeOfValue(res);
  }
}

function processOfInsertInList(res, list, inputData) {
  try {
    insertInList(res, list, inputData);
    responseSender.success(res);
  } catch (err) {
    responseSender.error(err.message);
  }
}

function removeFromList(res, list, inputData) {
  try {
    list.remove(inputData.data);
    responseSender.success(res);
  } catch (err) {
    responseSender.error(res, err.message);
  }
  res.end();
}

function pushOnStack(res, stack, inputData) {
  stack.push(inputData.data);
  responseSender.success(res);
}

function notFound(res) {
  responseSender.error(res, 'Url not found');
}

function readBody(req, cb) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    cb(body);
  });
}

module.exports = (list, stack) => {
  return function controller(req, res) {
    const typeOfStructers = req.url.substr(1);
    if (typeOfStructers === 'list' && req.method === 'GET') {
      showList(res, list);
    } else if (typeOfStructers === 'stack' && req.method === 'DELETE') {
      deleteElementsFromStack(res, stack);
    } else if (req.method === 'POST' || req.method === 'DELETE') {
      if (isJSON(req)) {
        readBody(req, completeBody => {
          const inputData = JSON.parse(completeBody);
          if (typeOfStructers === 'list') {
            if (req.method === 'POST') {
              processOfInsertInList(res, list, inputData);
            }
            if (req.method === 'DELETE') removeFromList(res, list, inputData);
          } else if (typeOfStructers === 'stack') {
            if (req.method === 'POST') pushOnStack(res, stack, inputData);
          } else {
            notFound(res);
          }
        });
      } else {
        wrongTypeOfContent(res);
      }
    }
  };
};
