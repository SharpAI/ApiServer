
if Meteor.isClient
  Meteor.startup ()->
    Accounts.onLogin ()->
      # https://atmospherejs.com/u2622/persistent-session
      # Session.setAuth(key, value)
      # stores a authenticated session variable (persistent + automatic deletion)
      Session.setPersistent('persistentLoginStatus',true)
      Meteor.setTimeout ()->
        console.log("Accounts.onLogin")
        window.updateMyOwnLocationAddress();
      ,3000