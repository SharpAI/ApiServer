var request = Meteor.npmRequire('request');

Router.route('/import-server/:_id/:url', function (req, res, next) {
  var api_url = import_server_url;
    
  res.writeHead(200, {
    'Content-Type' : 'text/html;charset=UTF-8',
    'Transfer-Encoding' : 'chunked'
  });
  
  // console.log(api_url + '/' + this.params._id + '/' + encodeURIComponent(this.params.url));
  var result = {status: 'failed'};
  var hasEnd = false;
  var hasRes = false;
  var slef = this;
  api_url += '/' + this.params._id + '/' + encodeURIComponent(this.params.url) + '?chunked=true';
  var clientIp = getClientIp(req);
  if (clientIp) {
    api_url += '&ip='+clientIp;
  }
  if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0) {
    api_url += '&server='+encodeURIComponent(Meteor.absoluteUrl());
  }
  if (this.params.query['task_id']) {
    api_url += '&task_id=' + this.params.query['task_id'];
  }
  if (this.params.query['isMobile']) {
    api_url += '&isMobile=' + this.params.query['isMobile']
  }
  console.log("api_url="+api_url+", Meteor.absoluteUrl()="+Meteor.absoluteUrl());
  
  Meteor.setTimeout(function(){
    if(!hasRes){
      hasEnd = true;
      console.log("res.end: failed");
      res.end('\r\n' + '{"status": "failed"}');
      
      request(import_cancel_url + '/' + slef.params.query['task_id'], function(error, response, body){
        // TODO:
      });
    }
  }, 1000*10);
  
  request({
    method: 'GET',
    uri: api_url
  })
  .on('data', function(data) {
    hasRes = true;
    if(hasEnd)
      return;
      
    try{
      result = JSON.parse(data);
      if(result.status != 'importing'){
        hasEnd = true;
        console.log("res.end: result="+JSON.stringify(result));
        return res.end('\r\n' + JSON.stringify(result));
      }
      console.log("res.write: result="+JSON.stringify(result));
      res.write('\r\n' + JSON.stringify(result));
    }catch(er){
      hasEnd = true;
      console.log("res.end: failed");
      res.end('\r\n' + '{"status": "failed"}');
    }
  })
  .on('end', function(data) {
    hasRes = true;
    if(hasEnd)
      return;
    res.end('\r\n' + JSON.stringify(result));
  });
}, {where: 'server'});


Router.route('/import-cancel/:id', function (req, res, next) {
  res.writeHead(200, {
    'Content-Type' : 'text/html;charset=UTF-8'
  });
  
  console.log('cancel import.');
  if(!this.params.id)
    return res.end('error');
  
  request(import_cancel_url + '/' + this.params.id, function(error, response, body){
    if (!error && response.statusCode == 200)
      res.end('done');
    res.end('error');
  });
}, {where: 'server'});