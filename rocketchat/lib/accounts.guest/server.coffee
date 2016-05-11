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


  # ddp = DDP.connect 'http://host1.tiegushi.com'
  db_url= process.env.MONGO_METRICS_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'
  connect = MongoInternals.NpmModule.MongoClient.connect
  connect = Meteor.wrapAsync(connect)

  db = connect(db_url)
  GushitieUSsers = db.collection('users')

  GushitieUSsers.aggregate = Meteor.wrapAsync(GushitieUSsers.aggregate, GushitieUSsers)
  GushitieUSsers.insert = Meteor.wrapAsync(GushitieUSsers.insert, GushitieUSsers)
  GushitieUSsers.update = Meteor.wrapAsync(GushitieUSsers.update, GushitieUSsers)
  GushitieUSsers.findOne = Meteor.wrapAsync(GushitieUSsers.findOne, GushitieUSsers)
  GushitieUSsers._ensureIndex = Meteor.wrapAsync(GushitieUSsers.ensureIndex, GushitieUSsers)

  Accounts.registerLoginHandler('anonymous', (options)->
    unless (options.uuid or options.userId)
      throw new Meteor.Error(403, 'Missing parameter: UUID/UserID');

    if options.uuid
      skip = Math.ceil(Random.fraction()*(refNameCount-1))
      name = refNames.find({}, {skip: skip, limit: 1}).fetch()[0].text
      username = Random.id()
      user = Meteor.users.findOne({'services.anonymous.id': options.uuid})
      result = Accounts.updateOrCreateUserFromExternalService('anonymous', {id: options.uuid, _OAuthCustom: true}, {})
      console.log(user)

      if !user or !user.name
        Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})
      # unless user.name
      #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})

      return result
    if options.userId
      gushitieUser = GushitieUSsers.findOne({_id:options.userId})
      console.log(gushitieUser)
      user = Meteor.users.findOne({'services.gushitie.id': options.userId})
      result = Accounts.updateOrCreateUserFromExternalService('gushitie', {id: options.userId, _OAuthCustom: true}, {})
      console.log(user)
      Meteor.users.update({_id: result.userId},
        { $set: {
          username: gushitieUser.username
          name: gushitieUser.profile.fullname
          'services.gushitie.icon': gushitieUser.profile.icon
          }
        }
      )
      # unless user.name
      #   Meteor.users.update({_id: result.userId}, {$set: {username: username, name: name}})

      return result
  )