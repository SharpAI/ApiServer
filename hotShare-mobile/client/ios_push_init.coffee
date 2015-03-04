if Meteor.isCordova
  Meteor.startup ->
    if device.platform is 'iOS'
      console.log 'on IOS'
      @onNotificationAPN = (event)->
        if event.foreground is '0'
          # This push notification was received on background
          # When application open, there's need trigger local
          # notification again.
          return
        if event.alert
          PUB.toast event.title + event.alert
          window.plugin.notification.local.add {title: event.title,message : event.alert}
        #if event.sound
        #  snd = new Media(event.sound)
        #  snd.play()
      onDeviceReady = ->
        window.plugin.notification.local.hasPermission (granted)->
          console.log('Permission has been granted: ' + granted)
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