if Meteor.isClient
  Session.setDefault("Social.LevelOne.Menu",'discover')
  Template.socialContent.events
    'click .postBack':->
      PUB.postPageBack()
    'click .chatBtn':->
      Session.set("Social.LevelOne.Menu",'chatContent')
    'click .contactsBtn':->
      Session.set("Social.LevelOne.Menu",'contactsList')
    'click .discoverBtn':->
      Session.set('momentsitemsLimit', 10);
      Session.set("Social.LevelOne.Menu",'discover')
    'click .meBtn':->
      Session.set("Social.LevelOne.Menu",'me')
  Template.socialContent.rendered=->
    $('.chatBoxContent').css('min-height',$(window).height()-90)
  Template.socialContent.helpers
    whichOne : ->
      Session.get('Social.LevelOne.Menu')
    isFocus : (view) ->
      if Session.equals("Social.LevelOne.Menu",view)
        "focusColor"
      else
        ""
    isWaitRead: ()->
      MsgSession.find({userId: Meteor.userId(), waitRead: {$gt: 0}}).count() > 0
