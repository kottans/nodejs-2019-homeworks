const net = require('net');

const startCheck = async () => {
  try {
    const arg = process.argv.slice(2);
    if (!arg || !arg.length) {
      process.stdout.write(
        '--host <domain name or ip what you want to check>' +
          ' is required arguments.\n' +
          '--help for get description.'
      );
      process.exit(1);
    }
    if (arg[0] === '--help') {
      process.stdout.write(
        '--host <domain name or ip what you want to check> - required argument.\n' +
          '--ports <start_port-end_port> - ports range from/to.\n' +
          '--help - get help.'
      );
    }
    let host;
    let portStart;
    let portEnd;
    if (arg.length > 2) {
      const ports = arg[1].split('-');
      portStart = Number(ports[0]);
      portEnd = Number(ports[1]);
      [host] = arg.slice(3, 4);
    } else {
      [host] = arg.slice(0, 1);
    }
    const checkPort = port => {
      return new Promise(resolve => {
        let timer;
        const socket = net.createConnection(port, host, () => {
          clearTimeout(timer);
          resolve({ port, result: true });
          socket.end();
        });
        timer = setTimeout(() => {
          resolve({ port, result: false });
          socket.end();
        }, 300);
        socket.on('error', () => {
          clearTimeout(timer);
          resolve({ port, result: false });
        });
      });
    };
    const getResult = async (startPoint = 0, endPoint = 65535) => {
      try {
        const result = [];
        let start = startPoint;

        while (start < endPoint) {
          result.push(checkPort(start));
          start += 1;
        }
        const scanResult = await Promise.all(result).then(values => {
          return values;
        });
        scanResult.forEach(el => {
          if (el.result) process.stdout.write(`Port ${el.port} is opened\n`);
        });
      } catch (e) {
        process.stdout.write(e);
      }
    };
    await getResult(portStart, portEnd);
    process.exit(0);
  } catch (e) {
    process.stdout.write(e);
    process.exit(1);
  }
};

startCheck();
