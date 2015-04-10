if (Meteor.isCordova) {
    window.updatePushNotificationToken = function(type,token){
        Deps.autorun(function(){
            if(Meteor.user()){
                if(token != Session.get("token"))
                {
                    console.log("type:"+type+";token:"+token);
                    Meteor.users.update({_id: Meteor.user()._id}, {$set: {type: type, token: token}});
                    Session.set("token", token);
                }
            } else {
                Session.set("token", '');
            }
        });
    }
  Meteor.startup(function(){
    document.addEventListener("deviceready", onDeviceReady, false);
    // PhoneGap加载完毕
    function onDeviceReady() {
        // 按钮事件
        document.addEventListener("backbutton", eventBackButton, false); // 返回键
        document.addEventListener("pause", eventPause, false);//挂起
    }
    
    function eventPause(){
      if(withAutoSavedOnPaused) {
          if (location.pathname === '/add') {
              Template.addPost.__helpers.get('saveDraft')()
          }
      }
    }

    function eventBackButton(){
      // 编辑post时回退
        if(withAutoSavedOnPaused) {
            if (location.pathname === '/add') {
                Template.addPost.__helpers.get('saveDraft')()
            }
        }
      
      var currentRoute = Router.current().route.getName();
      if (currentRoute == undefined || currentRoute =="search" || currentRoute =="add" || currentRoute =="bell" || currentRoute =="user" || currentRoute == "authOverlay") {
        window.plugins.toast.showShortBottom('再点击一次退出!');
        document.removeEventListener("backbutton", eventBackButton, false); // 注销返回键
        document.addEventListener("backbutton", exitApp, false);// 绑定退出事件
        // 3秒后重新注册
        var intervalID = window.setInterval(function() {
            window.clearInterval(intervalID);
            document.removeEventListener("backbutton", exitApp, false); // 注销返回键
            document.addEventListener("backbutton", eventBackButton, false); // 返回键
        }, 3000);
      }else{
        history.back();
      }
    }

    function exitApp() {
        navigator.app.exitApp();
    }
  });
}

if (Meteor.isClient) {
  Session.set("DocumentTitle",'故事贴');
  Deps.autorun(function(){
    document.title = Session.get("DocumentTitle");
  });
}