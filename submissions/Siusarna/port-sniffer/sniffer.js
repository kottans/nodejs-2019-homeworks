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
      .then(res => {
        return res.address;
      })
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

const validatorForPort = port => {
  let validPort = [1, 65535];
  if (port) {
    validPort = port.split('-').map(el => Number(el));
    if (
      validPort[0] < 0 ||
      validPort[1] > 65535 ||
      validPort[2] ||
      validPort[0] > validPort[1]
    ) {
      throw new Error('Invalid port range. See help \n');
    }
  } else {
    process.stdout.write(
      'No port range specified. Setting to default. For more information try --help \n'
    );
  }
  return validPort;
};

const checkConnection = async (port, host) => {
  let flag = false;
  await new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.on('connect', () => {
      process.stdout.write('.');
      flag = true;
      socket.destroy();
      resolve();
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject();
    });
    socket.on('error', () => {
      socket.destroy();
      reject();
    });
    socket.connect(port, host);
  }).catch(e => e);
  if (flag) {
    return port;
  }
  return null;
};

const findOpenPorts = async (ports, host) => {
  let openPorts = [];
  for (let i = ports[0]; i <= ports[1]; i += 1) {
    openPorts.push(checkConnection(i, host));
  }
  openPorts = await Promise.all(openPorts);
  return openPorts.filter(Boolean);
};

const sniffer = async ({ host, port, helpFlag }) => {
  if (helpFlag) {
    return 0;
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
  const obj = {
    help: false
  };
  if (args.indexOf('--help') !== -1) {
    process.stdout.write(help);
    obj.help = true;
  }
  const indexPort = args.indexOf('--ports');
  if (indexPort !== -1) obj.port = args[indexPort + 1];
  const indexHost = args.indexOf('--host');
  if (indexHost !== -1) obj.host = args[indexHost + 1];
  return obj;
};

sniffer(parseArgs());
