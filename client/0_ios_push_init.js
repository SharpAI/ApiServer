if (Meteor.isClient) {
  console.log('on isCordova');
  Meteor.startup(function () {
    var onDeviceReady2;
    console.log('on startup');
    if (device.platform === 'iOS') {
      console.log('on IOS');
      /*
      this.onNotificationAPN = function(event) {
        console.log('Got message');
        if(event.badge){
           Session.set('waitReadCount', event.badge);
        }
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
      };*/
      onDeviceReady2 = function () {
        var registerInterval1 = window.setInterval(function () {
          console.log('on onDeviceReady2');
          var push = PushNotification.init({
            ios: {
              alert: "true",
              badge: "true",
              sound: "true",
              clearBadge: "true"
            }
          });

          push.on('registration', function (data) {
            // data.registrationId
            result = data.registrationId;
            console.log('Got registrationID ' + result);
            Session.set('registrationID', result);
            Session.set('registrationType', 'iOS');
            localStorage.setItem('registrationID', result);
            window.clearInterval(registerInterval1);
            return window.updatePushNotificationToken('iOS', result);
          });

          push.on('notification', function (data) {
            // data.message,
            // data.title,
            // data.count,
            // data.sound,
            // data.image,
            // data.additionalData

            console.log('Got message');
            SimpleChat.onPushNotifacation();
            if (data.count) {
              Session.set('waitReadCount', data.count);
            }
            if(Meteor.user().profile.waitReadCount > 0){
              Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.waitReadCount': 0}});
            }
            if (data.additionalData.foreground === false) {
              console.log('Push notification when background');
              window.refreshMainDataSource();
              return;
            }
            if (data.message) {
              PUB.toast(data.message);
              return window.refreshMainDataSource();
            }
          });

          push.on('error', function (e) {
            // e.message
            return console.log('No Push Notification support in this build error = ' + e.message);
          });
          /*window.plugins.pushNotification.register(function(result) {
            console.log('Got registrationID ' + result);
            Session.set('registrationID', result);
            Session.set('registrationType', 'iOS');
            localStorage.setItem('registrationID', result);
            window.clearInterval(registerInterval1);
            return window.updatePushNotificationToken('iOS', result);
          }, function(error) {
            return console.log('No Push Notification support in this build error = ' + error);
          }, {
            "badge": "true",
            "sound": "true",
            "alert": "true",
            "ecb": "window.onNotificationAPN"
          });*/
        }, 20000);
      };
      Deps.autorun(function () {
        document.addEventListener("deviceready", onDeviceReady2, false);
        Meteor.setTimeout(function () {
          console.log('localstorageTimeout');
          if (Session.get('registrationID') == '' || Session.get('registrationID') == undefined && localStorage.getItem('registrationID')) {
            console.log(localStorage.getItem('registrationID'));
            window.updatePushNotificationToken('iOS', localStorage.getItem('registrationID'));
          }
        }, 2000);
      });
    }
  });
}