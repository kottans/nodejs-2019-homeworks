const http = require('http');

const fs = require('fs');

const port = process.env.PORT || 3210;

const page404 = {
  path: 'pages/404.html',
  type: { 'Content-Type': 'text/html' },
  responseCode: 404
};

const OK = 200;

const action = {
  type: { 'Content-Type': 'text/html' },
  responseCode: OK
};

const contentType = {
  '/': {
    path: 'pages/index.html',
    type: { 'Content-Type': 'text/html' },
    responseCode: OK
  },
  '/css/theme.css': {
    path: 'css/theme.css',
    type: { 'Content-Type': 'text/css' },
    responseCode: OK
  },
  '/img/binoculars.jpg': {
    path: 'img/binoculars.jpg',
    type: { 'Content-Type': 'image/jpeg' },
    responseCode: OK
  }
};

const makeHTML = data => {
  return `<html><head>
                    <link rel="stylesheet" type="text/css" href="css/theme.css">
                    </head>
                    <body><h1>Your data structure:</h1>
                    <p class="answer">${data}</p>
                    <a href='/'>return</a>
            </body></html>`;
};

const parse = body => {
  const json = {};
  body
    .toString()
    .split('&')
    .map(item => {
      const key = item.split('=')[0];
      const value = item.split('=')[1];
      json[key] = value;
      return item;
    });
  return json;
};

const list = {};

list.data = {};

list.push = data => {
  list.data = {
    item: data,
    next: list.data
  };
};

list.pop = () => {
  const itemValue = list.data.item ? list.data.item : undefined;
  if (list.data) list.data = list.data.next;
  return itemValue;
};

list.print = msg => {
  let listData = list.data;
  let str = `\nThe ${msg}:\n`;
  while (listData && listData.item) {
    str += `${listData.item} -> `;
    listData = listData.next;
  }
  return str;
};

list.remove = item => {
  let listData = list.data;
  let next;
  if (listData.next) next = listData.next;
  if (listData.item === item) list.data = listData.next;
  else {
    while (next && next.item !== item) {
      next = next.next;
      listData = listData.next;
    }
    if (next && next.item === item) listData.next = next.next;
  }
};

http
  .createServer((req, res) => {
    const body = [];
    req
      .on('data', chunk => body.push(chunk))
      .on('end', () => {
        let str = '';
        const json = parse(body);
        if (json.type) {
          str += `\nbefore: ${list.print(json.type)} <br> \nafter:`;
        }
        if (json.action === 'push') list.push(json.item);
        if (json.type === 'list' && json.action === 'pop') {
          list.remove(json.item);
        }
        if (json.type === 'stack' && json.action === 'pop') {
          str += `\n${list.pop()} was poped`;
        }
        if (json.type) str += list.print(json.type);
        if (str) {
          process.stdout.write(str);
          res.writeHead(action.responseCode, action.type);
          res.end(makeHTML(str));
        }
      });
    const { responseCode, type, path } = contentType[req.url] || page404;
    res.writeHead(responseCode, type);
    fs.createReadStream(path).pipe(res);
  })
  .listen(port);
