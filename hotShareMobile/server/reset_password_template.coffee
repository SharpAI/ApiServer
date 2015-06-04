if Meteor.isServer
  Meteor.startup ()->
    Accounts.emailTemplates.from = '故事贴 <no-reply@tiegushi.com>'
    Accounts.emailTemplates.siteName = '故事贴'

    #A Function that takes a user object and returns a String for the subject line of the email.
    Accounts.emailTemplates.verifyEmail.subject = (user)->
      return '请验证您的邮件地址'
    #A Function that takes a user object and a url, and returns the body text for the email.
    #Note: if you need to return HTML instead, use Accounts.emailTemplates.verifyEmail.html
    Accounts.emailTemplates.verifyEmail.text = (user, url)->
      return '请点击链接验证您的邮件地址: ' + url
    Accounts.emailTemplates.resetPassword.subject = (user)->
      return '您请求重设故事贴的登录密码'
    Accounts.emailTemplates.resetPassword.text = (user,url)->
      if user.profile and user.profile.fullname and user.profile.fullname isnt ''
        displayName = user.profile.fullname
      else
        displayName = user.fullname
      if displayName is undefined
         displayName = "您好"
      displayName = displayName + ':\n' +'忘记故事贴密码了吗？别着急，请点击以下链接，我们协助您重设密码：\n'
      displayName = displayName + url + '\n\n如果这不是您的邮件请忽略，很抱歉打扰您，请原谅。'
      return displayName
