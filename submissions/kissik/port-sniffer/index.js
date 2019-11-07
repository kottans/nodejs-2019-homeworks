const net = require('net');

const argumentParser = require('commander');

const async = require('async');

let res = '';
let completed = 0;

function print (x) {
  if (x.length) process.stdout.write(x);
}
argumentParser
  .version('1.0.0')
  .option('-H, --host <host>', 'ip-v4 or domain.name', 'google.com')
  .option('-c, --connect <cnt>', 'symbol', '.')
  .option('-e, --error <cnt>', 'symbol', 'e')
  .option('-u, --unableConnect <uncnt>', 'symbol', '!')
  .option(
    '-t, --timeout <tout>',
    'timeout in milliseconds of inactivity on the socket',
    300
  )
  .option('-p, --ports <port>', 'ports 1-65535', '80');

argumentParser.parse(process.argv);

const startingPort = parseInt(argumentParser.ports.split('-')[0], 10);
const endingPort = parseInt(
  argumentParser.ports.split('-').length === 1
    ? argumentParser.ports.split('-')[0]
    : argumentParser.ports.split('-')[1],
  10
);

print(`scaning ${argumentParser.host}:${startingPort}-${endingPort}`);

function scanPorts ({ port, host }) {
  const client = new net.Socket();

  function done (err, con) {
    if (err) print(argumentParser.error);

    if (con) {
      print(argumentParser.connect);
      if (res) res += `,${port}`;
      else res += port;
    } else print(argumentParser.unableConnect);
    completed += 1;
    if (completed === endingPort - startingPort + 1) {
      print(`\n${res || 'none'} port(s) is(are) opened\n`);
    }
  }

  client
    .connect({ port, host }, () => {
      done(null, true);
      client.end();
      client.destroy();
    })
    .setTimeout(parseInt(argumentParser.timeout, 10), () => {
      done(null, false);
      client.end();
      client.destroy();
    })
    .on('error', err => {
      done(err, false);
      client.end();
      client.destroy();
    });
}

function sniffer (callback) {
  const q = async.queue(scanPorts, 65535);
  for (let i = startingPort; i <= endingPort; i += 1) {
    q.push({ port: i, host: argumentParser.host });
  }
  callback(new Error('\nwell async done\n'));
}

sniffer(print);
