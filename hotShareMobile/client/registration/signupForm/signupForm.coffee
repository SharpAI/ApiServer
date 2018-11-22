userNameLength = signUpUserNameLength || 16
# id1 = null
# id2 = null
Template.signupForm.onRendered ()->
  $('#signup-username').bind('propertychange input',(e)->
      names = $(e.target).val().trim()
      html = ''
      html += names.length
      html += '/'+userNameLength
      $('#signup-username-help').html(html)
    )
Template.signupForm.helpers
  names:->
   if Session.get("signUpName")
     Session.get("signUpName")
   else
     ''
  namesMaxLength:->
    return userNameLength
  # email:->
  #  if Session.get("signUpMail")
  #    Session.get("signUpMail")
  #  else
  #    ''
  pwd:->
   if Session.get("signUpPwd")
     Session.get("signUpPwd")
   else
     ''
  repwd:->
    if Session.get('signUpRepwd')
      Session.get('signUpRepwd')
    else
      ''
Template.signupForm.events
  # 'keyup #signup-username': (e,t)->
  #   names = t.find('#signup-username').value
  #   html = ''
  #   html += names.length
  #   html += '/'+userNameLength
  #   $('#signup-username-help').html(html)
  # 'focus input':(e,t)->
  #   if id2 isnt null
  #     Meteor.clearTimeout id2
  #     id2 = null
  #   id1 = Meteor.setTimeout ->
  #           $('.company').css('display','none')
  #           $('.bottom-img').css('display','none')
  #         ,10
  # 'blur input':(e,t)->
  #   if id1 isnt null
  #     Meteor.clearTimeout id1
  #     id1 = null
  #   id2 = Meteor.setTimeout ->
  #           $('.company').css('display','block')
  #           $('.bottom-img').css('display','block')
  #         ,500
  'click .term_notice' :(e,t)->
    names = t.find('#signup-username').value
    # email = t.find('#signup-email').value.toLowerCase()
    pwd = t.find('#signup-password').value
    repwd = t.find('#signup-repassword').value
    Session.set("signUpName", names)
    # Session.set("signUpMail", email)
    Session.set('signUpRepwd',repwd)
    Session.set("signUpPwd", pwd)
    Router.go '/deal_page'
  'click #btn_back' :->
    $('input').blur()
    Session.set("signUpName", '')
    Session.set("signUpMail", '')
    Session.set('signUpRepwd','')
    Session.set("signUpPwd", '')
    PUB.back()
    # $('.register').css('display',"none")
    # $('#login').css('display',"block")
    # $('#weibo').css('display',"block")
    # $('#register').css('display',"block")
#    $('.authOverlay').css('-webkit-filter',"none")
  'submit #signup-form':(e,t)->
    e.preventDefault()
    if Meteor.status().connected isnt true
      PUB.toast '当前为离线状态,请检查网络连接'
      return
    Session.set("signUpName", '')
    Session.set("signUpMail", '')
    names = t.find('#signup-username').value
    email = t.find('#signup-email').value.toLowerCase()
    Session.set 'userName',names
    pass1 = t.find('#signup-password').value
    pass2 = t.find('#signup-repassword').value
    myRegExp = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/ ;
    if names is ''
      PUB.toast '用户名不能为空！'
    else if myRegExp.test(email) is false
      PUB.toast '邮箱格式有误,请重新输入.'
    else if pass1 != pass2
      PUB.toast '密码输入不一致,请重新输入.'
    else if pass1.length < 6
      PUB.toast '密码至少要6位！'
    else
      t.find('#sub-registered').disabled = true
      t.find('#sub-registered').innerText = '正在提交信息...'
      Accounts.createUser
        username:Session.get('userName')
        email:email
        password:pass1
        profile:
          fullname: Session.get('userName')
          icon: '/userPicture.png'
          desc: ''
        (err)->
          if err
            console.log err
            trackEvent("signupuser","user signup failure.")
            PUB.toast '注册失败，用户名或邮箱已经注册！'
            t.find('#sub-registered').disabled = false
            t.find('#sub-registered').innerText = '创建帐户'
          else
            trackEvent("signupuser","user signup succeed.")
            window.plugins.userinfo.setUserInfo Meteor.user()._id, ->
                console.log 'setUserInfo was succeed!'
                return
              , ->
                console.log 'setUserInfo was Error!'
                return
            #Router.go '/registerFollow'
            #ScanBarcodeByBarcodeScanner()
            # if window.localStorage.getItem("isSecondUse") == 'true'
            #   Router.go('/')
            # else
            if window.localStorage.getItem("enableHomeAI") == 'true'
              Router.go('/scene')
            else
              Meteor.call 'enableHomeAI',(err,res)->
                if !err and res is true
                  window.localStorage.setItem("enableHomeAI",'true')
                  Router.go('/scene')
                else
                  Router.go('/introductoryPage')
            return
    false

