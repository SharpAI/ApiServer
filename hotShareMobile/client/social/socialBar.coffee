if Meteor.isClient
  Session.setDefault("Social.LevelOne.Menu",'discover')
  Session.setDefault("SocialOnButton",'postBtn')
  Template.socialContent.events
    'click .postBtn':->
      #PUB.postPageBack()
      Session.set("SocialOnButton",'postBtn')
      Session.set("Social.LevelOne.Menu",'discover')
      if $('.contactsList .head').is(':visible')
        $('.contactsList .head').fadeOut 300
      document.body.scrollTop = 0
    'click .chatBtn':->
      Session.set("Social.LevelOne.Menu",'chatContent')
      Session.set("SocialOnButton",'chatContent')
    'click .contactsBtn':->
      Session.set("Social.LevelOne.Menu",'contactsList')
      Session.set("SocialOnButton",'contactsList')
      document.body.scrollTop = document.body.scrollHeight
    'click .discoverBtn':->
      Session.set("SocialOnButton",'discover')
      Session.set('momentsitemsLimit', 10);
      Session.set("Social.LevelOne.Menu",'discover')
      document.body.scrollTop = document.body.scrollHeight
    'click .meBtn':->
      Session.set("SocialOnButton",'me')
      Session.set("Social.LevelOne.Menu",'me')
      document.body.scrollTop = document.body.scrollHeight
  Template.socialContent.rendered=->
    $('.chatBoxContent').css('min-height',$(window).height()-90)
  Template.socialContent.helpers
    whichOne : ->
      Session.get('Social.LevelOne.Menu')
    isFocus : (view) ->
      #if Session.equals("Social.LevelOne.Menu",view)
      if Session.equals("SocialOnButton",view)
        "focusColor"
      else
        ""
    isWaitRead: ()->
      MsgSession.find({userId: Meteor.userId(), waitRead: {$gt: 0}}).count() > 0
