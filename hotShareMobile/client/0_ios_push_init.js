if (Meteor.isClient) {
  console.log('on isCordova');
  Meteor.startup(function() {
    var onDeviceReady2;
    console.log('on startup');
    if (device.platform === 'iOS') {
      console.log('on IOS');
      this.onNotificationAPN = function(event) {
        console.log('Got message');
        if (event.foreground === '0') {
          console.log('Push notification when background');
          window.refreshMainDataSource();
          return;
        }
        if (event.alert) {
          PUB.toast(event.alert);
          window.plugin.notification.local.cancelAll();
          window.plugin.notification.local.add({
            message: event.alert
          });
          return window.refreshMainDataSource();
        }
      };
      onDeviceReady2 = function() {
        var registerInterval1 = window.setInterval( function(){
        console.log('on onDeviceReady2');
        window.plugins.pushNotification.register(function(result) {
          console.log('Got registrationID ' + result);
          Session.set('registrationID', result);
          Session.set('registrationType', 'iOS');
          window.clearInterval(registerInterval1);
          return window.updatePushNotificationToken('iOS', result);
        }, function(error) {
          return console.log('No Push Notification support in this build error = ' + error);
        }, {
          "badge": "true",
          "sound": "true",
          "alert": "true",
          "ecb": "window.onNotificationAPN"
        });
         },20000 );
      };
      Deps.autorun(function(){
        document.addEventListener("deviceready", onDeviceReady2, false);
      });
    }
  });
}