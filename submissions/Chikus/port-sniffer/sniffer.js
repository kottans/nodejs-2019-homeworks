const Net = require('net');

function sniffer(arg) {
  if (arg.length > 6) {
    throw new Error(
      'Bad usage to know the manual type: node sniffer.js --help'
    );
  }
  const help = `
TCP sniffer parameters:
    --host     Mandatory parameter which define the host address for a TCP
               port, It can be specified as IP address or URL.
    --ports    Optional parameter which specifies port range, from min (1) to
               max (65536) with a separator '-' between them, if this is not specified will
               take the min and max values.

Examples: node sniffer.js --host google.com --ports 100-2345
          node sniffer.js --ports 1-1500 --host www.google.com
          node sniffer.js --host 171.217.3.110
          node sniffer.js --ports 70-80 --host 171.217.3.110
          node sniffer.js --host www.google.com
`;

  function checkServer(host, port) {
    return new Promise(function prom(resolve) {
      const socket = Net.createConnection(port, host);
      socket.setTimeout(300);
      socket.on('timeout', function timer() {
        socket.destroy();
        resolve(null);
      });
      socket.on('connect', function success() {
        process.stdout.write('.');
        socket.destroy();
        resolve(port);
      });
      socket.on('error', function fail() {
        throw new Error('Error in Socket, wrong host \n');
      });
    }).catch(e => e);
  }

  async function runPorts(host, lowerPort, higherPort) {
    const portList = [];
    for (let i = lowerPort; i <= higherPort; i += 1) {
      /* eslint-disable */
      const validPort = await checkServer(host, i);
      /* eslint-enable */
      if (validPort) {
        portList.push(validPort);
      }
    }
    if (portList.length) {
      process.stdout.write(`\n${portList.join()} ports are opened \n`);
      return process.exit(0);
    }
    process.stdout.write('No ports were found \n');
    return process.exit(0);
  }

  function checkPorts(userPorts) {
    if (userPorts) {
      const ports = userPorts.split('-').map(elem => Number(elem));
      if (
        ports[0] > ports[1] ||
        ports[0] < 0 ||
        ports[1] > 65535 ||
        !ports[1]
      ) {
        throw new Error(' Check your ports, range from 1-65535\n');
      }
      return [ports[0], ports[1]];
    }
    throw new Error('Ports no defined \n');
  }

  function checkHost(host) {
    if (host) {
      const domains = host.split('.');
      if (host.replace(/[^.]/g, '').length === 3) {
        if (
          domains.every(x => Number.isNaN(x)) ||
          domains.every(x => !Number.isNaN(x))
        ) {
          return host;
        }
      } else if (host.replace(/[^.]/g, '').length <= 2) {
        if (domains.every(x => !Number.isNaN(x))) {
          return host;
        }
      }
    }
    return null;
  }

  switch (arg[2]) {
    case '--ports':
      if (arg[4] === '--host') {
        const [portMin, portMax] = checkPorts(arg[3]);
        runPorts(checkHost(arg[5]), portMin, portMax);
      } else {
        process.stdout.write('Bad usage type: node sniffer.js --help \n');
      }
      break;
    case '--host':
      if (arg[4] === '--ports') {
        const [portMin, portMax] = checkPorts(arg[5]);
        runPorts(checkHost(arg[3]), portMin, portMax);
      } else if (typeof arg[4] === 'undefined') {
        process.stdout.write('Ports checking from 1 to 65535 \n');
        runPorts(checkHost(arg[3]), 1, 65535);
      } else {
        process.stdout.write('Bad usage type: node sniffer.js --help \n');
      }
      break;
    case '--help':
      process.stdout.write(help);
      break;
    default:
      process.stdout.write('Bad usage type: node sniffer.js --help \n');
  }
}
sniffer(process.argv);
