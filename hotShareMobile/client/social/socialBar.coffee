if Meteor.isClient
  Session.setDefault("Social.LevelOne.Menu",'contactsList')
  Template.socialContent.events
    'click .chatBtn':->
      Session.set("Social.LevelOne.Menu",'chatContent')
    'click .contactsBtn':->
      Session.set("Social.LevelOne.Menu",'contactsList')
    'click .discoverBtn':->
      Session.set("Social.LevelOne.Menu",'discover')
    'click .meBtn':->
      Session.set("Social.LevelOne.Menu",'me')
  Template.socialContent.rendered=->
    $('.chatBoxContent').css('min-height',$(window).height()-90)
    
    if Session.get('Social.LevelOne.Menu') is 'messageDialog'
      Session.set("Social.LevelOne.Menu", 'chatContent')
  Template.socialContent.helpers
    whichOne : ->
      Session.get('Social.LevelOne.Menu')
    isFocus : (view) ->
      if Session.equals("Social.LevelOne.Menu",view)
        "focusColor"
      else
        ""
