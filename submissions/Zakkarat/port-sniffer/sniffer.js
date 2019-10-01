const Net = require("net");
const dns = require("dns").promises;
const args = process.argv.slice(2);
const help = `
This script used for finding open ports for specified host.

Paramaters: 
    --host     Paramater which specifies address, where ports will be searched.
               Address must be specified after the parameter.
               It can be specified as IP address or URL.
               Examples: --host google.com,
               --host 172.217.3.110
    
    --port     Parameter which specifies port range, which will be used to find the open ports.
               After the parameter two numbers must be specified with a delimiter '-' between them.
               Numbers must be more than 0 and less than 65536, as there are only 2^(16) ports available.
               Examples: --port 30-562,
               --port 1-65535,
               --port 10-99

    --help     Parameter will show this instructions. Hope they were useful!
`;

const checkHost = async host => {
  if (!host) {
    console.log("No host specified. Use --help for more information.");
  }
  return await dns
    .lookup(host)
    .then(res => {
      return res.address;
    })
    .catch(error => {
      console.log("Invalid hostname. Use --help for more information.");
    });
};

const checkPorts = port => {
  let portLimits = [1, 65535];
  if (port) {
    portLimits = port.split("-").map(elem => Number(elem));
    if (1 > portLimits[0] || 65535 < portLimits[1] || portLimits[2]) {
      throw new Error("Invalid port range. Use --help for more information.");
    }
  } else {
    console.log("No port range specified. Setting to default. For more information try --help")
  }
  return portLimits;
};

const checkValid = async (host, port) => {
  let address = await checkHost(host);
  let ports;
  try {
    ports = checkPorts(port);
  } catch(e) {
    console.log(e);
    ports = [0];
  }
  if([address, ...ports].every(elem => elem)) {
  return [address, ...ports];
  } else {
    process.exit(1);
  }
};

const checkConnection = async ([host, minPort, maxPort]) => {
  const openPorts = [];
    for (let i = minPort; i <= maxPort; i++) {
    try {
      await new Promise((resolve, reject) => {
        const client = new Net.Socket();
        client.setTimeout(300);
        client.on("connect", () => {
          process.stdout.write(".");
          openPorts.push(i);
          client.destroy();
          resolve();
        });
        client.on("timeout", () => {
          client.destroy();
          reject();
        });
        client.on("error", () => {
          client.destroy();
          reject();
        });
        client.connect({
          port: i,
          host: host
        });
      });
    } catch {}
  }
  return openPorts;
}

const sniff = async ({ host, port, help }) => {
  if (help) {
    return 0;
  } else if (!host && !port) {
    console.log("No arguments specified. Try --help for more information.");
    return 0;
  }
  const hostPort = await checkValid(host, port);
  const openPorts = await checkConnection(hostPort);
  openPorts.length ? console.log(`\n${openPorts.join(', ')} ports are opened`) : console.log(`No ports opened`)
};



sniff(
  args.reduce((obj, elem, i) => {
    if (elem === "--help") {
      console.log(help);
      obj.help = true;
    } else if (i % 2 === 0) {
      elem = elem.slice(2);
      obj[elem] = args[i + 1];
    }
    return obj;
  }, {})
);
