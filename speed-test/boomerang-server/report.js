GLOBAL.DEBUG = true;

var VERSION = '0.1',
    // include all the modules
    sys = require('sys'),
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    mongo = require('mongodb'),
    querystring = require('querystring'),
    Table = require('cli-table');

var host = 'pe-macmini.local', port = mongo.Connection.DEFAULT_PORT,
    
    servers = new mongo.ReplSetServers([
      new mongo.Server('pe-macmini.local', port, {}),
      new mongo.Server('webdev.local', port, {}),
      new mongo.Server('devslave.local', 27019, {})
    ], { 'rs_name': 'mongoset' }),
    db = new mongo.Db('boomerang', servers, { native_parser:true });

var table = new Table({ 
    head: ['Site', 'Startup', 'Dom loading', 'Finished']
  , colWidths: [20, 20, 20, 20]
});

db.open(function(err, db) {

  db.collection('beacon', function(err, collection) {
    collection.find(function(err, cursor) {
      cursor.toArray(function(err, docs) { 
        console.log("Found %s docs", docs.length);
        docs.forEach(function(doc){
          table.push([
              doc.test_site,
              doc.nt_res_st - doc.nt_req_st,
              doc.nt_domloading - doc.nt_req_st,
              doc.nt_res_end - doc.nt_req_st
          ])
        });
          
        db.close();
        
        console.log(table.toString());
          
      });
      
    });
  });
  
});