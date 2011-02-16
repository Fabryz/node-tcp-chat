/*
* TODO

-chatlogs
-public realtime log
-change nick with /nick
-broadcast message on changenick

*/

var carrier = require('carrier'),
	net = require('net'),
	fs = require('fs');
	
require('./date.format.js');

var connections = [], date;

net.createServer(function(conn) {
	
	connections.forEach(function(one_conn) {
		one_conn.write('* Someone joined!\r\n');
	});
	
	connections.push(conn);
	console.log('Someone connected, '+ connections.length +' total.');
	
	conn.write("***********************************************\r\n");
	conn.write("* Hello and welcome to Marvelous Chat server! *\r\n");
	conn.write("***********************************************\r\n\r\n");
	conn.write("Who are you?:\r\n> ");
	
	var username;
	
	carrier.carry(conn, function(line) {
		if (!username) {
			username = line;
			conn.write("\r\n* Hello "+ username +"!\r\n");
			conn.write("*\tUse /help to see all the available commands.\r\n");
			conn.write("*\tThere are: "+ connections.length +" people connected. \r\n\r\n");
			return;
		}
				
		//Special commands
		switch (line) {
			case '/nick':
					conn.write('Not implemented\r\n');
				break;
			case '/help':
					conn.write('\n* Marvelous Chat help section *\r\n\r\n');
					conn.write('/nick newnick - Change nick to "newnick".\r\n');
					conn.write('/quit - Quit the server.\r\n');
					conn.write('/who - Number of people on the server.\r\n');
					conn.write('/motd - METAL GEAR???\r\n');
					conn.write('/help - This help page.\r\n\r\n');
				break;
			case '/who':
					conn.write('* There are currently '+ connections.length +' people connected.\r\n');
				break;
			case '/quit':
					connections.forEach(function(one_conn) {
						one_conn.write('* '+ username +' quitted!\r\n');
					});
					conn.end();
					console.log('[Log] '+ username +' quitted!\r\n');
				break;
			case '/motd':
					conn.write('Not implemented\r\n');
				break;
			case '/me':
					conn.write('Not implemented\r\n');
				break;	
			default:
					if (line.substring(0, 4) == '/all ') {
						connections.forEach(function(one_conn) {
							one_conn.write('* Broadcast: '+ line +'\r\n');
						});
					}
			
					date = new Date();
		
					var newline = "["+ date.format("isoTime"); +"] "+ username +": "+ line + "\r\n";
	
					connections.forEach(function(one_conn) {
						one_conn.write(newline);
					});
					
					var log = fs.createWriteStream('log_'+ date.format("isoDate") +'.txt', { 'flags': 'a'});
					log.write(newline);
				break;
		}

	});
	
	conn.on('close', function() {
		var pos = connections.indexOf(conn);
		if (pos >= 0) {
			connections.splice(pos, 1);
			console.log('[Log] '+ username + ' disconnected.');
		}
	});
	
}).listen(8080);
console.log('[Log] Chat server started.');
