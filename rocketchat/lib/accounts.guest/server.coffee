if Meteor.isServer
  # # ddp = DDP.connect 'http://host1.tiegushi.com'
  # refNames = new Meteor.Collection("refnames")#, {connection: ddp})
  # refNameCount = refNames.find({}).count()
  
  # # test data
  # if refNameCount <= 0
  #   refNames.insert({text: '李白'})
  #   refNames.insert({text: '赵云'})
  #   refNames.insert({text: '大白'})
  #   refNames.insert({text: '曹操'})
  #   refNames.insert({text: '林冲'})


  # ddp = DDP.connect 'http://host1.tiegushi.com'
  db_url= process.env.MONGO_GUSHITIE_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'
  connect = MongoInternals.NpmModule.MongoClient.connect
  connect = Meteor.wrapAsync(connect)

  db = connect(db_url)
  @GushitieUsers = db.collection('users')

  GushitieUsers.aggregate = Meteor.wrapAsync(GushitieUsers.aggregate, GushitieUsers)
  GushitieUsers.insert = Meteor.wrapAsync(GushitieUsers.insert, GushitieUsers)
  GushitieUsers.update = Meteor.wrapAsync(GushitieUsers.update, GushitieUsers)
  GushitieUsers.findOne = Meteor.wrapAsync(GushitieUsers.findOne, GushitieUsers)
  GushitieUsers._ensureIndex = Meteor.wrapAsync(GushitieUsers.ensureIndex, GushitieUsers)

  GushitieDB = new MongoInternals.RemoteCollectionDriver(db_url)
  GushitieRefnames = new Mongo.Collection("refnames", { _driver: GushitieDB })
  refNameCount = GushitieRefnames.find({}).count()
  console.log 'refNameCount:' + refNameCount

  Accounts.registerLoginHandler('anonymous', (options)->
    unless (options.uuid or options.userId)
      throw new Meteor.Error(403, 'Missing parameter: UUID/UserID');

    if options.uuid
      skip = Math.ceil(Random.fraction()*(refNameCount-1))
      name = GushitieRefnames.find({}, {skip: skip, limit: 1}).fetch()[0].text
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
      gushitieUser = GushitieUsers.findOne({_id:options.userId})
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