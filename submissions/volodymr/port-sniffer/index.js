'use strict';

const { Socket } = require('net');
const argv = require('yargs')
  .usage('Usage: node $0 [options]')
  .example('node $0 --host example.com --ports 0-1000')
  .option('host', {
    type: 'string',
    demandOption: true,
    describe: 'Desirable host name'
  })
  .option('ports', {
    type: 'string',
    describe: 'Desirable ports to check'
  })
  .help('help')
  .argv;

// start

class Sniffer {
  constructor (host, ports) {
    this.host = host;
    this.inputPorts = ports;
    this.lowestPort = 0;
    this.highestPort = 65535;
  }

  async sniff () {
    try {
      this.checkInputPorts();

      let openPorts = [];

      for (let i = this.lowestPort; i <= this.highestPort; i++) {
        openPorts.push(this.checkPort(i));
      }

      openPorts = await Promise.all(openPorts);
      openPorts = openPorts.filter(Boolean);

      if (openPorts.length) {
        process.stdout.write(`${openPorts.join(',')} ports are opened` + '\n');
      } else {
        process.stdout.write('There are not any open ports' + '\n');
      }

      process.exit(0);
    } catch (error) {
      console.error(error);
    }
  }

  checkPort (port) {
    return new Promise((resolve, reject) => {
      const socket = new Socket();

      socket.setTimeout(1000); // I put 1sec, not 300ms, because when node tries to connect to 65536 ports the server can't response in 300ms
      socket
        .on('connect', () => {
          process.stdout.write('.\n');
          socket.destroy();
          resolve(port);
        })
        .on('timeout', () => {
          socket.destroy();
          resolve(false);
        })
        .on('error', error => {
          console.log(error);
          socket.destroy();
          resolve(false);
        });

      socket.connect({ port: port, host: this.host });
    });
  }

  checkInputPorts () {
    if (this.inputPorts) {
      let min = parseInt(this.inputPorts.split('-')[0]);
      let max = parseInt(this.inputPorts.split('-')[1]);

      if (min > max) [min, max] = [max, min];

      this.lowestPort = min >= 0 && min < 65535 ? min : 0;
      this.highestPort = max >= 1 && max <= 65535 ? max : 65535;
    }
  }
}

const sniffer = new Sniffer(argv.host, argv.ports);

const getOpenPorts = async sniffer => { await sniffer.sniff(); };

getOpenPorts(sniffer);
