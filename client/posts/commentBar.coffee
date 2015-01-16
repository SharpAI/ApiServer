if Meteor.isClient
  Template.commentBar.rendered=->
    $('.commentBar').css('height',$(window).height())
  Template.commentBar.events
    'click #finish':->
      $('#showComment').css('display',"none")