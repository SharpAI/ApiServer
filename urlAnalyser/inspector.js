/**
 * Created by simba on 6/27/16.
 */
// injection technique borrowed from http://stackoverflow.com/questions/840240/injecting-jquery-into-a-page-fails-when-using-google-ajax-libraries-api
console.log('inject code');
window.onload = function() {
    console.log('inject code');
    window.$ = window.jQuery = require('./jquery-2.1.4.min.js');
    $(document).ready(function() {
        require('coffee-script').register();
        require('./extract');
        var url_analyser=require('./url_analyser');
        var analyserHTML=url_analyser.analyserHTML;
        var returnJson = {};
        if(document.title){
            returnJson["title"] = document.title;
        }
        if(location.host){
            returnJson["host"] = location.host;
        }
        if(document.body){
            returnJson["body"] = document.body.innerHTML;
            returnJson["bodyLength"] = document.body.innerHTML.length;
        }
        if(window.location.protocol){
            returnJson["protocol"] = window.location.protocol;
        }
        console.log(returnJson);
        analyserHTML(window.location.href,returnJson,function(result){
            console.log(result)
        })
    });
};
console.log('inject code');