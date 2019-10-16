const dns = require('dns')

const requiredArguments = ['host']
const defaultPortLimits = {
    'start_port': 0,
    'end_port': 65535
}
const helpMessage = `hey bitch`

function combineArgs(args) { 
    return args.reduce((result, item, index, arr) => {
        if (item.indexOf('--') === 0 && arr[index + 1])
            result[item] = arr[index + 1]
        return result
    }, {})
}

 async function getAddress(host) {
    return new Promise((resolve, reject) => {
        dns.lookup(host, (err, address) => {
            if (err) reject(err)
            resolve(address)
        })
    }).catch(e => console.log('\nError occured while proccessing', host))
}


(async function() {
    const processArgs = process.argv.slice(2)
    const combinedArgs = combineArgs(processArgs)
    if (!combinedArgs.hasOwnProperty('--host')) {
        console.log(helpMessage)
        process.exit(1)
    }
    await getAddress(combinedArgs['--host'])
    // console.log(await getAddress(combinedArgs['--host']))
})()