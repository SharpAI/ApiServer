Template.userProfile.rendered=->
  $('.userProfile').css('min-height',$(window).height())
Template.userProfile.helpers
  profile:->
    Meteor.users.findOne {_id: Session.get("ProfileUserId")}

