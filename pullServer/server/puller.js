
if (Meteor.isServer){
  if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
      return this.substring( 0, str.length ) === str;
    }
  }
  var pullFromServer = function(url){
    Meteor.defer(function(){
      try{
        if (url && url !=='') {
          var requestUrl = '';
          if (url.startsWith("http")) {
            requestUrl = url;
          } else {
            requestUrl = 'http://cdn.tiegushi.com/posts/' + url;
          }

          console.log("processing pullFromServer " + requestUrl);
          Meteor.http.get(requestUrl, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36',
              'Accept-Encoding': 'gzip, deflate, sdch'
            }
          }, function (error, result) {
            if(error) {
              console.log('http get FAILED!');
            } else {
              console.log('http get SUCCES');
              if (result.statusCode === 200) {
                console.log('Status code = 200!');
                //console.log(result.content);
                console.log(result);
              }
            }
          });
          //s.get(requestUrl, function(retval) {console.log('Link('+ requestUrl+') got ' + retval);});
        }
      } catch(error){}}
    );
    return {result:'processing'};
  };
  Meteor.methods({
    "pullFromServer": pullFromServer
  });

  Meteor.call("pullFromServer","http://cdn.tiegushi.com/posts/CY9RQnawWnXHDBxLM");
}
