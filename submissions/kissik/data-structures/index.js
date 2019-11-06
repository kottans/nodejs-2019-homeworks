const http = require('http');

const fs = require('fs');

const port = process.env.PORT || 3210;

const list = {};

list.data = {};

list.push = data => {
  list.data = {
    item: data,
    next: list.data
  };
};

list.pop = () => {
  const a = list.data.item ? list.data.item : 'none';
  if (list.data) list.data = list.data.next;
  return a;
};

list.print = msg => {
  let a = list.data;
  let str = '';
  str += `\nThe ${msg}:\n`;
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
  while (next && next.item !== data) {
    next = next.next;
    a = a.next;
  }
  if (next && next.item === data) a.next = next.next;
};

http
  .createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      fs.createReadStream('pages/index.html').pipe(res);
    } else if (req.url === '/css/theme.css') {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      fs.createReadStream('css/theme.css').pipe(res);
    } else if (req.url === '/img/binoculars.jpg') {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      fs.createReadStream('img/binoculars.jpg').pipe(res);
    } else if (req.url === '/js/script.js') {
      res.writeHead(200, { 'Content-Type': 'application/js' });
      fs.createReadStream('js/script.js').pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      fs.createReadStream('pages/404.html').pipe(res);
    }

    let body = [];

    req
      .on('data', chunk => body.push(chunk))
      .on('end', () => {
        body = body.toString().split('&');
        const json = {};
        let str = '';
        body.map(x => {
          const key = x.split('=')[0];
          const value = x.split('=')[1];
          json[key] = value;
          return x;
        });

        if (json.action === 'push') {
          str += `\nbefore: ${
            json.type === 'list' ? list.print('list') : list.print('stack')
          } <br> \nafter:`;
          list.push(json.item);
          str +=
            json.type === 'list' ? list.print('list') : list.print('stack');
        }
        if (json.type === 'list' && json.action === 'pop') {
          str += `\nbefore: ${list.print('list')} <br> \nafter:`;
          list.remove(json.item);
          str += list.print('list');
        }
        if (json.type === 'stack' && json.action === 'pop') {
          str += `\nbefore: ${list.print('stack')} <br> \nafter:`;
          str += `\n${list.pop()} was poped`;
          str += list.print('stack');
        }
        process.stdout.write(str);
        if (str)
          res.end(`<html><head>
                    <link rel="stylesheet" type="text/css" href="css/theme.css">
                    </head>
                    <body><h1>Your data structure:</h1>
                    <p class="answer">${str}</p>
                    <a href='/'>return</a>
            </body></html>`);
      });
  })
  .listen(port);
