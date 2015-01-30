#space 2
if Meteor.isClient
  Template.dashboard.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.dashboard.helpers
    userEmail :->
      Meteor.user().emails[0].address
  Template.dashboard.events
    'click .email' :->
      Router.go '/my_email'
    'click .changePasswd' :->
      Router.go '/my_password'
    'click .back' :->
      Router.go '/user'
    'click .logout':->
      Meteor.logout (msg)->
        console.log msg
      Router.go '/authOverlay'
  Template.my_email.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.my_email.helpers
    userEmail :->
      Meteor.user().emails[0].address
  Template.my_email.events
    'click #btn_save' :->
      Users = Meteor.users
      new_email = [{address: $('#my_edit_email').val(), verified: false}]
      Users.update({_id: Meteor.user()._id}, {$set: {emails: new_email}})
      Router.go '/dashboard'
    'click #btn_back' :->
      Router.go '/dashboard'
  
  Template.my_password.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.my_password.events
    'click #pass_btn_save' :->
      new_pass = $("#my_edit_password").val()
      new_pass_confirm = $("#my_edit_password_confirm").val()
      if new_pass != new_pass_confirm
        PUB.toast "password mismatch!"
        return
      if new_pass
        Meteor.call "changeMyPassword", new_pass, (error, result) ->
          if error
            PUB.toast 'fail to change password!'
          else
            Router.go '/'
          return
      else
        PUB.toast "password could not be empty!"
    'click #pass_btn_back' :->
      Router.go '/dashboard'
