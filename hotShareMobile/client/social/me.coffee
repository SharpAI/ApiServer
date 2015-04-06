if Meteor.isClient
  Session.setDefault("Social.LevelTwo.Me.Menu",'information')
  Template.me.rendered=->
    $('.me').css('min-height',$(window).height()-90)
  Template.me.helpers
    whichOne:()->
      Session.get("Social.LevelTwo.Me.Menu")
  Template.information.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname
    sex:()->
      if Meteor.user()
        Meteor.user().profile.sex