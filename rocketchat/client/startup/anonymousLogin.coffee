Meteor.startup ->
    unless Meteor.user()
        createUser = () ->
            uuid = Meteor.uuid();

            Meteor.call 'registerUserWithUserName', {username: uuid, password: '123456', name: 'Anonymous'}, (error, result) ->
                unless error
                    amplify.store('uuid', uuid)
                    Meteor.loginWithPassword(uuid, '123456', (error) ->
                        unless error
                            console.log('>>>>>> login with error:');
                            console.log(error);
                            return
                    )
                    return
                else
                    console.log('>>>>>.. reg error :');
                    console.log(error);
            return

        if amplify.store('uuid')
            Meteor.loginWithPassword(amplify.store('uuid'), '123456', (error) ->
                unless error
                        console.log('>>>>>> login with error:');
                        console.log(error);
                        return
            )
        else
            createUser()
        return
