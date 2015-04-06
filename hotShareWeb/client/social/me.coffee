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
  Template.information.events
    'click .nickname':(e)->
      Session.set("Social.LevelTwo.Me.Menu","setNickname")
  Template.setNickname.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname
  Template.setNickname.events
    'click .cancle':(e)->
      Session.set("Social.LevelTwo.Me.Menu","information")
    'click .confirm':(e)->
      if $('#my_edit_nickname').val()
        console.log 'Change Nick Name to ' + $('#my_edit_nickname').val()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.fullname': $('#my_edit_nickname').val()}})
      Session.set("Social.LevelTwo.Me.Menu","information")