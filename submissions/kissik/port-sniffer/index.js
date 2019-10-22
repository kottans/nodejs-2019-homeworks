const net = require('net');

const argp = require('commander');

const async = require('async');

let res = '';
let completed = 0;

function print(x) {
  if (x.length) process.stdout.write(x);
}
argp
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

argp.parse(process.argv);

const st = parseInt(argp.ports.split('-')[0], 10);
const ed = parseInt(
  argp.ports.split('-').length === 1
    ? argp.ports.split('-')[0]
    : argp.ports.split('-')[1],
  10
);

print(`scaning ${argp.host}:${st}-${ed}`);

function scanPorts(lsts) {
  const client = new net.Socket();

  function done(err, con) {
    if (err) print(argp.error);

    if (con) {
      print(argp.connect);
      if (res) res += `,${lsts.port}`;
      else res += lsts.port;
    } else print(argp.unableConnect);
    completed += 1;
    if (completed === ed - st + 1) {
      print(`\n${res !== '' ? res : 'none'} port(s) is(are) opened\n`);
    }
  }

  client
    .connect({ port: lsts.port, host: lsts.host }, () => {
      done(null, true);
      client.end();
      client.destroy();
    })
    .setTimeout(parseInt(argp.timeout, 10), () => {
      done(null, false);
      client.end();
      client.destroy();
    })
    .on('data', () => {
      done(null, true);
      client.end();
      client.destroy();
    })
    .on('end', () => {
      done(null, true);
      client.end();
      client.destroy();
    })
    .on('error', err => {
      done(err, false);
      client.end();
      client.destroy();
    });
}

function sniffer(callback) {
  const q = async.queue(scanPorts, 65535);
  let lsts;

  for (let i = st; i <= ed; i += 1) {
    lsts = {};
    lsts.port = i;
    lsts.host = argp.host;
    q.push(lsts);
  }

  callback('\nwell async done\n');
}

sniffer(print);
