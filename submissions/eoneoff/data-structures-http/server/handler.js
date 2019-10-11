/* eslint-disable default-case */
/* eslint-disable no-return-assign */
/* eslint-disable func-names */

function isValidType(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function isJson(request) {
  return request.headers['content-type'] === 'application/json';
}

function postStack(response, stack, data) {
  stack.push(data.data);
  response.writeHead(200);
  response.end();
}

function deleteStack(response, stack) {
  response.writeHead(200);
  response.end(JSON.stringify({ data: stack.pop() }), {
    'Content-Type': 'application/json'
  });
}

function getList(response, list) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ data: list.showList() }));
}

function postList(response, list, data) {
  if (!data.successor || isValidType(data.successor)) {
    try {
      list.insert(data.data, data.successor);
      response.writeHead(200);
    } catch (err) {
      response.writeHead(400, err.message);
    }
  } else {
    response.writeHead(400, 'Wrong data type');
  }
  response.end();
}

function deleteList(response, list, data) {
  try {
    list.remove(data.data);
    response.writeHead(200);
  } catch (err) {
    response.writeHead(400, err.message);
  } finally {
    response.end();
  }
}

function notFound(response) {
  response.writeHead(404, 'Url not found');
  response.end();
}

function wrongDataType(response) {
  response.writeHead(400, 'Wrong data type');
  response.end();
}

function wrongContentType(response) {
  response.writeHead(400, 'Wrong content type');
  response.end();
}

module.exports.dataHandler = (stack, list) => {
  return function(request, response) {
    const structureType = request.url.split('/')[1];
    if (request.method === 'GET' && structureType === 'list') {
      getList(response, list);
    } else if (request.method === 'POST' || request.method === 'DELETE') {
      if (isJson(request)) {
        let body = '';
        request.on('data', chunk => (body += chunk.toString()));
        request.on('end', () => {
          const data = JSON.parse(body);
          if (isValidType(data.data)) {
            switch (structureType) {
              case 'stack':
                if (request.method === 'POST') {
                  postStack(response, stack, data);
                }
                break;
              case 'list':
                switch (request.method) {
                  case 'POST':
                    postList(response, list, data);
                    break;
                  case 'DELETE':
                    deleteList(response, list, data);
                    break;
                }
                break;
              default:
                notFound(response);
                break;
            }
          } else {
            wrongDataType(response);
          }
        });
      } else if (structureType === 'stack' && request.method === 'DELETE') {
        deleteStack(response, stack);
      } else {
        wrongContentType(response);
      }
    }
  };
};
