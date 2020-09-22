#space 2
if Meteor.isClient
  Template.dashboard.rendered=->
    if Session.get('dashboardHeight') is undefined
      Session.set('dashboardHeight', $(window).height())
    $('.dashboard').css 'min-height', Session.get('dashboardHeight')
    $('body').css('height', 'auto')
  Template.dashboard.onDestroyed ()->
    $('body').css('height', '100%')
  Template.dashboard.helpers
    showFollowTips: ->
      if Meteor.user() and Meteor.user().profile and Meteor.user().profile.followTips
          return Meteor.user().profile.followTips isnt false
      else
          false
    userEmail :->
      address = ''
      if Meteor.user() and Meteor.user().emails
        if Meteor.user().emails[0] and Meteor.user().emails[0].address
          address = Meteor.user().emails[0].address
      return address
    anonymous :->
      if Meteor.user()
        Meteor.user().profile.anonymous
      else
        ''
    allowLanguageSetting:->
      if withLanguageSetting
       return true
      else
       return false
    isEnglish: ->
      if Cookies.check("display-lang")
        return Cookies.get("display-lang") is 'en'
      else
        return false
    newVersion: ->
      version_of_build
    inDevMode: ->
      devMode = false
      ldev = Session.get('inDevMode')
      if ldev is null or ldev is undefined
        ldev = localStorage.getItem('inDevMode')
      if ldev is true or ldev is 'true'
        devMode = true
      Session.set('inDevMode', devMode);
      return devMode
    isLatestVersion: ->
      # version = Versions.findOne({})
      if checkNewVersion()
        return false
      else
        return true
  addDashboardIntoHistory = ()->
    history = []
    history.push {
        view: 'dashboard'
        scrollTop: 0
    }
    Session.set "history_view", history
  Template.dashboard.events
    'click .readFollowTips': ->
      Meteor.users.update(
        {_id: Meteor.userId()}
        {$set: {'profile.followTips': !(Meteor.user().profile.followTips isnt false)}}
      )
    'click .email' :->
      addDashboardIntoHistory()
      Router.go '/my_email'
    'click .accounts-management' :->
      addDashboardIntoHistory()
      Router.go '/my_accounts_management'
    'click .changePasswd' :->
      addDashboardIntoHistory()
      Router.go '/my_password'
    'click .blacklist' :->
      addDashboardIntoHistory()
      Router.go '/my_blacklist'
    'click .notice' :->
      addDashboardIntoHistory()
      Router.go '/my_notice'
    'click .language' :->
      addDashboardIntoHistory()
      Router.go '/display_lang'
    'click .devmode' :->
      old_dev = false
      old_val = Session.get("inDevMode")
      if old_val is false
        old_dev = true
      Session.set("inDevMode", old_dev)
      localStorage.setItem('inDevMode', old_dev)
    'click .update' :->
      console.log '##RDBG update clicked'
      #$('#updateToLatestVersion').modal('show')
    'click #updateToLatestVersion .btn-primary' :->
      window.location.href = 'http://180.153.105.143/imtt.dd.qq.com/16891/346CBF0E04862CA542EA8AD714643FB6.apk?mkey=57d128030673c190&f=188a&c=0&fsname=org.hotshare.everywhere_1.3.10_103102.apk&hsr=4d5s&p=.apkhttp://a.app.qq.com/o/simple.jsp?pkgname=org.hotshare.everywhere'
      setTimeout(()->
        $("#updateToLatestVersion .btn-default").trigger('click');
      , 200)
    'click .about' :->
      addDashboardIntoHistory()
      Router.go '/my_about'
    'click .back' :->
      Router.go '/user'
    'click .logout':(e)->
      e.target.innerText="正在退出登录..."
      thisUser = Meteor.user()
      Meteor.call('updatePushToken' ,{type: thisUser.type, token: thisUser.token,userId:''});
#      Meteor.users.update({_id: thisUser._id}, {$set: {type: '', token: ''}})
      Meteor.logout (msg)->
        Session.setPersistent('persistentLoginStatus',false)
      Router.go '/loginForm'
  Template.my_email.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    return
  Template.my_email.helpers
    userEmail :->
      Meteor.user().emails[0].address
  Template.my_email.events
    'click #btn_save' :->
      Users = Meteor.users
      #正则验证邮箱格式
      my_edit_email = $('#my_edit_email').val()
      ret = my_edit_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      if not ret
        PUB.toast '无效邮箱地址!'
        return
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
  Template.my_password.helpers
    showSaveBtn :->
      if Session.get('changePasswordSaveBtnClicked') is true
        false
      else
        true
    hasnick :->
      if Meteor.user() and Meteor.user().profile and Meteor.user().profile.fullname and Meteor.user().profile.fullname isnt ''
        true
      else
        false
    hasemail :->
      if Meteor.user() and Meteor.user().emails and Meteor.user().emails[0] and Meteor.user().emails[0].address
        true
      else
        false
    userEmail :->
      Meteor.user().emails[0].address
    newpassword :->
      $("#my_edit_password").val()
    currentuser :->
      Meteor.user()
  Template.my_password.events
    'click #pass_btn_save' :->
      Session.set('changePasswordSaveBtnClicked', true)
      old_pass = $("#my_old_password").val()
      new_pass = $("#my_edit_password").val()
      new_pass_confirm = $("#my_edit_password_confirm").val()
      if new_pass != new_pass_confirm
        Session.set('changePasswordSaveBtnClicked', false)
        PUB.toast "两次填写的密码不一致!"
        return
      else if new_pass.length<6
        Session.set('changePasswordSaveBtnClicked', false)
        PUB.toast "密码至少要6位";
        return
      if new_pass
        navigator.notification.confirm('', (r)->
          if r is 1
            console.log 'changePassword !!'
            $(".shownewpassword").html(new_pass)
            Accounts.changePassword old_pass, new_pass, (error) ->
              console.log 'changePassword error ' + error
              if error
                Meteor.setTimeout ()->
                  Session.set('changePasswordSaveBtnClicked', false)
                ,5000
                PUB.toast '输入密码有误，请重试!'
              else
                Session.set('changePasswordSaveBtnClicked', false)
                $('.afterchangepassword').fadeOut 300
                $('.show-change-userinfo').fadeIn 300
              return
            # Meteor.call "changeMyPassword", new_pass, (error, result) ->
            #   if error
            #     Meteor.setTimeout ()->
            #       Session.set('changePasswordSaveBtnClicked', false)
            #     ,5000
            #     PUB.toast '修改密码失败，请重试!'
            #   else
            #     Session.set('changePasswordSaveBtnClicked', false)
            #     PUB.toast '修改密码成功!'
            #     Router.go '/authOverlay'
            #   return
        , '修改密码并重新登录!', ['确定']);
      else
        Session.set('changePasswordSaveBtnClicked', false)
        PUB.toast "密码不能为空!"
    'click #pass_btn_back' :->
      Session.set('changePasswordSaveBtnClicked', false)
      Router.go '/dashboard'
    'click #save-user-info-btn' :->
      Meteor.logout (msg)->
        Session.set("searchContent","")
        #PostsSearch.cleanHistory()
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
        window.plugins.userinfo.setUserInfo '', ->
             console.log 'setUserInfo was succeed!'
             return
          , ->
            console.log 'setUserInfo was Error!'
            return
        Router.go '/loginForm'

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

  Template.my_blacklist.rendered=->
    $('.dashboard').css 'min-height', $(window).height()
    Meteor.subscribe("allBlackList")
    # Meteor.subscribe('allUsers')
    return
  Template.my_blacklist.helpers
    myBlackers :->
      blackList = BlackList.findOne({blackBy: Meteor.userId()}) || {}
      if blackList
        blackList.blacker
  Template.my_blacklist_item.helpers
    profile :->
      id = this.toString()
      Meteor.subscribe('usersById', id)
      return Meteor.users.findOne({_id: id}).profile
    thisUserName:->
      id = this.toString()
      if Meteor.users.findOne({_id: id}).profile.fullname
        return username = Meteor.users.findOne({_id: id}).profile.fullname
      else
        return username = Meteor.users.findOne({_id: id}).username
  Template.my_blacklist_item.events
    'click .remove' :(e)->
      id = this.toString()
      blackId = BlackList.findOne({blackBy: Meteor.userId()})._id
      menus = ['从黑名单中移除']
      menuTitle = ''
      callback = (buttonIndex)->
        if buttonIndex is 1
          BlackList.update({_id: blackId}, {$pull: {blacker: id}})
          blacker = Meteor.users.findOne({_id: id})
          blackerName = if blacker.profile.fullname then blacker.profile.fullname else blacker.username
          Follower.insert {
            userId: Meteor.userId()
            userName: Meteor.user().profile.fullname || Meteor.user().username
            userIcon: Meteor.user().profile.icon || '/userPicture.png'
            userDesc: Meteor.user().profile.desc

            followerId: blacker._id
            followerName: blackerName
            followerIcon: blacker.profile.icon || '/userPicture.png'
            followerDesc: blacker.profile.desc

            createAt: new Date()
          }
      PUB.actionSheet(menus, menuTitle, callback)
      e.preventDefault()
      e.stopPropagation()
  Template.my_blacklist.events
    'click #about_btn_back' :->
      if Session.get('fromeaddblacllist') is true
        Session.set('fromeaddblacllist', false)
        Router.go '/'
      else
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

  Template.display_lang.helpers
    isEnglish: ->
      if Cookies.check("display-lang")
        return Cookies.get("display-lang") is 'en'
      else
        return false
  Template.display_lang.events
    'click #about_btn_back' :->
      Router.go '/dashboard'
    'click #english': ->
      Session.set("display_lang","en")
      Cookies.set("display-lang","en",360)
      TAPi18n.setLanguage("en")
      Meteor.call 'updateUserLanguage', Meteor.userId(), 'en'
      Router.go '/dashboard'
    'click #chinese': ->
      Session.set("display_lang","zh")
      Cookies.set("display-lang","zh",360)
      TAPi18n.setLanguage("zh")
      Meteor.call 'updateUserLanguage', Meteor.userId(), 'zh'
      Router.go '/dashboard'
