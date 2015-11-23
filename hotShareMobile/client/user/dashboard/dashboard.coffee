#space 2
if Meteor.isClient
  Template.dashboard.rendered=->
    if Session.get('dashboardHeight') is undefined
      Session.set('dashboardHeight', $(window).height())
    $('.dashboard').css 'min-height', Session.get('dashboardHeight')
    return
  Template.dashboard.helpers
    userEmail :->
      if Meteor.user()
        Meteor.user().emails[0].address
      else
        ''
    anonymous :->
      if Meteor.user()
        Meteor.user().profile.anonymous
      else
        ''
  Template.dashboard.events
    'click .email' :->
      Router.go '/my_email'
    'click .changePasswd' :->
      Router.go '/my_password'
    'click .notice' :->
      Router.go '/my_notice'
    'click .about' :->
      Router.go '/my_about'
    'click .back' :->
      Router.go '/user'
    'click .logout':(e)->
      e.target.innerText="正在退出登录..."
      Meteor.logout (msg)->
        PostsSearch.cleanHistory()
        Session.setPersistent('persistentLoginStatus',false)
        Session.setPersistent('persistentFeedsForMe',null)
        Session.setPersistent('persistentMyFollowedPosts',null)
        Session.setPersistent('myFollowedByCount',0)
        Session.setPersistent('mySavedDraftsCount',0)
        Session.setPersistent('myPostsCount',0)
        Session.setPersistent('myFollowToCount',0)
        Session.setPersistent('persistentProfileIcon',null)
        Session.setPersistent('persistentProfileName',null)
        Session.setPersistent('persistentMySavedDrafts',null)
        Session.setPersistent('persistentMyOwnPosts',null)
        #console.log msg
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
      Meteor.subscribe('allUsers');
      userExist = Users.find({emails: new_email}).fetch()[0]
      if userExist != undefined
        PUB.toast "邮箱地址未修改！"
#        PUB.toast "邮箱地址已存在！"
      else
        Users.update {_id: Meteor.user()._id}, {$set: {emails: new_email}},  (error, result) ->
          if error
            PUB.toast "邮箱地址已存在！"
            return
          else
            PUB.toast "邮箱修改成功！"
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
        PUB.toast "两次填写的密码不一致!"
        return
      else if new_pass.length<6
        PUB.toast "密码至少要6位";
        return
      if new_pass
        Meteor.call "changeMyPassword", new_pass, (error, result) ->
          if error
            PUB.toast '修改密码失败!'
          else
            navigator.notification.confirm('请重新登录!', (r)->
              if r is 1
                Router.go '/authOverlay'
            , '修改密码成功', ['确定']);
          return
      else
        PUB.toast "密码不能为空!"
    'click #pass_btn_back' :->
      Router.go '/dashboard'

  Template.my_notice.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.my_notice.helpers
    isIOS :->
      if device.platform is 'iOS'
        true
      else
        false
  Template.my_notice.events
    'click #about_btn_back' :->
      Router.go '/dashboard'
  Template.my_about.helpers
    version:->
      if isIOS.true is false
        return version_of_build
      if Meteor.isCordova and isIOS and window.plugins.appsetup
        window.plugins.appsetup.getVersion((version)->
          if version and version isnt ''
            Session.set('AppVersion',version)
          else
            Session.set('AppVersion',version_of_build)
        ()->
          Session.set('AppVersion',version_of_build)
        )
        return Session.get('AppVersion')
      version_of_build
  Template.my_about.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.my_about.events
    'click #about_btn_back' :->
      Router.go '/dashboard'
