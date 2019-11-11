const net = require('net');
const dns = require('dns');
const args = require('minimist')(process.argv.slice(2));
const range = findPortsRange();

const ports = {
  firstPort: +range[0],
  lastPort: +range[1] ? +range[1] : +range[0],
  openedPorts: []
};

const openedPortCheck = (host, port, checkCallback) => {
  const socket = net.createConnection(port, host);
  const time = socket.setTimeout(300, () => {
    socket.destroy();
    checkCallback(false);
  });

  socket.on('connect', () => {
    clearTimeout(time);
    socket.destroy();
    process.stdout.write('.');
    ports.openedPorts.push(port);
    checkCallback(true);
  });
  socket.on('error', function () {
    clearTimeout(time);
    checkCallback(false);
  });
};

const showResult = host => {
  if (args.help) {
    process.stdout.write(messages().help);
    process.exit(1);
  }
  if (!args.host) {
    process.stdout.write(messages().noHost);
    process.exit(1);
  } else {
    openedPortCheck(host, ports.firstPort, function nextIteration () {
      if (ports.firstPort === ports.lastPort) {
        if (ports.openedPorts.length) {
          process.stdout.write(messages(ports.openedPorts.join()).openedPorts);
          process.exit();
        } else {
          process.stdout.write(messages().portsNotFound);
          process.exit(1);
        }
      }
      openedPortCheck(host, ++ports.firstPort, nextIteration);
    });
  }
};

function findPortsRange () {
  if (args.ports) {
    if (args.ports.length) {
      return args.ports.toString().split('-');
    } else {
      process.stdout.write(messages().emptyPortsParameter);
      process.exit(1);
    }
  } else {
    return ['0', '65535'];
  }
}

function messages (openedPortsNumbers) {
  return {
    help: `Port sniffer CLI tool. \n
    Parameters:
    --ports - type ports range
    --host - provide host IP adress or domain name \n
    Usage example: node program.js --ports 80-87 --host google.com`,
    noHost: 'Please provide host name. Type --help for usage manual.',
    openedPorts: `\nports ${openedPortsNumbers} are opened`,
    portsNotFound: 'No opened ports was found',
    emptyPortsParameter:
      'Please provide a port numbers range or skip --port parameter for default values (0-65535)'
  };
}

const ipLookup = () => {
  return new Promise((resolve, reject) => {
    dns.lookup(args.host, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

ipLookup()
  .then(res => showResult(res))
  .catch(() => process.stdout.write('Adress not found'));
