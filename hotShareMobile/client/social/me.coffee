if Meteor.isClient
  Session.setDefault("Social.LevelTwo.Me.Menu",'information')
  ###
    me views
  ###
  Template.me.rendered=->
    $('.me').css('min-height',$(window).height()-90)
  Template.me.helpers
    whichOne:()->
      Session.get("Social.LevelTwo.Me.Menu")
  ###
    Information View
  ###
  Template.information.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname
    sex:()->
      if Meteor.user() and Meteor.user().profile.sex
        if Meteor.user().profile.sex is 'male'
          return '男'
        else if Meteor.user().profile.sex is 'female'
          return '女'
      return ''
  Template.information.events
    'click .nickname':(e)->
      Session.set("Social.LevelTwo.Me.Menu","setNickname")
    'click .sex':(e)->
      Session.set("Social.LevelTwo.Me.Menu","setSex")
  ###
    Set Nickname View
  ###
  Template.setNickname.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname
  Template.setNickname.events
    'click .cancle':(e)->
      Session.set("Social.LevelTwo.Me.Menu","information")
    'click .confirm':(e)->
      if Meteor.user()
        if $('#my_edit_nickname').val()
          console.log 'Change Nick Name to ' + $('#my_edit_nickname').val()
          Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.fullname': $('#my_edit_nickname').val()}})
      Session.set("Social.LevelTwo.Me.Menu","information")
  ###
    Set Sex View
  ###
  Template.setSex.helpers
    isMale:()->
      if Meteor.user()
        return Meteor.user().profile.sex is 'male'
      return false
    isFemale:()->
      if Meteor.user()
        return Meteor.user().profile.sex is 'female'
      return false
  Template.setSex.events
    'click .setMale':(e)->
      if Meteor.user()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.sex': 'male'}})
    'click .setFemale':(e)->
      if Meteor.user()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.sex': 'female'}})
    'click .confirm': (e)->
      Session.set("Social.LevelTwo.Me.Menu","information")