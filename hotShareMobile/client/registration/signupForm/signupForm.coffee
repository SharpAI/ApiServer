userNameLength = signUpUserNameLength || 16
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
  email:->
   if Session.get("signUpMail")
     Session.get("signUpMail")
   else
     ''
  pwd:->
   if Session.get("signUpPwd")
     Session.get("signUpPwd")
   else
     ''
Template.signupForm.events
  # 'keyup #signup-username': (e,t)->
  #   names = t.find('#signup-username').value
  #   html = ''
  #   html += names.length
  #   html += '/'+userNameLength
  #   $('#signup-username-help').html(html)
  'focus input':(e,t)->
    Meteor.setTimeout ->
      $('.company').css('display','none')
    ,10
  'blur input':(e,t)->
    Meteor.setTimeout ->
      $('.company').css('display','block')
    ,10
  'click .term_notice' :(e,t)->
    names = t.find('#signup-username').value
    email = t.find('#signup-email').value.toLowerCase()
    pwd = t.find('#signup-password').value
    Session.set("signUpName", names)
    Session.set("signUpMail", email)
    Session.set("signUpPwd", pwd)
    Router.go '/deal_page'
  'click #btn_back' :->
    $('input').blur()
    Session.set("signUpName", '')
    Session.set("signUpMail", '')
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
    myRegExp = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/ ;
    if names is ''
      PUB.toast '请输入姓名！'
    else if myRegExp.test(email) is false
      PUB.toast '你的邮箱有误！'
    else if pass1.length < 6
      PUB.toast '密码至少要6位！'
    else
      t.find('#sub-registered').disabled = true
      t.find('#sub-registered').value = '正在提交信息...'
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
            PUB.toast '注册失败，邮箱或姓名可能已经存在！'
            t.find('#sub-registered').disabled = false
            t.find('#sub-registered').value = '创建帐户'
          else
            window.plugins.userinfo.setUserInfo Meteor.user()._id, ->
                console.log 'setUserInfo was succeed!'
                return
              , ->
                console.log 'setUserInfo was Error!'
                return
            #Router.go '/registerFollow'
            ScanBarcodeByBarcodeScanner()
            return
    false

