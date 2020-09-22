if Meteor.isClient
  unless Meteor.isCordova
    Meteor.startup ->
      unless Meteor.user()
        createUser = ()->
          uuid = Meteor.uuid()
          Accounts.createUser {
              username:uuid,
              password:'123456',
              'profile':{
                fullname:'匿名',
                icon:'/userPicture.png',
                anonymous:true,
                browser:true,
                language: if isUSVersion then 'en' else 'zh'
              }
            }
          ,(error)->
            console.log('Registration Error is ' + JSON.stringify(error))
            unless error
              amplify.store('uuid',uuid)
              console.log('Registration Success, now logging on '+ uuid)
              Meteor.loginWithPassword(uuid,'123456',(error)->
                unless error
                  checkShareUrl()
                  Meteor.call 'updateUserLanguage', Meteor.userId(), 'en'
                  if window.updateMyOwnLocationAddress
                    window.updateMyOwnLocationAddress()
              )
        if amplify.store('uuid')
          Meteor.loginWithPassword(amplify.store('uuid'),'123456',(error)->
            unless error
              checkShareUrl()
              if isUSVersion
                Meteor.call 'updateUserLanguage', Meteor.userId(), 'en'
              else
                Meteor.call 'updateUserLanguage', Meteor.userId(), 'zh'
              if window.updateMyOwnLocationAddress
                window.updateMyOwnLocationAddress()
            else
              createUser()
          )
        else
          createUser()
