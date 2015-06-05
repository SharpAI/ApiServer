
if (Meteor.isServer){
  phantom = Meteor.npmRequire('phantom');
  if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
      return this.substring( 0, str.length ) === str;
    }
  }
  var pullFromServer = function(url){
    Meteor.defer(function(){
      //console.log("processing pullFromServer");
      try{
        if (url && url !=='') {
          var requestUrl = '';
          if (url.startsWith("http")) {
            requestUrl = url;
          } else {
            requestUrl = 'http://cdn.tiegushi.com/posts/' + url;
          }
          phantom.create(function (ph) {
            ph.createPage(function (page) {
              page.open(requestUrl, function (status) {
                //console.log("opened post " + status + " url is " + requestUrl);
                ph.exit();
              });
            });
          });
        }
      } catch(error){}}
    );
    return {result:'processing'};
  };
  Meteor.methods({
    "pullFromServer": pullFromServer
  });

  //Meteor.call("pullFromServer","http://www.tiegushi.com/posts/CY9RQnawWnXHDBxLM");
}
