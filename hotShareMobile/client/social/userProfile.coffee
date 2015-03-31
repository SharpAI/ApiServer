Template.userProfile.rendered=->
  $('.userProfile').css('min-height',$(window).height())
Template.userProfile.helpers
  profile:->
    Meteor.users.findOne {_id: Session.get("ProfileUserId")}
Template.userProfile.events
  'click #sendChatMessage': ()->
    Session.set("ProfileUserId", @followerId)
    Meteor.subscribe("userinfo",@followerId);
    Session.set("Social.LevelOne.Menu", 'messageDialog')