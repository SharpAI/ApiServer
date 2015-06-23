if Meteor.isCordova
  Meteor.startup ->
    if device.platform is 'iOS'
      console.log 'on IOS'
      @onNotificationAPN = (event)->
        console.log('Got message');
        if event.foreground is '0'
          # This push notification was received on background
          # When application open, there's need trigger local
          # notification again.
          console.log ('Push notification when background');
          window.refreshMainDataSource()
          return
        if event.alert
          PUB.toast event.alert
          window.plugin.notification.local.cancelAll()
          window.plugin.notification.local.add {message : event.alert}
          window.refreshMainDataSource()
        #if event.sound
        #  snd = new Media(event.sound)
        #  snd.play()
      onDeviceReady = ->
        window.plugins.pushNotification.register (result)->
            # Your iOS push server needs to know the token before it can push to this device
            # here is where you might want to send it the token for later use.
            console.log('Got registrationID ' + result)
            Session.set('registrationID',result);
            Session.set('registrationType','iOS');
            window.updatePushNotificationToken('iOS',result)
          ,(error)->
            console.log('No Push Notification support in this build error = ' + error)
          ,{
            "badge":"true",
            "sound":"true",
            "alert":"true",
            "ecb": "window.onNotificationAPN"
          }
      document.addEventListener("deviceready", onDeviceReady, false);
