const net = require('net');

function printFatal (message) {
  process.stdout.write(message);
  process.exit(1);
}

function printSuccess (message) {
  process.stdout.write(message);
  process.exit(0);
}

function getParamsFromArguments () {
  return process.argv
    .slice(2)
    .join(' ')
    .split(/\s?--/)
    .reduce(function (acc, str) {
      if (!str) return acc;
      const [key, value] = str.split(' ');

      if (key === 'ports' && value) {
        acc.ports = value.split('-').map(port => parseInt(port, 10));
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});
}

function validateParams (params) {
  if (Object.hasOwnProperty.call(params, 'help')) {
    printSuccessHelp();
  }

  if (!Object.hasOwnProperty.call(params, 'host')) {
    printFatal('Host is required, e.g. "--host 8.8.8.8"');
  }
  if (!params.host) {
    printFatal('Host value must be provided, e.g. "--host 8.8.8.8"');
  }

  if (Object.hasOwnProperty.call(params, 'ports')) {
    if (!params.ports) {
      printFatal('Ports value must be provided, e.g. "--ports 300-1024"');
    }
    if (!Array.isArray(params.ports) || params.ports.length !== 2) {
      printFatal('Ports format invalid, must be e.g. "--ports 300-1024"');
    }
    const [startPort, endPort] = params.ports;
    if (isNaN(startPort) || startPort < 0) {
      printFatal('Start port format invalid');
    }
    if (isNaN(endPort) || endPort < 0) {
      printFatal('End port format invalid');
    }
    if (endPort > 65535) {
      printFatal('End port must be between 0-65535');
    }
    if (startPort > endPort) {
      printFatal('End port must be bigger then start port');
    }
  }
}

function printSuccessHelp () {
  printSuccess(`NAME
    TCP sniffer - scans open ports on specific host.

OPTIONS
    --help
        Output a usage message and exit.

    --host
        Set a host for scan.
        E.g. "--host 127.0.0.1".

    --ports
        Set ports to scan.
        E.g. "--ports 300-1024".
        Default values: 0-65535.

EXAMPLES
    node sniffer.js --host localhost
    node sniffer.js --host localhost --ports 300-1024
`);
}

function sniffConnectionAvailabilityAsync (port, host) {
  return new Promise(function (resolve) {
    const socket = new net.Socket();
    socket.setTimeout(300);

    socket.on('connect', function () {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', function () {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', function () {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function scanAsync (host, port, portLimit, availablePorts = []) {
  if (port > portLimit) {
    return availablePorts;
  }
  const isPortOpen = await sniffConnectionAvailabilityAsync(port, host);
  if (isPortOpen) {
    process.stdout.write('.');
    availablePorts.push(port);
  }
  return scanAsync(host, port + 1, portLimit, availablePorts);
}

(async function () {
  const params = getParamsFromArguments();
  validateParams(params);
  const { host, ports = [] } = params;
  const [startPort = 0, endPort = 65535] = ports;
  const openedPorts = await scanAsync(host, startPort, endPort);
  const result = openedPorts.length ? `\n${openedPorts.join(',')} ports are opened` : `\nNo open ports on host: ${host}`;
  printSuccess(result);
})();
