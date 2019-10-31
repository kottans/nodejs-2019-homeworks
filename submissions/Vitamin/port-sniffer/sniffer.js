const Net = require("net");
const dns = require("dns").promises;
const { help } = require("./helpers");

const [, , ...arguments] = process.argv;
const [minPortValue, maxPortValue] = [0, 65535];

const ipToURL = async host => {
  try {
    const result = await dns.lookup(host);
    return await result.address;
  } catch (err) {
    throw Error("Invalid host");
  }
};

const isPortInRange = port => port >= minPortValue && port <= maxPortValue;

const getPortsRange = ports => {
  const [firstPort, last] = ports.split("-");
  const lastPort = isPortInRange(last) ? last : firstPort;
  if (isPortInRange(firstPort)) {
    return [firstPort, lastPort];
  } else {
    console.log("Invalid ports range");
    process.exit(1);
  }
};

const tryToConnect = (host, port) => {
  const client = new Net.Socket();
  client.setTimeout(300);
  client.connect({ port, host });
  return new Promise(resolve => {
    client.on("connect", () => {
      process.stdout.write(".");
      client.destroy();
      return resolve(port);
    });
    client.on("timeout", () => {
      client.destroy();
      return resolve(false);
    });
    client.on("error", () => {
      client.destroy();
      return resolve(false);
    });
  });
};

const getOpenedPorts = async ({ host, firstPort, lastPort }) => {
  const promises = [];
  for (let i = firstPort; i <= lastPort; i++) {
    promises.push(tryToConnect(host, i));
  }
  const ports = await Promise.all(promises);
  return ports.filter(Boolean);
};

parseArguments = async args => {
  if (args.includes("--help")) {
    console.log(help);
    process.exit(0);
  } else if (
    args.length < 4 ||
    !args.includes("--ports") ||
    !args.includes("--host")
  ) {
    console.log("Use --help to correct input");
    process.exit(1);
  }
  const [firstPort, lastPort] = getPortsRange(args[1]);
  const host = await ipToURL(args[3]);
  return { host, firstPort, lastPort };
};

const getMessageToLog = openPorts => {
  if (openPorts.length > 1) return `\n${openPorts} ports are opened`;
  else if (openPorts.length === 1) return `\n${openPorts} port is opened`;
  return "\nAll ports in range are closed";
};

const sniffing = async args => {
  const { host, firstPort, lastPort } = await parseArguments(args);
  return await getOpenedPorts({ host, firstPort, lastPort });
};

sniffing(arguments)
    .then(getMessageToLog)
    .then(console.log);

