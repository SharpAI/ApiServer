if Meteor.isServer
  # ddp = DDP.connect 'http://host1.tiegushi.com'
  refNames = new Meteor.Collection("refnames")#, {connection: ddp})
  refNameCount = refNames.find({}).count()
  
  # test data
  if refNameCount <= 0
    refNames.insert({text: '李白'})
    refNames.insert({text: '赵云'})
    refNames.insert({text: '大白'})
    refNames.insert({text: '曹操'})
    refNames.insert({text: '林冲'})
  
  Accounts.registerLoginHandler('anonymous', (options)->
    unless options.uuid
      throw new Meteor.Error(403, 'Missing parameter: UUID');
    
    skip = Math.ceil(Random.fraction()*(refNameCount-1))
    name = refNames.find({}, {skip: skip, limit: 1}).fetch()[0].text
    username = Random.id()
    user = Meteor.users.findOne({'services.anonymous.id': options.uuid})
    result = Accounts.updateOrCreateUserFromExternalService('anonymous', {id: options.uuid, _OAuthCustom: true}, {})
    
    if !user or !user.name
      Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
    # unless user.name
    #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
    
    return result
  )