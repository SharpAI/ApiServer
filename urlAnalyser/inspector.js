/**
 * Created by simba on 6/27/16.
 */
// injection technique borrowed from http://stackoverflow.com/questions/840240/injecting-jquery-into-a-page-fails-when-using-google-ajax-libraries-api
console.log('inject code');
//window.onload = function() {
    console.log('inject code');
    window.$ = window.jQuery = require('./jquery-2.1.4.min.js');
    $(document).ready(function() {
        //require('coffee-script').register();
        console.log('1');
        require('./extract.coffee');
        console.log('2');
        var url_analyser=require('./url_analyser.coffee');
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
        if(navigator.userAgent.indexOf(' (GetHeader)') != -1){
          var imgs = $(document.body.innerHTML).find('img[src]');
          var header = {
            status: 'importing',
            title: document.title,
            mainImg: imgs && imgs.length > 0 ? imgs[0].src : '',
            remark: document.body.innerText ? document.body.innerText.substr(0, 100) : ''
          };
          window.document.body.insertAdjacentHTML( 'beforeBegin', '<div id="detected_json_from_header" style="color:blue;"> With some data... </div>' );
          window.detected_json_from_header = header;
        }else{
          analyserHTML(window.location.href,returnJson,function(result){
              window.document.body.insertAdjacentHTML( 'beforeBegin', '<div id="detected_json_from_gushitie" style="color:blue;"> With some data...</div>' );
              window.detected_json_from_gushitie=result;
              /*const {ipcRenderer} = require('electron');
              //console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

             ipcRenderer.send('analyse-done', result);
             console.log(result)*/
        });
      }
    });
//};
console.log('inject code');
