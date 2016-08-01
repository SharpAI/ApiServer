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
  
  request({
    method: 'GET',
    uri: api_url + '/' + this.params._id + '/' + encodeURIComponent(this.params.url) + '?chunked=true'
  })
  .on('data', function(data) {
    if(hasEnd)
      return;
      
    try{
      result = JSON.parse(data);
      if(result.status != 'importing'){
        hasEnd = true;
        return res.end('\r\n' + JSON.stringify(result));
      }
      res.write('\r\n' + JSON.stringify(result));
    }catch(er){
      hasEnd = true;
      res.end('\r\n' + '{"status": "failed"}');
    }
  })
  .on('end', function(data) {
    if(hasEnd)
      return;
      
    res.end('\r\n' + JSON.stringify(result));
  });
}, {where: 'server'});