var express = require('express');
var app = express();
var request = require('request');

var server_domain = process.env.SERVER || '127.0.0.1';
var port = process.env.PORT || 80;

app.set('views', __dirname +'/views');
app.set('view engine', 'ejs');

app.use('/static', express.static('static'));
app.use('/page', express.static('page'));

/*app.get('/', function (req, res) {
  var html = '<head><meta http-equiv="content-type" content="text/html;charset=utf-8" />';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />';
  html += '<title>创作故事</title>';
  html += '</head><body>';
  html += '请求格式为：/page/guide.html?userId=&url=<br />userId为必填项.';
  html += '</body>';
  res.send(html);
});*/

/*app.get('/', function (req, res) {
    res.send('page/guide.html');
});*/

app.get('/', function(req, res){
    //res.sendfile('guide.html', {root: __dirname + '/page'});
  var html = '<head><meta http-equiv="content-type" content="text/html;charset=utf-8" />';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />';
  html += '<title>创作故事</title>';
  html += '</head><body>';
  html += '请求格式为：http://www.uhella.com/import/USERID';
  html += '请求格式为：http://www.uhella.com/import/USERID/URL';
  html += '</body>';
  res.send(html);
});

//app.get('/', routes.guild);

app.get('/import/:id', function(req, res){
    var userId = req.params.id;
    res.render('guide', {server_domain:server_domain, port:port, userId:userId});
});

// app.get('/:id', function (req, res) {
//   var userId = req.params.id;
//   res.writeHead(302, {'Location': '/page/guide.html?userId=' + encodeURIComponent(userId)});
//   res.end();
// });
app.get('/import/:id/:url', function (req, res) {
  var userId = req.params.id;
  var url = req.params.url;
  var ajax = req.query['ajax'];
  var req_url = process.env.API_URL + '/' + encodeURIComponent(userId) + '/' + encodeURIComponent(url);
  
  console.log("req_url="+req_url);
  request(req_url, function (error, response, body) {
    console.log("error="+error+", response="+JSON.stringify(response)+", body="+body);
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body);
      if(result && result.status === 'succ'){
        return res.send(JSON.stringify({
          status: 'ok',
          url: result.json
        }));
      }
    }
    
    res.send(JSON.stringify({status: 'failed'}));
  });
});

var server = app.listen(process.env.PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Import host listening at http://%s:%s', host, port);
});