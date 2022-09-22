const help = `
    Usage: sniffer.js [--help] [--ports <number>-<number>] [--host <value>]

    These are commands used in sniffer application: 

        host       Host address, IP or URL.
                   Examples: --host ukr.net,
                             --host 172.217.3.110
        
        ports      Ports range. Numbers must be more than 0 and less than 65535.
                   Examples: --ports 30-562,
                             --ports 1-65535.
                             
        help       Show all commands.
`;

const isDefined = value => value != null;

module.exports = { help, isDefined };
