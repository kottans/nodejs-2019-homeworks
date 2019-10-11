/* eslint-disable default-case */
/* eslint-disable no-return-assign */
/* eslint-disable func-names */

function isValidType(value) {
  return typeof value === 'string' || typeof value === 'number';
}

function isJson(request) {
  return request.headers['content-type'] === 'application/json';
}

module.exports.dataHandler = (stack, list) => {
  return function(request, response) {
    const structureType = request.url.split('/')[1];
    if (request.method === 'GET') {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ data: list.showList() }));
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
                  stack.push(data.data);
                  response.writeHead(200);
                  response.end();
                }
                break;
              case 'list':
                switch (request.method) {
                  case 'POST':
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
                    break;
                  case 'DELETE':
                    try {
                      list.remove(data.data);
                      response.writeHead(200);
                    } catch (err) {
                      response.writeHead(400, err.message);
                    }
                }
                response.end();
                break;
              default:
                response.writeHead(404, 'Url not found');
                response.end();
                break;
            }
          } else {
            response.writeHead(400, 'Wrong data type');
            response.end();
          }
        });
      } else if (structureType === 'stack' && request.method === 'DELETE') {
        response.writeHead(200);
        response.end(JSON.stringify({ data: stack.pop() }), {
          'Content-Type': 'application/json'
        });
      } else {
        response.writeHead(400, 'Wrong content type');
        response.end();
      }
    }
  };
};
