const http = require('http');

const fs = require('fs');

const port = process.env.PORT || 3210;

const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404
};

const page404 = {
  path: 'pages/404.html',
  type: { 'Content-Type': 'text/html' },
  responseCode: STATUS_CODES.NOT_FOUND
};

const action = {
  type: { 'Content-Type': 'text/html' },
  responseCode: STATUS_CODES.OK
};

const paths = {
  css: 'css/theme.css',
  jpg: 'img/binoculars.jpg'
};

const contentType = {
  '/': {
    path: 'pages/index.html',
    type: { 'Content-Type': 'text/html' },
    responseCode: STATUS_CODES.OK
  },
  [`/${paths.css}`]: {
    path: paths.css,
    type: { 'Content-Type': 'text/css' },
    responseCode: STATUS_CODES.OK
  },
  [`/${paths.jpg}`]: {
    path: paths.jpg,
    type: { 'Content-Type': 'image/jpeg' },
    responseCode: STATUS_CODES.OK
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
  const entries = body
    .toString()
    .split('&')
    .map(bodyValue => bodyValue.split('='));
  const json = Object.fromEntries(entries);
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
  if (!list.data) return undefined;
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
  if (listData === undefined) return;
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

const resolve = json => {
  let str = '';
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
  return str;
};

async function manageRequest(req, res) {
  const body = [];
  req
    .on('data', chunk => body.push(chunk))
    .on('end', () => {
      const json = parse(body);
      const str = resolve(json);
      if (str) {
        process.stdout.write(str);
        res.writeHead(action.responseCode, action.type);
        res.end(makeHTML(str));
      }
    });
}

http
  .createServer(async (req, res) => {
    await manageRequest(req, res);
    const { responseCode, type, path } = contentType[req.url] || page404;
    res.writeHead(responseCode, type);
    fs.createReadStream(path).pipe(res);
  })
  .listen(port);
