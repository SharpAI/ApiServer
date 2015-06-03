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
      return '您请求重置故事贴的登录密码'
    Accounts.emailTemplates.resetPassword.text = (user,url)->
      if user.profile and user.profile.fullname and user.profile.fullname isnt ''
        displayName = user.profile.fullname
      else
        displayName = user.fullname
      return displayName + ':\n' +'请点击链接重置您的故事贴密码：' + url
