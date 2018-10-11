var DDPClient = require("ddp");
WebSocket = require('ws');
var login = require('ddp-login');
var CryptoJS = require("crypto-js");

var ddpClient = new DDPClient({
  // All properties optional, defaults shown
  host : "workaihost.tiegushi.com",
  port : 80,
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
        sub_command_list(device_id)
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
      console.log('Reestablishment of a connection. The status is hard to keep,just restart');

      process.exit(10)
      /*connectedToServer = true
      login_with_device_id(device_id,function(error,userInfo){
        if(error){
          console.log(error)
        }
      })*/
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

function processing_command(id){
  console.log('command is: '+ddpClient.collections.commands[id])
  setTimeout(function(){
    console.log('command done')
    ddpClient.call('cmd_done',[id,'result'])
  },1000)
}

function sub_command_list(client_id){
      /*
     * Observe a collection.
     */
    var observer = ddpClient.observe("commands");
    observer.added = function(id) {
      console.log("[ADDED] to " + observer.name + ":  " + id);
      console.log(ddpClient.collections.commands);
      processing_command(id)
    };
    observer.changed = function(id, oldFields, clearedFields, newFields) {
      console.log("[CHANGED] in " + observer.name + ":  " + id);
      console.log("[CHANGED] old field values: ", oldFields);
      console.log("[CHANGED] cleared fields: ", clearedFields);
      console.log("[CHANGED] new fields: ", newFields);
    };
    observer.removed = function(id, oldValue) {
      console.log("[REMOVED] in " + observer.name + ":  " + id);
      console.log("[REMOVED] previous value: ", oldValue);
    };

    /*
     * Subscribe to a Meteor Collection
     */
    ddpClient.subscribe(
      'commands',                  // name of Meteor Publish function to subscribe to
      [client_id],                       // any parameters used by the Publish function
      function () {             // callback when the subscription is complete
        console.log('commands complete:');
        console.log(ddpClient.collections.commands);
      }
    );
}
var my_client_id ='my_device_id';
connectToMeteorServer(my_client_id)
setInterval(function(){
  ddpClient.call('report',[{clientID :my_client_id,test:true}])
},6*1000)
