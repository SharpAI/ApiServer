var socket = require('socket.io-client')('http://12.206.217.173:3000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
});

socket.on('connect', function(){
    console.log("connect")
});

socket.on('message', function (message) {
	console.log("message:", message)				
});

socket.on('event', function(data){});
socket.on('disconnect', function(){
     console.log("disconnect")
});

function postMessage(message){
	if (socket) {
		socket.emit('message', message);
    }
}
