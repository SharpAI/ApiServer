var Nightmare = require('nightmare');

module.exports = {
  format_pub: function(hotshare_web, id, callback){
    var nightmare = Nightmare({ show: true , openDevTools: true});
    var userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_2 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12D508 (5752533504)';
    
    // console.log(hotshare_web + '/add/' + id);
    nightmare
      .useragent(userAgent)
      .goto(hotshare_web + '/add/' + id)
      .wait('#format-post-pub-wait')
      .evaluate(function () {
        return window.format_post_pub_wait;
      })
      .end()
      .then(function (result) {
        // console.log(result);
        callback && callback(result);
      });
  }
};