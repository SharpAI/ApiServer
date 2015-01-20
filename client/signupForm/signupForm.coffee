Template.signupForm.events
    'click #btn_back' :->
      Router.go '/authOverlay'
    'submit #signup-form':(e,t)->
      e.preventDefault()
      names = t.find('#signup-username').value
      email = t.find('#signup-email').value
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

