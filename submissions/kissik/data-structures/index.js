const http = require('http');

const fs = require('fs');

const port = process.env.PORT || 3210;

const page404 = {
  path: 'pages/404.html',
  type: { 'Content-Type': 'text/html' },
  verb: 404
};

const action = {
  type: { 'Content-Type': 'text/html' },
  verb: 200
};

const contentType = {
  '/': {
    path: 'pages/index.html',
    type: { 'Content-Type': 'text/html' },
    verb: 200
  },
  '/css/theme.css': {
    path: 'css/theme.css',
    type: { 'Content-Type': 'text/css' },
    verb: 200
  },
  '/img/binoculars.jpg': {
    path: 'img/binoculars.jpg',
    type: { 'Content-Type': 'image/jpeg' },
    verb: 200
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

const list = {};

list.data = {};

list.push = data => {
  list.data = {
    item: data,
    next: list.data
  };
};

list.pop = () => {
  const itemValue = list.data.item ? list.data.item : 'none';
  if (list.data) list.data = list.data.next;
  return itemValue;
};

list.print = msg => {
  let a = list.data;
  let str = `\nThe ${msg}:\n`;
  while (a && a.item) {
    str += `${a.item} -> `;
    a = a.next;
  }
  return str;
};

list.remove = data => {
  let a = list.data;
  let next;
  if (a.next) next = a.next;
  if (a.item === data) list.data = a.next;
  else {
    while (next && next.item !== data) {
      next = next.next;
      a = a.next;
    }
    if (next && next.item === data) a.next = next.next;
  }
};

http
  .createServer((req, res) => {
    let body = [];
    req
      .on('data', chunk => body.push(chunk))
      .on('end', () => {
        const json = {};
        let str = '';
        body = body.toString().split('&');
        body.map(x => {
          const key = x.split('=')[0];
          const value = x.split('=')[1];
          json[key] = value;
          return x;
        });
        if (json.type)
          str += `\nbefore: ${list.print(json.type)} <br> \nafter:`;
        if (json.action === 'push') list.push(json.item);
        if (json.type === 'list' && json.action === 'pop')
          list.remove(json.item);
        if (json.type === 'stack' && json.action === 'pop')
          str += `\n${list.pop()} was poped`;
        if (json.type) str += list.print(json.type);
        if (str) {
          process.stdout.write(str);
          res.writeHead(action.verb, action.type);
          res.end(makeHTML(str));
        }
      });
    res.writeHead(
      contentType[req.url] ? contentType[req.url].verb : page404.verb,
      contentType[req.url] ? contentType[req.url].type : page404.type
    );
    fs.createReadStream(
      contentType[req.url] ? contentType[req.url].path : page404.path
    ).pipe(res);
  })
  .listen(port);
