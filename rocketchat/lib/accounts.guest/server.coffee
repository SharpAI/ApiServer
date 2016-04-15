if Meteor.isServer
  refNames = new Meteor.Collection("refnames")
  refNameCount = refNames.find({}).count()
  
  # test data
  if refNameCount <= 0
    refNames.insert({text: '李白'})
    # refNames.insert({text: '赵云'})
    # refNames.insert({text: '大白'})
    # refNames.insert({text: '曹操'})
    # refNames.insert({text: '林冲'})
  
  Accounts.registerLoginHandler('anonymous', (options)->
    unless options.uuid
      throw new Meteor.Error(403, 'Missing parameter: UUID');
    
    skip = Math.ceil(Random.fraction()*(refNameCount-1))
    name = refNames.findOne({}, {skip: skip, limit: 1}).text
    username = Random.id()
    update = Meteor.users.findOne({'services.anonymous.id': options.uuid})
    result = Accounts.updateOrCreateUserFromExternalService('anonymous', {id: options.uuid, _OAuthCustom: true}, {})
    
    # unless update
    #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
    
    return result
  )