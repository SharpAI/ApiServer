Template.loginForm.events
    'focus input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','none')
      ,10
    'blur input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','block')
      ,10
    'click #btn_back' :->
      $('input').blur()
      Router.go '/authOverlay'
#      Router.go '/authOverlay'
      # $('.login').css('display',"none")
      # $('#register').css('display',"block")
      # $('#weibo').css('display',"block")
      # $('#login').css('display',"block")
      # $('.recovery').css('display',"none")
#      $('.authOverlay').css('-webkit-filter',"none")
    'click .forgetPwdBtn': (e)->
      $('.loginProblemsPromptPage').fadeIn(300)
    'click .btnClose' :->
      $('.customerService,.customerServiceBackground').hide()
    'click #sendEmailBtn' :(e,t)->
      mailAddress = t.find('#customerEmail').value
      content = t.find('#sendContent').value
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) 
      subject = '用户' + mailAddress + '需要人工客服！'
      if !mailValueReg.test(mailAddress) and !qqValueReg.test(mailAddress)
        PUB.toast('请输入正确的QQ号或Email')
        return false
      if qqValueReg.test(mailAddress)
        mailAddress += '@qq.com'
      if content is ''
        PUB.toast('请说明申诉原因。')
        return false
      $("#sendContent").val('')
      Meteor.call('sendEmailToAdmin', mailAddress,subject ,content)
      PUB.toast('邮件已经发送，请等待客服与您联系。')
      $('.customerService,.customerServiceBackground').hide()
    'click .forgetPassword' :->
      # $('.login').css('display',"none")
      # $('#register').css('display',"none")
      # $('#weibo').css('display',"none")
      # $('#login').css('display',"none")
      # $('.recovery').css('display',"block")
      # $('.agreeDeal').css('display',"none")
      $('body').height($('body')[0].clientHeight);
      Router.go '/recoveryForm'
    'submit #login-form':(e,t)->
      e.preventDefault()
      if Meteor.status().connected isnt true
        PUB.toast '当前为离线状态,请检查网络连接'
        return
      name = t.find('#login-username').value
      Session.set 'userName',name
      pass = t.find('#login-password').value
      if name is ''
        PUB.toast '请输入用户名！'
        return
      if pass is ''
        PUB.toast '请输入密码！'
        return
      t.find('#sub-login').disabled = true
      t.find('#sub-login').value = '正在登录...'
      Meteor.loginWithPassword name, pass,(error)->
        if error
          PUB.toast '帐号或密码有误！'
          t.find('#sub-login').disabled = false
          t.find('#sub-login').value = '登 录'
        else
          page = Session.get('routerWillRenderPage')
          if page
            Router.go page
          else
            Router.go '/'
          return
      false 
Template.recoveryForm.events
    'focus input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','none')
      ,10
    'blur input':(e,t)->
      Meteor.setTimeout ->
        $('.company').css('display','block')
      ,10
    'click #btn_back' :->
      $('input').blur()
      Router.go '/loginForm'
      # $('.login').css('display',"none")
      # $('#register').css('display',"block")
      # $('#weibo').css('display',"block")
      # $('#login').css('display',"block")
      # $('.recovery').css('display',"none")
    'submit #recovery-form':(e,t)->
      e.preventDefault()
      if Meteor.status().connected isnt true
        PUB.toast '当前为离线状态,请检查网络连接'
        return
      email = t.find('#recovery-email').value
      if email is ''
        return
      t.find('#sub-recovery').disabled = true
      t.find('#sub-recovery').value = '正在重设...'
      Accounts.forgotPassword {email:email},(error)->
        t.find('#sub-recovery').disabled = false
        t.find('#sub-recovery').value = '重设'
        if error
          if error.error is 403 and error.reason is 'User not found'
            PUB.toast '您填写的邮件地址不存在！'
          else
            PUB.toast '暂时无法处理您的请求，请稍后重试！'
        else
          #PUB.toast '请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。'
          navigator.notification.confirm('请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。', (r)->
            if r is 1
              $('#recovery-email').val('');
          , '提示信息', ['确定']);
          Router.go '/loginForm'
          # $('.login').css('display',"none")
          # $('#register').css('display',"block")
          # $('#weibo').css('display',"block")
          # $('#login').css('display',"block")
          # $('.recovery').css('display',"none")

Template.loginProblemsPrompt.events
  'click .forgetPasswordBtn':(e,t)->
    $('.loginProblemsPromptPage').hide()
    Router.go '/recoveryForm'
  'click .customerServiceBtn':(e,t)->
    $('.loginProblemsPromptPage').hide()
    $('.customerService,.customerServiceBackground').fadeIn(300)
  'click .bg, click .cancleBtn':->
    $('.loginProblemsPromptPage').hide()