Meteor.methods
  associateGushitie: (gushitieId) ->
    console.log('in associateGushitie')
    if not Meteor.userId()
      throw new Meteor.Error 'invalid-user', '[methods] setUserActiveStatus -> Invalid user'
    if gushitieId
      Meteor.users.update({_id:Meteor.userId()},{$set:{'gushitie.id':gushitieId}})
