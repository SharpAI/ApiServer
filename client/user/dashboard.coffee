#space 2
if Meteor.isClient
  Template.dashboard.rendered=->
    $('.dashboard').css 'height',($(window).height()-40)
    return
  Template.dashboard.helpers
    userEmail :->
      Meteor.user().emails[0].address
  Template.dashboard.events
    'click .back' :->
      Router.go '/user'
    'click .logout':->
      Meteor.logout (msg)->
        console.log msg
      Router.go '/authOverlay'