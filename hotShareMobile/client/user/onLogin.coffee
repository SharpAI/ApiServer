
if Meteor.isClient
  Meteor.startup ()->
    Accounts.onLogin ()->
      # https://atmospherejs.com/u2622/persistent-session
      # Session.setAuth(key, value)
      # stores a authenticated session variable (persistent + automatic deletion)
      if Meteor.user().profile.new is true
        Session.setPersistent('persistentLoginStatus',false)
      else
        Session.setPersistent('persistentLoginStatus',true)
      Meteor.setTimeout ()->
        console.log("Accounts.onLogin")
        window.updateMyOwnLocationAddress()
        if Session.get('registrationID') is undefined and localStorage.getItem('registrationID') and device.platform is 'iOS'
          console.log( localStorage.getItem('registrationID'));
          window.updatePushNotificationToken('iOS', localStorage.getItem('registrationID'))
      ,3000