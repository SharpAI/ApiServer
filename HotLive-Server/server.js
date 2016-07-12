// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var isUseHTTPs = true;//!(!!process.env.PORT || !!process.env.IP);

var port = process.env.PORT || 443;

try {
    var _port = require('./config.json').port;

    if (_port && _port.toString() !== '443') {
        port = parseInt(_port);
    }
} catch (e) {}

var server = require(isUseHTTPs ? 'https' : 'http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    var stats;

    try {
        stats = fs.lstatSync(filename);
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: ' + path.join('/', uri) + '\n');
        response.end();
        return;
    }

    if (fs.statSync(filename).isDirectory()) {
        response.writeHead(404, {
            'Content-Type': 'text/html'
        });
        filename += '/demos/index.html';
    }


    fs.readFile(filename, 'utf8', function(err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }
        response.writeHead(200);
        response.write(file, 'utf8');
        response.end();
    });
}

var app;

if (isUseHTTPs) {
    var options = {
        key: fs.readFileSync(path.join(__dirname, 'keys/private.key')),
        cert: fs.readFileSync(path.join(__dirname, 'keys/certificate.crt')),
        ca: [fs.readFileSync(path.join(__dirname, 'keys/gd_bundle_01.crt'), 'utf8'),
            fs.readFileSync(path.join(__dirname, 'keys/gd_bundle_02.crt'), 'utf8')]
    };
    app = server.createServer(options, serverHandler);
} else app = server.createServer(serverHandler);

app = app.listen(port, process.env.IP || '0.0.0.0', function() {
    var addr = app.address();
    console.log('Server listening at', addr.address + ':' + addr.port);
});

require('./Signaling-Server.js')(app, function(socket) {
    try {
        var params = socket.handshake.query;

        // "socket" object is totally in your own hands!
        // do whatever you want!

        // in your HTML page, you can access socket as following:
        // connection.socketCustomEvent = 'custom-message';
        // var socket = connection.getSocket();
        // socket.emit(connection.socketCustomEvent, { test: true });

        if (!params.socketCustomEvent) {
            params.socketCustomEvent = 'custom-message';
        }

        socket.on(params.socketCustomEvent, function(message) {
            try {
                socket.broadcast.emit(params.socketCustomEvent, message);
            } catch (e) {}
        });
    } catch (e) {}
});
