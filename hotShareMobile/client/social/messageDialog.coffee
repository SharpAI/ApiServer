Template.messageDialog.rendered=->
  this.$('.message').css('min-height',$(window).height()-90)
  Meteor.subscribe("userinfo",@followerId);
  
Template.messageDialog.helpers
  