const net = require('net');

const checkPort = (port, host) => {
  return new Promise(resolve => {
    const socket = net.createConnection(port, host, () => {
      clearTimeout(timer);
      resolve({ port, result: true });
      socket.end();
    });
    const timer = setTimeout(() => {
      resolve({ port, result: false });
      socket.end();
    }, 300);
    socket.on('error', () => {
      clearTimeout(timer);
      resolve({ port, result: false });
    });
  });
};

const getResult = async (host, startPoint = 0, endPoint = 65535) => {
  try {
    const result = [];
    let currentPoint = startPoint;

    while (currentPoint < endPoint) {
      result.push(checkPort(currentPoint, host));
      currentPoint += 1;
    }
    const scanResult = await Promise.all(result);
    scanResult.forEach(el => {
      if (el.result) process.stdout.write(`Port ${el.port} is opened\n`);
    });
  } catch (e) {
    process.stdout.write(e);
  }
};

const parseArgs = arr => {
  const result = {
    help: null
  };
  if (arr[0] === '--help') {
    result.help = `--host <domain name or ip what you want to check> - required argument.\n
        --ports <start_port-end_port> - ports range from/to.\n
        --help - get help.`;
    return result;
  }
  if (arr.length > 2) {
    const ports = arr[1].split('-');
    result.portStart = Number(ports[0]);
    result.portEnd = Number(ports[1]);
    result.host = arr.slice(3, 4);
  } else {
    result.host = arr.slice(0, 1);
  }
  return result;
};

const startCheck = async () => {
  try {
    const { host, portStart, portEnd, help } = parseArgs(process.argv.slice(2));
    if (help) {
      process.stdout.write(help);
      process.exit(0);
    }
    await getResult(host, portStart, portEnd);
    process.exit(0);
  } catch (e) {
    process.stdout.write(e);
    process.exit(1);
  }
};

startCheck();
