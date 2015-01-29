Template.loginForm.events
    'click #btn_back' :->
#      Router.go '/authOverlay'
      $('.login').css('display',"none")
      $('#register').css('display',"block")
      $('#weibo').css('display',"block")
      $('.authOverlay').css('-webkit-filter',"none")
    'submit #login-form':(e,t)->
      e.preventDefault()
      if Meteor.status().connected isnt true
        PUB.toast '当前为离线状态,请检查网络连接'
        return
      name = t.find('#login-username').value
      Session.set 'userName',name
      pass = t.find('#login-password').value
      if name is '' or pass is ''
        return
      t.find('#sub-login').disabled = true
      t.find('#sub-login').value = '正在登录...'
      Meteor.loginWithPassword name, pass,(error)->
        if error
          PUB.toast '帐号或密码有误！'
          t.find('#sub-login').disabled = false
          t.find('#sub-login').value = '登 录'
        else
          if Follower.find({"userId":Meteor.userId()}).count() > 3
              Router.go '/'
          else
              Router.go '/registerFollow'
          return
      false 

