#space 2
if Meteor.isClient
  Template.dashboard.rendered=->
    $('.dashboard').css 'height',($(window).height()-50)
    return
  Template.dashboard.helpers
    userEmail :->
      Meteor.user().emails[0].address
  Template.dashboard.events
    'click .email' :->
      Router.go '/my_email'
    'click .back' :->
      Router.go '/user'
    'click .logout':->
      Meteor.logout (msg)->
        console.log msg
      Router.go '/authOverlay'
  Template.my_email.events
    'click #btn_save' :->
      Router.go '/my_email'
    'click #btn_back' :->
      Router.go '/dashboard'
  Template.my_email.helpers
    userEmail :->
      Meteor.user().emails[0].address
