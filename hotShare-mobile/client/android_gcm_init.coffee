if 0 #Meteor.isCordova
  Meteor.startup ->
    if device.platform is 'android' || device.platform is 'Android' || device.platform is 'amazon-fireos'

      registeredHandle = (e)->
        if ( e.regid.length > 0 )
          console.log("regID = " + e.regid)
          Session.set('registrationID',e.regid);
          Session.set('registrationType','GCM');
          window.updatePushNotificationToken('GCM',e.regid)
      messageHandle = (e)->
        # if this flag is set, this notification happened while we were in the foreground.
        # you might want to play a sound to get the user's attention, throw up a dialog, etc.
        if (e.foreground)
          console.log 'INLINE NOTIFICATION'
          #PUB.toast JSON.stringify(e.payload)
          if e.payload.message
            PUB.toast e.payload.message
            window.plugin.notification.local.add {title: '故事贴',message: e.payload.message}
          # on Android soundname is outside the payload.
          # On Amazon FireOS all custom attributes are contained within payload
          # soundfile = e.soundname || e.payload.sound;
          # if the notification contains a soundname, play it.
          # playing a sound also requires the org.apache.cordova.media plugin
          # my_media = new Media("/android_asset/www/"+ soundfile);
          # my_media.play();
        else
            # otherwise we were launched because the user touched a notification in the notification tray.
          if e.coldstart
            console.log 'COLDSTART NOTIFICATION'
          else
            console.log 'BACKGROUND NOTIFICATION'
        console.log 'MSG: ' + e.payload.message
        console.log 'MSGCNT: ' + e.payload.msgcnt
        console.log 'TIMESTAMP: ' + e.payload.timeStamp

      @onNotification = (e)->
        console.log ('event is ' + e.event)
        switch e.event
          when 'registered' then registeredHandle e
          when 'message' then messageHandle e
          when 'error' then console.log 'Error ' + e.msg
          else console.log 'Unknown, an event was received and we do not know what it is'
      onDeviceReady = ->
        window.plugins.pushNotification.register ->
          console.log 'GCM register call succed'
        , ->
          console.log 'GCM register call failed'
        , {"senderID":"72736982367","ecb":"onNotification"}
      document.addEventListener("deviceready", onDeviceReady, false);
