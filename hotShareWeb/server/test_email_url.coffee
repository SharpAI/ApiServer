
if Meteor.isServer
  Meteor.startup ()->
    if (not process.env.MAIL_URL) or  process.env.MAIL_URL is ''
      process.env.MAIL_URL = 'smtp://postmaster%40sandboxb40d25ffd9474e8b88a566924d4167bb.mailgun.org:9bad59febb44cf256ff0766960922980@smtp.mailgun.org:587'