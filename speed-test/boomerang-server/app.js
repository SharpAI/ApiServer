
/**
 * Module dependencies.
 */

var express = require('express'),
    querystring = require('querystring'),
    url = require('url');
    //mongo = require('mongodb');

var app = module.exports = express.createServer();
/*
var host = 'pe-macmini.local', port = mongo.Connection.DEFAULT_PORT,
    
    servers = new mongo.ReplSetServers([
      new mongo.Server('127.0.0.1', port, {})
    ], { 'rs_name': 'mongoset' }),
    db = new mongo.Db('boomerang', servers, { native_parser:true });

db.open(function(){});
*/
// Configuration

app.configure(function(){
    app.set('view engine', 'mustache')
    app.set("views", __dirname + '/views');
    app.register(".mustache", require('stache'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express',
    locals: {
        base: 'http://localhost:4000'
    }
  });
});

app.get('/beacon.gif', function (req, res) {
    var u  = url.parse(req.url);
    var data = querystring.parse(u.query);
    data.headers = u.headers;
    
    data.rt_start = data['rt.start'];
    delete data['rt.start'];
    
    console.log(JSON.stringify(data));
    /*
    db.collection('beacon', function (err, collection) {
        console.log('Writing data');
        
        collection.insert(data, function (result) {
            console.log(result);
        });
    });
    */
  
    res.send('', {'Content-Type': 'image/gif'});
});

app.listen(4000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
