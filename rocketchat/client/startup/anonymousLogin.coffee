Meteor.startup ->

  Tracker.autorun ()->
    unless Meteor.userId()
      hotShareUserId=amplify.store('hotshareUserID')
      console.log('hotShareUserId: '+hotShareUserId)
      if hotShareUserId
        Meteor.loginWithGushitie hotShareUserId, (err)->
          if err
            amplify.store('hotshareUserID',null)
            console.log('>>>>>> login with error:')
            uuid = amplify.store('uuid') || Meteor.uuid()
            Meteor.loginWithAnonymous uuid, (err)->
              if err
                console.log('>>>>>> login with error:')
                return console.log(err)

              amplify.store('uuid', uuid)
              console.log('Anonymous login')
            return console.log(err)
          console.log('Gushitie login')
          me=Meteor.user()
          if me.services.gushitie.icon
            console.log('setup icon')
            Meteor.call 'setAvatarFromService', me.services.gushitie.icon, '', 'url'
      else
        uuid = amplify.store('uuid') || Meteor.uuid()
        Meteor.loginWithAnonymous uuid, (err)->
          if err
            console.log('>>>>>> login with error:')
            return console.log(err)

          amplify.store('uuid', uuid)
          console.log('Anonymous login')
  Tracker.autorun (t)->
    if Meteor.user() and Meteor.user().name
      me = Meteor.user()
      if (!me.services or !me.services.gushitie) and amplify.store('hotshareUserID')
        Meteor.call 'associateGushitie',amplify.store('hotshareUserID')
        console.log(me)
  Tracker.autorun (t)->
    if ChatRoom.findOne() && ChatRoom.findOne()._id
      roomID= ChatRoom.findOne()._id
      if ChatSubscription.find({ rid: roomID }).count() is 0
        console.log('Need subscribe this room')
        Meteor.call 'joinRoom', roomID

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
