if (Meteor.isClient) {
  Session.set("DocumentTitle",'故事贴');
  Deps.autorun(function(){
    document.title = Session.get("DocumentTitle");
  });

    // added for message from rocket chat iframe
    Meteor.startup(function(){
        window.addEventListener('message', function(e) {
          if(e.data === 'closekeyboard') {
            //cordova.plugins.Keyboard.close();
          }
          else if(e.data === 'closechatpage') {
            //cordova.plugins.Keyboard.close();
            $("#rocketChat").fadeOut(400);
            $(".showBgColor").fadeIn(400);
            $("#chatSwitch").show()
          }
        }, false);  
    });
}