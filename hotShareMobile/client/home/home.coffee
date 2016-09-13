#space 2
if Meteor.isClient
  Template.home.helpers
    wasLogon:()->
      Session.get('persistentLoginStatus')
    isCordova:()->
      Meteor.isCordova
    isFirstLog:()->
      Session.get('isFlag');
  Template.home.events
    'click #follow': (event)->
       Router.go '/searchFollow'
    'click .clickHelp':(event)->
      PUB.page '/help'
  Template.home.rendered=->
    flag = window.localStorage.getItem("firstLog") == 'first'
    Session.set('isFlag', !flag)

    platform = if Blaze._globalHelpers.isIOS() then 'ios' else (if Blaze._globalHelpers.isAndroid() then 'android' else 'others')
    version = Versions.findOne({})

    if version and version[platform]
      latestVersion = version[platform]
    else
      latestVersion = version_of_build

    if latestVersion isnt version_of_build and latestVersion isnt window.localStorage.getItem("latestVersion")
      window.localStorage.setItem("latestVersion", latestVersion)
      Session.set('latestVersionAlert', true)
    else
      Session.set('latestVersionAlert', false)

Tracker.autorun((t)->
  if !Session.get('isFlag') and Session.get('latestVersionAlert')
    t.stop()
    setTimeout(()->
      Dialogs.alert('我们已为您备好更有趣新版本，记得去更新哦~', null, '新版本提示', '好的')
    , 1000)
);
