Template.userProfile.rendered=->
  $('.userProfile').css('min-height',$(window).height()-90)
  $('.viewPostImages ul li').css('height',$(window).width()*0.168)
Template.userProfile.helpers
  profile:->
    Meteor.users.findOne {_id: Session.get("ProfileUserId")}
Template.userProfile.events
  'click #sendChatMessage': ()->
    Meteor.subscribe("userinfo",Session.get("ProfileUserId"));
    Session.set("Social.LevelOne.Menu", 'messageDialog')
