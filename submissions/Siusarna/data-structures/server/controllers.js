function isJSON(req) {
  return req.headers['content-type'] === 'application/json';
}

function showList(res, list) {
  const allNodeFromList = list.show();
  const jsonObjWithAllNode = JSON.stringify({ data: allNodeFromList });
  const result = {
    status: 'success',
    data: jsonObjWithAllNode
  };
  return result;
}

function deleteElementsFromStack(res, stack) {
  const removedValue = stack.pop();
  const jsonObjWithRemovedValue = JSON.stringify({ data: removedValue });
  const result = {
    status: 'success',
    data: jsonObjWithRemovedValue
  };
  return result;
}

function isValidData(inputData) {
  return typeof inputData === 'number' || typeof inputData === 'string';
}

function sendWrongTypeOfContentResponse() {
  const result = {
    status: 'error',
    data: 'wrong type of content'
  };
  return result;
}

function insertInList(res, list, inputData) {
  const { data, successor } = inputData;
  if (!isValidData(data)) {
    throw new Error('wrong type of input value');
  }
  if (successor && isValidData(successor)) {
    try {
      list.insert(data, successor);
    } catch (err) {
      throw new Error(err.message);
    }
  } else if (!successor) {
    list.insert(data);
  } else {
    throw new Error('wrong type of input value');
  }
}

function processOfInsertInList(res, list, inputData) {
  const result = {};
  try {
    insertInList(res, list, inputData);
    result.status = 'success';
  } catch (err) {
    result.status = 'error';
    result.data = err.message;
  }
  return result;
}

function removeFromList(res, list, inputData) {
  const result = {};
  try {
    list.remove(inputData.data);
    result.status = 'success';
  } catch (err) {
    result.status = 'error';
    result.data = err.message;
  }
  return result;
}

function pushOnStack(res, stack, inputData) {
  stack.push(inputData.data);
  const result = {
    status: 'success'
  };
  return result;
}

function notFound() {
  const result = {
    status: 'error',
    data: 'Url not found'
  };
  return result;
}

function makeStackResponse(method, stack, inputData, res) {
  let result;
  if (method === 'DELETE') {
    result = deleteElementsFromStack(res, stack);
  } else if (method === 'POST') {
    result = pushOnStack(res, stack, inputData);
  }
  return result;
}

function makeListResponse(method, list, inputData, res) {
  let result;
  if (method === 'GET') {
    result = showList(res, list);
  } else if (method === 'POST') {
    result = processOfInsertInList(res, list, inputData);
  } else if (method === 'DELETE') {
    result = removeFromList(res, list, inputData);
  }
  return result;
}

function responseMakers(typeOfStructures, method, inputData, res, list, stack) {
  let result;
  if (typeOfStructures === 'list') {
    result = makeListResponse(method, list, inputData, res);
  } else if (typeOfStructures === 'stack') {
    result = makeStackResponse(method, stack, inputData, res);
  } else {
    result = notFound();
  }
  return result;
}

async function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
  });
}

module.exports = (list, stack) => {
  return function controller(req, res) {
    const typeOfStructeres = req.url.substr(1);
    return new Promise(resolve => {
      if (!isJSON(req)) {
        resolve(sendWrongTypeOfContentResponse(res));
      } else {
        readBody(req).then(completeBody => {
          const inputData = JSON.parse(completeBody);
          const result = responseMakers(
            typeOfStructeres,
            req.method,
            inputData,
            res,
            list,
            stack
          );
          resolve(result);
        });
      }
    });
  };
};
