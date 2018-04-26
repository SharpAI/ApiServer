var server = require('http').createServer();
var io = require('socket.io')(server);
io.on('connection', function(client){
    console.log("user connected")
    client.on('message', function(message){
    	client.broadcast.emit('message', message);
	});

    client.on('disconnect', function() {
		console.log("anonymous left");
    });
});

server.listen(3000);