if Meteor.isClient
  Template.commentBar.rendered=->
    $('.commentBar').css('height',$(window).height())