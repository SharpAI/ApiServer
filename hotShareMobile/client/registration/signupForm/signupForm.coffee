Template.signupForm.helpers
  names:->
   if Session.get("signUpName")
     Session.get("signUpName")
   else
     ''
  email:->
   if Session.get("signUpMail")
     Session.get("signUpMail")
   else
     ''
Template.signupForm.events
  'click .term_notice' :(e,t)->
    names = t.find('#signup-username').value
    email = t.find('#signup-email').value.toLowerCase()
    Session.set("signUpName", names)
    Session.set("signUpMail", email)
    Router.go '/deal_page'
  'click #btn_back' :->
    Session.set("signUpName", '')
    Session.set("signUpMail", '')
    $('.register').css('display',"none")
    $('#login').css('display',"block")
    $('#weibo').css('display',"block")
    $('#register').css('display',"block")
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
          fullname: ''
          icon: '/userPicture.png'
          desc: ''
        (err)->
          if err
            console.log err
            PUB.toast '注册失败，邮箱或姓名可能已经存在！'
            t.find('#sub-registered').disabled = false
            t.find('#sub-registered').value = '创建帐户'
          else
            Router.go '/registerFollow'
            return
    false

