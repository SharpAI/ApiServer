
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
            //If passed the post ID, add prefix. Post ID will be easier if changed the domain name of CDN,
            //just need upgrade this small server instead of the whole website server.
            requestUrl = 'http://cdn.tiegushi.com/posts/' + url;
          }

          Meteor.http.get(requestUrl, {
            // The Accept-Encoding gzip is the most important. Without this, the response will have no inject-data.
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36',
              'Accept-Encoding': 'gzip, deflate, sdch'
            }
          });
        }
      } catch(error){}}
    );
    return {result:'processing'};
  };
  Meteor.methods({
    "pullFromServer": pullFromServer
  });
}
