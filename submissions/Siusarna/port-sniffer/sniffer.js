const net = require('net');
const dns = require('dns').promises;

const args = process.argv;
const help = `
  Simple port sniffer
This script takes 2 parameters:

    --host     obligatory parameter which defines the host address for a port scan.
               Address must be specified after the parameter.
               It can be specified as IP address or URL.

    --ports     Parameter which specifies port range.
               After the parameter two numbers from 0 to 65535 must be specified with a delimiter '-' between them.

               Example: node sniffer.js --host google.com --port 100-2345

    --help     Parameter will show this instructions.
`;

const validHost = async host => {
  if (!host) {
    process.stdout.write(
      'Invalid host parameter. Try node sniffer.js --help \n'
    );
  }
  try {
    return await dns
      .lookup(host)
      .then(({ address }) => address)
      .catch(error => {
        process.stdout.write(
          `Invalit host name. ${error}. Try node sniffer.js --help \n`
        );
        return 0;
      });
  } catch (e) {
    process.stdout.write(e);
    return 0;
  }
};

const checkRangePort = port => {
  if (port[0] < 0 || port[1] > 65535 || port[2] || port[0] > port[1]) {
    return false;
  }
  return true;
};

const validatorForPort = portRange => {
  let validPort = [1, 65535];
  if (portRange) {
    if (checkRangePort(portRange)) {
      validPort = portRange;
    } else {
      process.stdout.write('Invalid port range. See help \n');
    }
  } else {
    process.stdout.write(
      'No port range specified. Setting to default. For more information try --help \n'
    );
  }
  return validPort;
};

const checkConnection = async (port, host) => {
  return new Promise(resolve => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.on('connect', () => {
      process.stdout.write('.');
      resolve(port);
      socket.destroy();
    });
    socket.on('timeout', () => {
      resolve(false);
      socket.destroy();
    });
    socket.on('error', () => {
      resolve(false);
      socket.destroy();
    });
    socket.connect(port, host);
  });
};

const findOpenPorts = async (ports, host) => {
  const openPorts = [];
  for (let i = ports[0]; i <= ports[1]; i += 1) {
    openPorts.push(checkConnection(i, host));
  }
  return Promise.all(openPorts).then(values => values.filter(Number.isFinite));
};

const sniffer = async ({ helpFlag, port, host }) => {
  if (helpFlag) {
    process.stdout.write(help);
  }
  if (!host && !port) {
    process.stdout.write('No arguments. Try node sniffer.js --help. \n');
    return 0;
  }
  const checkPort = validatorForPort(port);
  const checkHost = await validHost(host);
  const result = await findOpenPorts(checkPort, checkHost);
  process.stdout.write('\n');
  for (let i = 0; i < result.length; i += 1) {
    if (i !== result.length - 1) {
      process.stdout.write(`${result[i].toString()},`);
    } else {
      process.stdout.write(result[i].toString());
    }
  }
  process.stdout.write(' ports are opened \n');
  return 0;
};

const parseArgs = () => {
  const objWithInputData = {
    helpFlag: false
  };
  if (args.indexOf('--help') !== -1) {
    objWithInputData.helpFlag = true;
  }
  const indexPort = args.indexOf('--ports');
  if (indexPort !== -1) {
    objWithInputData.port = args[indexPort + 1].split('-').map(Number);
  }
  const indexHost = args.indexOf('--host');
  if (indexHost !== -1) objWithInputData.host = args[indexHost + 1];
  return objWithInputData;
};

sniffer(parseArgs());
