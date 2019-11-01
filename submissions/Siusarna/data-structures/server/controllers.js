function isJSON(req) {
  return req.headers['content-type'] === 'application/json';
}

function showList(res, list) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ data: list.show() }));
}

function deleteElementsFromStack(res, stack) {
  try {
    const removedValue = stack.pop();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ data: removedValue }));
  } catch (err) {
    res.writeHead(400, err.message);
    res.end();
  }
}

function isValidData(inputData) {
  return typeof inputData === 'number' || typeof inputData === 'string';
}

function wrongTypeOfValue(res) {
  res.writeHead(400, 'wrong type of input value');
  res.end();
}

function wrongTypeOfContent(res) {
  res.writeHead(400, 'wrong type of content');
  res.end();
}

function insertInList(res, list, inputData) {
  if (isValidData(inputData.data)) {
    if (inputData.successor && isValidData(inputData.successor)) {
      try {
        list.insert(inputData.data, inputData.successor);
        res.writeHead(200);
      } catch (err) {
        res.writeHead(400, err.message);
      }
    } else if (!inputData.successor) {
      try {
        list.insert(inputData.data);
        res.writeHead(200);
      } catch (err) {
        res.writeHead(400, err.message);
      }
    } else {
      wrongTypeOfValue(res);
    }
  } else {
    wrongTypeOfValue(res);
  }
  res.end();
}

function removeFromList(res, list, inputData) {
  try {
    list.remove(inputData.data);
    res.writeHead(200);
  } catch (err) {
    res.writeHead(400, err.message);
  }
  res.end();
}

function pushOnStack(res, stack, inputData) {
  stack.push(inputData.data);
  res.writeHead(200);
  res.end();
}

function notFound(response) {
  response.writeHead(404, 'Url not found');
  response.end();
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
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          const inputData = JSON.parse(body);
          if (typeOfStructers === 'list') {
            if (req.method === 'POST') insertInList(res, list, inputData);
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
