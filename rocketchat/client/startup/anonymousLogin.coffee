Meteor.startup ->
  unless Meteor.userId()
    uuid = amplify.store('uuid') || Meteor.uuid()
    Meteor.loginWithAnonymous uuid, (err)->
      if err
        console.log('>>>>>> login with error:')
        return console.log(err)
        
      amplify.store('uuid', uuid)
      console.log('Anonymous login')

    # unless Meteor.user()
    #     createUser = () ->
    #         uuid = Meteor.uuid();

    #         Meteor.call 'registerUserWithUserName', {username: uuid, password: '123456', name: 'Anonymous'}, (error, result) ->
    #             unless error
    #                 amplify.store('uuid', uuid)
    #                 Meteor.loginWithPassword(uuid, '123456', (error) ->
    #                     unless error
    #                         console.log('>>>>>> login with error:');
    #                         console.log(error);
    #                         return
    #                 )
    #                 return
    #             else
    #                 console.log('>>>>>.. reg error :');
    #                 console.log(error);
    #         return

    #     if amplify.store('uuid')
    #         Meteor.loginWithPassword(amplify.store('uuid'), '123456', (error) ->
    #             unless error
    #                     console.log('>>>>>> login with error:');
    #                     console.log(error);
    #                     return
    #         )
    #     else
    #         createUser()
    #     return
