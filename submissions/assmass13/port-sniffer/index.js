const dns = require('dns');

// const requiredArguments = ['host'];
// const defaultPortLimits = {
//   start_port: 0,
//   end_port: 65535
// };
const helpMessage = `hey bitch`;

function stdoutWrite(str) {
  process.stdout.write(str);
}

function combineArgs(args) {
  return args.reduce((result, item, index, arr) => {
    const newResult = { ...result };
    if (item.indexOf('--') === 0 && arr[index + 1])
      newResult[item] = arr[index + 1];
    return newResult;
  }, {});
}

async function getAddress(host) {
  return new Promise((resolve, reject) => {
    dns.lookup(host, (err, address) => {
      if (err) reject(err);
      resolve(address);
    });
  }).catch(e => {
    stdoutWrite(`Error ${e.code} in ${e.syscall} for ${e.hostname}\n`);
  });
}

(async function sniff() {
  const processArgs = process.argv.slice(2);
  const combinedArgs = combineArgs(processArgs);
  if (!combinedArgs['--host']) {
    stdoutWrite(helpMessage);
    process.exit(1);
  }
  stdoutWrite(await getAddress(combinedArgs['--host']));
})();
