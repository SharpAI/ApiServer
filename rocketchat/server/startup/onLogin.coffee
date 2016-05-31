if Meteor.isServer
  Meteor.startup ()->
    Accounts.onLogin (object)->
      if object.user
        ###
        Since All anonymose name were changed on server side, no need to check it every time.
        if object.user.profile and object.user.profile.anonymous
          if object.user.profile.icon is '/userPicture.png'
            randomI = parseInt(Math.random()*33+1)
            icon = 'http://data.tiegushi.com/anonymousIcon/anonymous_' + randomI + '.png'
            Meteor.users.update {_id:object.user._id},{$set:{'profile.icon':icon}}
          if object.user.profile.fullname is '匿名'
            newName = getRandomAnonymousName()
            if newName and newName isnt ''
              Meteor.users.update {_id:object.user._id},{$set:{'profile.fullname':newName}}
        ###
        # Get gushitie profile/name from gushitie mongodb
        gushitieName = null
        if object.user.services and object.user.services.gushitie and object.user.services.gushitie.id
          gushitieProfile = GushitieUsers.findOne({_id:object.user.services.gushitie.id})
        else if object.user.gushitie and object.user.gushitie.id
          gushitieProfile = GushitieUsers.findOne({_id:object.user.gushitie.id})
        if gushitieProfile and gushitieProfile.profile.fullname
          gushitieName = gushitieProfile.profile.fullname
          console.log(gushitieProfile)
        if gushitieName and gushitieName isnt '' and gushitieName isnt object.user.name
          Meteor.users.update {_id:object.user._id},{$set:{name:gushitieName}}

        if object.connection and object.connection.clientAddress
          console.log(object.user)
          Meteor.users.update {_id:object.user._id},{$set:{'profile.lastLogonIP':object.connection.clientAddress}}
