# id1 = null
# id2 = null
Template.loginForm.events
    'click #toSignup':(e,t)->
      return PUB.page('/signupForm');
    # 'focus input':(e,t)->
    #   if id2 isnt null
    #     Meteor.clearTimeout id2
    #     id2 = null
    #   id1 = Meteor.setTimeout ->
    #         $('.company').css('display','none')
    #         $('.bottom-img').css('display','none')
    #       ,10
    # 'blur input':(e,t)->
    #   if id1 isnt null
    #     Meteor.clearTimeout id1
    #     id1 = null
    #   id2 = Meteor.setTimeout ->
    #         $('.company').css('display','block')
    #         $('.bottom-img').css('display','block')
    #       ,500
    'click #btn_back' :->
      $('input').blur()
      PUB.back()
#      Router.go '/authOverlay'
      # $('.login').css('display',"none")
      # $('#register').css('display',"block")
      # $('#weibo').css('display',"block")
      # $('#login').css('display',"block")
      # $('.recovery').css('display',"none")
#      $('.authOverlay').css('-webkit-filter',"none")
    'click .forgetPwdBtn': (e)->
      menus = ['忘记密码？','联系客服']
      menuTitle = ''
      callback = (buttonIndex)->
        if buttonIndex is 1
          # $('.login').css('display',"none")
          # $('#register').css('display',"none")
          # $('#weibo').css('display',"none")
          # $('#login').css('display',"none")
          # $('.recovery').css('display',"block")
          # $('.agreeDeal').css('display',"none")
          Router.go '/recoveryForm'
        else if buttonIndex is 2
          $('.customerService,.customerServiceBackground').fadeIn(300)
      PUB.actionSheet(menus, menuTitle, callback)
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
      t.find('#sub-login').innerText = '正在登录...'
      Meteor.loginWithPassword name, pass,(error)->
        if error
          PUB.toast '帐号或密码有误！'
          t.find('#sub-login').disabled = false
          t.find('#sub-login').innerText = '登 录'
        else
          Router.go '/'
          ###
          if window.localStorage.getItem("isSecondUse") == 'true'
            Router.go('/')
          else
            if window.localStorage.getItem("enableHomeAI") == 'true'
              Router.go('/scene')
            else
              Meteor.call 'enableHomeAI',(err,res)->
                if !err and res is true
                  window.localStorage.setItem("enableHomeAI",'true')
                  Router.go('/scene')
                else
                  Router.go('/introductoryPage')
          ###
          checkShareUrl()
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
      qqValueReg = RegExp(/^[1-9][0-9]{4,9}$/)
      mailValueReg = RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) 
      if !mailValueReg.test(email) and !qqValueReg.test(email)
        PUB.toast('请输入正确的QQ号或Email')
        return false
      if qqValueReg.test(email)
        email += '@qq.com'
      # if Meteor.call('checkUserByEmail', email) is 'undefined'
      #   PUB.toast '未检测到与您输入邮箱匹配的帐号,请检查输入的邮箱'
      Meteor.call('checkUserByEmail', email,(error,result)->
        if result isnt undefined and result isnt null
          Meteor.call('sendResetPasswordEmail', result._id, result.emails[0].address)
          console.log result
          PUB.toast('密码重置邮件已发送到您的注册邮箱,请查收邮件后继续操作。')
          Router.go '/loginForm'
        else
          PUB.toast('未检测到与您输入邮箱匹配的帐号,请检查输入的邮箱。')
        );
      return

      t.find('#sub-recovery').disabled = true
      t.find('#sub-recovery').innerText = '正在重设...'
      subject = '用户' + email + '需要重置密码！'
      content = "来了吗APP收到新的重置密码申请，请尽快处理!\n\n申请信息――\n\n用户账户邮箱：" + email + "\n\n\n本邮件为系统自动发送，请不要直接回复，谢谢！"
      Meteor.call('sendEmailToAdmin', email,subject ,content)
      PUB.toast('重置密码请求已经提交客服，请等待客服与您联系。')
      Router.go '/loginForm'

###
      Accounts.forgotPassword {email:email},(error)->
       t.find('#sub-recovery').disabled = false
       t.find('#sub-recovery').innerText = '重设'
       if error
         if error.error is 403 and error.reason is 'User not found'
           PUB.toast '您填写的邮件地址不存在！'
         else
           PUB.toast '暂时无法处理您的请求，请稍后重试！'
       else
          PUB.toast '请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。'
         navigator.notification.confirm('请访问邮件中给出的网页链接地址，根据页面提示完成密码重设。', (r)->
           if r is 1
             $('#recovery-email').val('');
         , '提示信息', ['确定']);
         Router.go '/loginForm'
          $('.login').css('display',"none")
          $('#register').css('display',"block")
          $('#weibo').css('display',"block")
          $('#login').css('display',"block")
          $('.recovery').css('display',"none")###
