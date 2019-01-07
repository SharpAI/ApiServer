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
        console.log("##RDBG data: " + JSON.stringify(data));
        SimpleChat.onPushNotifacation();

        bToObj = data;
        var message = bToObj.message;
        var extras = bToObj.extras;

        var type = extras["cn.jpush.android.EXTRA"]["type"];
        switch(type){
         case "dailyrecommend":
            var postId = extras["cn.jpush.android.EXTRA"]["postId"];
            console.log('##RDBG dailyrecommend postid: ' + postId);
            Meteor.subscribe('postInfoById', postId, {
                onStop: function() {},
                onReady: function(){
                    console.log("##RDBG dailyrecommend onReady");
                    PUB.page('/posts/'+postId);
                }
            });
            break;
         case "comment":
            if(Meteor.user()){
              //var postId = extras["cn.jpush.android.EXTRA"]["postId"];
              if(Meteor.user().profile.waitReadCount > 0)
                  Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
              Router.go('/bell');
            }
            break;
          case "read":
            if(Meteor.user()){
              //var postId = extras["cn.jpush.android.EXTRA"]["postId"];
              //PUB.page('/posts/'+postId);
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
        console.log("##RDBG data: " + JSON.stringify(data));
        SimpleChat.onPushNotifacation();
        /*data=data.replace('"{','{').replace('}"','}');
        var bToObj=JSON.parse(data);
        var message = bToObj.message;
        var extras = bToObj.extras;

        console.log(message);
        console.log(extras['cn.jpush.android.MSG_ID']);
        console.log(extras['cn.jpush.android.CONTENT_TYPE']);
        console.log(extras['cn.jpush.android.EXTRA']);*/
      }
      catch(exception){
        console.log("JPushPlugin:pushCallback "+exception);
      }
    }

  Meteor.startup(function(){
      if(device.platform === 'Android' ){
        // No longer jpush has call_native
        /*
        document.addEventListener("pause", onPause, false);
        document.addEventListener("resume", onResume, false);
        function onPause(){
          window.plugins.jPushPlugin.call_native("onPause", new Array(), null);
        }
        function onResume(){
          window.plugins.jPushPlugin.call_native("onResume", null, null);
        }
        */
        document.addEventListener("deviceready", onDeviceReady, false);
        // PhoneGap加载完毕
        function onDeviceReady() {
          Session.set('uuid',device.uuid);
          window.plugins.jPushPlugin.receiveMessageInAndroidCallback = pushNotificationCallback;
          window.plugins.jPushPlugin.openNotificationInAndroidCallback = openNotificationInAndroidCallback;
          window.plugins.jPushPlugin.init();
          window.plugins.jPushPlugin.setBasicPushNotificationBuilder();
          var registerInterval = window.setInterval( function(){
              updateRegistrationID(function(got,registrationID){
              if(got===true){
                console.log('Got registrationID ' + registrationID);
                var registerType = Session.get('registrationType');
                if ( !registerType || registerType === 'JPush'){
                  Session.set('registrationID',registrationID);
                  Session.set('registrationType','JPush');
                  window.clearInterval(registerInterval);
                  window.updatePushNotificationToken('JPush',registrationID);
                } else {
                    window.clearInterval(registerInterval);
                }
              } else {
                if(Session.get('registrationType') && Session.get('registrationID')){
                    window.clearInterval(registerInterval);
                    return;
                }
                console.log("Didn't get registrationID, need retry later");
              }
            })
          },20000 );
        }
      }
  });
}
