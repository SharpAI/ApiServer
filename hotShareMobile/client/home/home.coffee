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

