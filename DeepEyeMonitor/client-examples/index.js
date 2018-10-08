var DDPClient = require("ddp");
WebSocket = require('ws');
var login = require('ddp-login');
var CryptoJS = require("crypto-js");

var ddpClient = new DDPClient({
  // All properties optional, defaults shown
  host : "localhost",
  port : 3000,
  ssl  : false,
  maintainCollections : true,
  ddpVersion : '1'
});

var connectedToServer = false;
function login_with_device_id(device_id, callback){
  var real_pwd = CryptoJS.HmacSHA256(device_id, "sharp_ai98&#").toString()
  console.log(real_pwd)
  login(ddpClient,
    {  // Options below are the defaults
       env: 'METEOR_TOKEN',  // Name of an environment variable to check for a
                             // token. If a token is found and is good,
                             // authentication will require no user interaction.
       method: 'username',    // Login method: account, email, username or token
       account: device_id,        // Prompt for account info by default
       pass: real_pwd,           // Prompt for password by default
       retry: 5,             // Number of login attempts to make
       plaintext: false      // Do not fallback to plaintext password compatibility
                             // for older non-bcrypt accounts
    },
    function (error, userInfo) {
      if (error) {
        // Something went wrong...
        console.log('login error')
      } else {
        // We are now logged in, with userInfo.token as our session auth token.
        token = userInfo.token;
        console.log('login ok:'+token)
      }

      callback && callback(error,userInfo)
    }
  );
}
function connectToMeteorServer(device_id){
  ddpClient.connect(function(error, wasReconnect) {
    // If autoReconnect is true, this callback will be invoked each time
    // a server connection is re-established
    if (error) {
      console.log('DDP connection error!');
      process.exit(-10)
      return;
    }
    if (wasReconnect) {
      console.log('Reestablishment of a connection.');
      connectedToServer = true
      login_with_device_id(device_id,function(error,userInfo){
        if(error){
          console.log(error)
        }
      })
    } else {
      console.log('new connection to meteor server')
      connectedToServer = true
      login_with_device_id(device_id,function(error,userInfo){
        if(error){
          console.log(error)
        }
      })
    }
  })
}
var my_client_id = 'my_device_id'
connectToMeteorServer(my_client_id)
setInterval(function(){
  ddpClient.call('report',[{clientID :my_client_id,test:true}])
},6*1000)
