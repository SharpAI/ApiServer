if Meteor.isClient
  Template.commentBar.rendered=->
    $('.commentBar').css('height',$(window).height())
  Template.commentBar.helpers
    time_diff: (created)->
      GetTime0(new Date() - created)
  Template.commentBar.events
    'click #finish':->
      $('#showComment').css('display',"none")