if Meteor.isClient
  Session.setDefault("Social.LevelTwo.Me.Menu",'information')
  ###
    me views
  ###
  Template.me.rendered=->
    #$('.me').css('min-height',$(window).height()-90)
  Template.me.helpers
    whichOne:()->
      Session.get("Social.LevelTwo.Me.Menu")
  ###
    Information View
  ###
  Template.information.rendered=->
    document.body.scrollTop = document.body.scrollHeight
  Template.information.helpers
    nickname:()->
      if Meteor.user()
        Meteor.user().profile.fullname || '[无]'
    sex:()->
      if Meteor.user() and Meteor.user().profile.sex
        if Meteor.user().profile.sex is 'male'
          return '男'
        else if Meteor.user().profile.sex is 'female'
          return '女'
      return '[未知]'
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
  Template.setNickname.rendered=->
    $('.showPostsBox').css('display', 'none')
    $('.chatFooter').css('display', 'none')
    $('#postFooter').css('display', 'none')
    $('.chatBoxContent').css('min-height', '0px')
    $('.showBgColor').css('min-height','0px')
    $('body').css('background-color' ,'#EFEFF4')
    $('.text').focus()
  Template.setNickname.destroyed=->
    $('.showPostsBox').css('display', 'block')
    $('.chatFooter').css('display', 'block')
    $('.chatBoxContent').css('min-height',$(window).height()-90)
    $('.showBgColor').css('min-height',$(window).height())
    $('body').css('background-color' ,'#000')
  Template.setNickname.events
    'focus .text':->
      console.log("#comment get focus");
      $('.contactsList .head').css('display' ,'block')
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(true)
    'blur .text':->
      console.log("#comment lost focus");
      $('.contactsList .head').css('display' ,'block')
      if Meteor.isCordova and isIOS
        cordova.plugins.Keyboard.disableScroll(false)
    'click .left-btn':(e)->
      Session.set("Social.LevelTwo.Me.Menu","information")
    'click .right-btn':(e)->
      $('.setNickname-form').submit()
    'submit .setNickname-form': (e)->
      if Meteor.user()
        if e.target.text.value isnt ''
          console.log 'Change Nick Name to ' + $('#my_edit_nickname').val()
          Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.fullname': e.target.text.value}})
          Session.set("Social.LevelTwo.Me.Menu","information")
          
      false
  ###
    Set Sex View
  ###
  Template.setSex.rendered=->
    document.body.scrollTop = document.body.scrollHeight
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
        Session.set("Social.LevelTwo.Me.Menu","information")
    'click .setFemale':(e)->
      if Meteor.user()
        Meteor.users.update({_id: Meteor.user()._id}, {$set: {'profile.sex': 'female'}})
        Session.set("Social.LevelTwo.Me.Menu","information")
    'click .left-btn': (e)->
      Session.set("Social.LevelTwo.Me.Menu","information")