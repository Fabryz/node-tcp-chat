/*
* TODO

- public _realtime_ log
- change nick with /nick
- broadcast message on changenick
- nick list on /who
- /me action command

*/

var carrier = require('carrier'),
	net = require('net'),
	fs = require('fs');
	
require('./date.format.js');

var connections = [],
	date,
	logsdir = '/logs/';

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
			
			wall(username+' joined the chat.');
			var pos=connections.indexOf(conn);
			if(pos>=0){
				connections[pos].user=username;
			};

			
			conn.write("\r\n* Hello "+ username +"!\r\n");
			conn.write("*\tUse /help to see all the available commands.\r\n");
			conn.write("*\tThere are: "+ connections.length +" people connected. \r\n\r\n");
			return;
		}
				
		//Special commands
		switch (line) {
			case '/help':
					conn.write('\n* Marvelous Chat help section *\r\n\r\n');
					conn.write('/nick newnick - Change nick to "newnick".\r\n');
					conn.write('/quit - Quit the server.\r\n');
					conn.write('/who - Number of people on the server.\r\n');
					conn.write('/motd - METAL GEAR???\r\n');
					conn.write('/help - This help page.\r\n\r\n');
				break;
			case '/n':
			case '/list':
			case '/who':
					conn.write("--currently on line--\n");
					connections.forEach(function(one_connection){
						conn.write(one_connection.user+'\n')
					});
					conn.write('--\n');
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
					/*if (line.substring(0, 4) == '/all ') {
						connections.forEach(function(one_conn) {
							one_conn.write('* Broadcast: '+ line +'\r\n');
						});
					}*/
					// if /nick
					if(line.match(/^(\/nick)/i)){
						var newusername = line.match(/^(\/nick) (\w*)/i)[2];
						wall(username+' renamed to '+newusername);
						var pos=connections.indexOf(conn);
						if(pos>=0){
							connections[pos].user=newusername;
						};
						username = newusername;
						break;
					}
			
					date = new Date();
		
					var feedback = "["+ date.format("isoTime") +"] "+ username +": "+ line + "\r\n";
	
					wall(feedback);
					
					var log = fs.createWriteStream(__dirname + logsdir + 'log_'+ date.format("isoDate") +'.txt', { 'flags': 'a'});
					log.write(feedback);
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
	
	wall=function(msg){
		connections.forEach(function(one_connection){
			one_connection.write(msg+'\n')
		});
		console.log(msg);
	}
	
}).listen(8080);
console.log('[Log] Chat server started.');

/* Show daily chatlog */
var http = require('http'),
	path = require('path'),
	date = new Date();

http.createServer(function(req, res) {
	var filename = __dirname + logsdir + '/log_'+ date.format("isoDate") +'.txt';

	path.exists(filename, function(exists) {  
        if (!exists) {  
            res.writeHead(200, {"Content-Type": "text/plain"});  
            res.end("No daily log found.\n");   
            return;  
        }  
        
		fs.readFile(filename, function(err, data) {
			if (err) {
				res.writeHead(500, {"Content-Type": "text/plain"});
				res.end(err);
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/plain' });
			res.write(data, 'utf8');
			res.end();
		});
	});
}).listen(8000);
