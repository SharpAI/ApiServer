GLOBAL.DEBUG = true;

var VERSION = '0.1',
    // include all the modules
    sys = require('sys'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    //mongo = require('mongodb'),
    querystring = require('querystring'),
    express = require('express');

var app = express.createServer();
/*
var host = 'pe-macmini.local', port = mongo.Connection.DEFAULT_PORT,
    
    servers = new mongo.ReplSetServers([
      new mongo.Server('pe-macmini.local', port, {}),
      new mongo.Server('webdev.local', port, {}),
      new mongo.Server('devslave.local', 27019, {})
    ], { 'rs_name': 'mongoset' }),
    db = new mongo.Db('boomerang', servers, { native_parser:true });

db.open(function(){});
*/
var getClientCode = function() {
    var code;
    return function(file) {
        if (!code) {
            code = fs.readFileSync(file).toString();
        }
        return code;
    };
}();

var server = http.createServer(function(request, response) {
  var u  = url.parse(request.url);
  
  if (u.pathname == '/boomerang.js' || u.pathname == '/boomerang-min.js')  {
    response.writeHead(200, {'Content-Type':'text/javascript'});
    response.end(getClientCode(u.pathname.substring(1)));
  }
  else if (u.pathname == '/beacon.gif') {
    response.writeHead(200, {'Content-Type':'image/gif'});

    var data = querystring.parse(u.query);
    data.headers = u.headers;
    
    data.rt_start = data['rt.start'];
    delete data['rt.start'];
    
    console.log(JSON.stringify(data));
/*
    db.collection('beacon', function(err, collection) {
      console.log('Writing data');
        collection.insert(data, function(result){
          console.log(result);
        });
    });
*/
    response.end('');
  }
  else {
    response.end('');
  }
});

server.listen(8124);

console.log('Server running at http://localhost:8124/');

