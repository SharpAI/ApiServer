if Meteor.isCordova
  Meteor.startup ->
    Session.set('uuid',device.uuid)
    if device.platform is 'iOS'
      console.log 'on IOS'
      window.onNotificationAPN = (event)->
        if event.foreground is '0'
          # This push notification was received on background
          # When application open, there's need trigger local
          # notification again.
          return
        if event.alert
          console.log 'alert is ' + event.alert
        if event.sound
          snd = new Media(event.sound)
          snd.play()
      window.plugins.pushNotification.register (result)->
          # Your iOS push server needs to know the token before it can push to this device
          # here is where you might want to send it the token for later use.
          console.log('Got registrationID ' + result)
          Session.set('registrationID',result);
          Session.set('registrationType','iOS');
          window.clearInterval(result);
          #updatePushNotificationToken('iOS',result)
        ,(error)->
          console.log('No Push Notification support in this build error = ' + error)
        ,{
          "badge":"true",
          "sound":"true",
          "alert":"true",
          "ecb": "onNotificationAPN"
        }