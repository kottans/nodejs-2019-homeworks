#!/usr/bin/env node

"use strict";

let help = {
    script:`Simple port sniffer

This is a simple port sniffer, which can be calles as command line script or imported as a module.
When used from command line it takes 2 named paramentes:
--host      obligatory parameter which defines the host address for a port scan.
            After the --host parameter should follow the host IP addres as four numbers,
            separated by commas or a host web address.

                python sniffer.py --host www.google.com

--ports     optional parementer to provide a port range for scan. The range
            should be definded as two number with a dash between them. If not set
            or set incorrectly the default range of (1-65535) is scanned

                python sniffer.py --host wwww.google.com --ports 1024-2018

--help      parameted to see this reference

To import port scanner use

    import sniffer.py

after import you can perform scan by calling sniffer.scan()

scan(host, portString, module, silent)

For  detailed disambiguation of scan function use help(scan) after importing
sniffer or call sniffer.py with --help method`
}

const dns = require('dns');
const Socket = require('net').Socket;

function* twister(){
    let symbols = ['|','/','-','\\'];
    let current = 0;
    while (true) {
        if (current == 4) current = 0;
        yield symbols[current++];
    }
}

async function parseHost(hostName){
    let host = ''
    if(hostName.search(/^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/) == -1){
        host = await new Promise((resolve, reject)=>{
            dns.lookup(hostName, (error, address) => {
                if(error){
                    error.message = "Hostname can not be resolved";
                    reject(error);
                }
                resolve(address)
            });
        });
    } else {
        host = hostName;
    }
    return host;
}

function parsePorts(ports){
    if(ports.search(/\d{1,4}-\d{1,4}/) == -1){
        throw "Invalid port range argument"
    } else {
        let limits = ports.split("-");
        if (+limits[0] >= +limits[1] || +limits[0] < 1 || +limits[0] > 65535
            || +limits[1] < 1 || +limits[1]>65535){
                throw "Port numbers out of range"
            } else {
                limits[1]++;
                return limits;
            }
    }
}

async function parseArguments(args){
    let host = "";
    let ports = [1, 65536];
    let hostIndex = args.indexOf('--host');
    if(hostIndex == -1 || hostIndex == args.length -1){
        throw "You must specify a host to scan ports";
    } else {
        host = await parseHost(args[hostIndex + 1]);
    }
    let portsIndex = args.indexOf('--ports') + 1;
    if (portsIndex != 0){
        if(portsIndex == args.length){
            console.log("Invalis ports specified, setting to default (1-65535)");
        } else {
            try{
                ports = parsePorts(args[portsIndex]);
            } catch {
                console.log("Invalid ports specified, setting to default(1-65535)")
            }
        }
    }

    return {host:host, ports:ports}
}

async function scan(host, ports, args = {silent:false,module:false}){
    let openPorts = [];
    let tw = twister();
    process.stdout.write("scanning ");
    for(let port = +ports[0]; port < ports[1]; ++port) {
        process.stdout.write(`${tw.next().value}\b`);
        try{
            await new Promise((resolve, reject) =>{
                let socket = new Socket();
                socket.setTimeout(300);
                socket.on('connect', () =>{
                    process.stdout.write('. ');
                    openPorts.push(port);
                    socket.destroy();
                    resolve();
                });
                socket.on('timeout', ()=>{
                    socket.destroy();
                    reject();
                });
                socket.on('error', () =>{
                    socket.destroy();
                    reject();
                });
                socket.connect(port, host);
            });
        } catch {

        }
    }

    if(!args.silent || !args.module){
        let result = '';
        if(openPorts.length){
            result = `Port${openPorts.length > 1 ? 's': ''} ${openPorts.join(', ')} ${openPorts.length > 1 ? 'are' : 'is'}`
        } else{
            result = 'No ports are'
        }

        console.log(` \n${result} open`);
    }
}

if(process.argv.indexOf('--help') != -1){
    console.log(help.script);
} else {
    try {
        parseArguments(process.argv.slice(2)).then((result) => scan(result.host, result.ports));
    } catch {
        console.log(help.script);
    }
}