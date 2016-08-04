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
  api_url += '/' + this.params._id + '/' + encodeURIComponent(this.params.url) + '?chunked=true';
  api_url += '&ip='+this.request.connection.remoteAddress;
  if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
          api_url += '&server='+encodeURIComponent(Meteor.absoluteUrl());
  console.log("api_url="+api_url+", Meteor.absoluteUrl()="+Meteor.absoluteUrl());
  
  request({
    method: 'GET',
    uri: api_url
  })
  .on('data', function(data) {
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
    if(hasEnd)
      return;
    res.end('\r\n' + JSON.stringify(result));
  });
}, {where: 'server'});