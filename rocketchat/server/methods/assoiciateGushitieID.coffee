Meteor.methods
  associateGushitie: (gushitieId) ->
    console.log('in associateGushitie')
    if not Meteor.userId()
      throw new Meteor.Error 'invalid-user', '[methods] setUserActiveStatus -> Invalid user'
    if gushitieId
      gushitieProfile = GushitieUsers.findOne({_id: gushitieId})
      if gushitieProfile and gushitieProfile.profile.fullname and gushitieProfile.profile.fullname isnt ''
        Meteor.users.update({_id:Meteor.userId()},{$set:{
            'services.gushitie.id':gushitieId,
            'services.gushitie.icon':gushitieProfile.profile.icon,
            'avatarUrl':gushitieProfile.profile.icon,
            'name': gushitieProfile.profile.fullname,
            'gushitie.id':gushitieId
        }})
      else
        Meteor.users.update({_id:Meteor.userId()},{$set:{'services.gushitie.id':gushitieId, 'gushitie.id':gushitieId}})