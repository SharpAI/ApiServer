if Meteor.isClient
  unless Meteor.isCordova
    Meteor.startup ->
      unless Meteor.user()
        if amplify.store('uuid')
          Accounts.loginWithPassword(amplify.store('uuid'),'123456')
        else
          uuid = Meteor.uuid()
          Accounts.createUser {
            username:uuid,
            password:'123456',
            'profile':{
              fullname:'匿名',
              icon:'/userPicture.png',
              anonymous:true,
              browser:true
            }
          }
          ,(error)->
            console.log('Registration Error is ' + JSON.stringify(error))
            unless error
              amplify.store('uuid',uuid)
              console.log('Registration Success, now logging on')
              Accounts.loginWithPassword(amplify.store('uuid'),'123456')