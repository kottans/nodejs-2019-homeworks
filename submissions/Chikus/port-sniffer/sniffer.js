const Net = require('net');
var host = '';
var lower_port = 0;
var higher_port = 65535;
var port_list = [];
var timeout = 300;

function check(host, port, callback) {
 var socket = Net.createConnection(port, host);
 var timer  = setTimeout(function () {
  socket.destroy();
  callback(false);
}, timeout);
 socket.once('connect', function () {
  clearTimeout(timer);
  socket.destroy();
  process.stdout.write('.');
  port_list.push(port);
  callback(true);
 });
 socket.on('error', function () {
  clearTimeout(timer);
  callback(false);
 });
}

function run_ports(){
  check(host,lower_port, function next_check(result) {
    if (lower_port == higher_port) {
      if (port_list.length) {
          process.stdout.write('\n'+port_list.join()+' ports are opened \n');
      }
      else {
        process.stdout.write('No ports were found \n');
      }
    }
    else {
      check(host,++lower_port,next_check);
    }
  })
};

switch (process.argv[2]) {
  case '--ports':
    var ports = [2];
    ports = process.argv[3].split('-');
    lower_port = ports[0];
    higher_port = ports[1];
    if (process.argv[4] == '--host') {
      host = process.argv[5];
      process.stdout.write('Please verify your port range and your host name , for performance you can modify the variable timeout when you be in localhost, one suggestion use ping to know which will be the ideal timeout\n');
      run_ports();
    }
    else {
      process.stdout.write('Please type node sniffer.js --help to know the usage \n');
    }
    break;
  case '--host':
    host = process.argv[3];
    process.stdout.write('Please verify your port range and your host name, for performance you can modify the variable timeout when you be in localhost, one suggestion use ping to know which will be the ideal timeout \n');
    process.stdout.write('THanks you dont provide ports u will scan from 0 to 65535 \n');
    run_ports();
    break;
  case '--help':
    process.stdout.write('Please go to this website to read how to use this program \n https://github.com/kottans/backend/blob/master/tasks/network.md \n');
    break;
  default:
    process.stdout.write('Please type node sniffer.js --help to know the usage \n');
}
