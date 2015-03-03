if (Meteor.isCordova) {
    /**
    * Get registration ID in Cordova
    *
    * @method updateRegistrationID
    * @param {Function} callback
    * @return callback(got_registration_id,registration_id)
    */
    var updateRegistrationID = function (callback){
        window.plugins.jPushPlugin.getRegistrationID(function(data) {
          console.log("JPushPlugin:registrationID is "+data);
          if(callback === null || callback=== undefined){
            return;
          }
          if(data ===null || data ===undefined){
            callback(false,null);
            return;
          }
          if(data===''){
            console.log('RegisterationID is not set');
            callback(false,null);
          } else {
            callback(true,data);
          }
        });
    }

    var openNotificationInAndroidCallback = function(data){
      try{
        console.log("JPushPlugin:openNotificationInAndroidCallback");
        console.log(data);
        data=data.replace('"{','{').replace('}"','}');
        var bToObj=JSON.parse(data);
        var message = bToObj.message;
        var extras = bToObj.extras;

        var type = extras["cn.jpush.android.EXTRA"]["type"];
        switch(type){
         case "comment":
            if(Meteor.user()){
              var postId = extras["cn.jpush.android.EXTRA"]["postId"];
              PUB.page('/posts/'+postId);
            }
            break;
          case "read":
            if(Meteor.user()){
              var postId = extras["cn.jpush.android.EXTRA"]["postId"];
              PUB.page('/posts/'+postId);
            }
            break;
        }
      }
      catch(exception){
        console.log("JPushPlugin:openCallback "+exception);
      }
    }

    /**
    * Called when receive push notification from Server and APP is running
    *
    * @method pushNotificationCallback
    * @param {Object} data Push notification context
    */
    var pushNotificationCallback = function(data){
      try{
        console.log("JPushPlugin:receiveMessageInAndroidCallback");
        console.log(data);
        data=data.replace('"{','{').replace('}"','}');
        var bToObj=JSON.parse(data);
        var message = bToObj.message;
        var extras = bToObj.extras;

        console.log(message);
        console.log(extras['cn.jpush.android.MSG_ID']);
        console.log(extras['cn.jpush.android.CONTENT_TYPE']);
        console.log(extras['cn.jpush.android.EXTRA']);
      }
      catch(exception){
        console.log("JPushPlugin:pushCallback "+exception);
      }
    }

  Meteor.startup(function(){
    document.addEventListener("deviceready", onDeviceReady, false);
    // PhoneGap加载完毕
    function onDeviceReady() {
        if(device.platform === 'Android' ){
          window.plugins.jPushPlugin.receiveMessageInAndroidCallback = pushNotificationCallback;
          window.plugins.jPushPlugin.openNotificationInAndroidCallback = openNotificationInAndroidCallback;
          window.plugins.jPushPlugin.init();
          var registerInterval = window.setInterval( function(){
              updateRegistrationID(function(got,registrationID){
              if(got===true){
                console.log('Got registrationID ' + registrationID);
                Session.set('registrationID',registrationID);
                Session.set('registrationType','JPush');
                window.clearInterval(registerInterval);
                updatePushNotificationToken('JPush',registrationID);
              } else {
                console.log("Didn't get registrationID, need retry later");
              }
            })
          },20000 );
        }
    }
  });
}

if (Meteor.isClient) {
    Meteor.startup(function () {
      updatePushNotificationToken = function(type,token){
        Deps.autorun(function(){
          if(Meteor.user()){
             if(token != Session.get("token"))
             {
               console.log("type:"+type+";token:"+token);
               Meteor.users.update({_id: Meteor.user()._id}, {$set: {type: type, token: token}});
               Session.set("token", token);
             }
          }
        });
      }
    });
}

