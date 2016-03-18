if (Meteor.isClient) {
  Meteor.startup(function() {
    return Accounts.onLogin(function() {
      if (Meteor.user().profile["new"] === true) {
        Session.setPersistent('persistentLoginStatus', false);
      } else {
        Session.setPersistent('persistentLoginStatus', true);
      }
      return Meteor.setTimeout(function() {
        console.log("Accounts.onLogin");
        window.updateMyOwnLocationAddress();
        if (device.platform === 'iOS' && localStorage.getItem('registrationID') == null ) {
          var registerInterval1 = window.setInterval( function(){
            console.log('on push notification init');
            window.plugins.pushNotification.register(function(result) {
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
            });
           },20000 );
        }
        if (Session.get('registrationID') === void 0 && localStorage.getItem('registrationID') && device.platform === 'iOS') {
          console.log(localStorage.getItem('registrationID'));
          return window.updatePushNotificationToken('iOS', localStorage.getItem('registrationID'));
        }
      }, 3000);
    });
  });
}