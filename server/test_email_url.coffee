
if Meteor.isServer
  Meteor.startup ()->
    if (not process.env.MAIL_URL) or  process.env.MAIL_URL is ''
      console.log "----setup smtp server---"
      process.env.MAIL_URL = 'smtp://postmaster%40tiegushi.com:a7e104e236965118d8f1bd3268f36d8c@smtp.mailgun.org:587'
      #process.env.MAIL_URL = 'smtp://postmaster%40email.tiegushi.com:1b3e27a9f18007d6fedf46c9faed519a@smtp.mailgun.org:587'
      #process.env.MAIL_URL = 'smtp://notify%40mail.tiegushi.com:Actiontec753951@smtpdm.aliyun.com:465'
