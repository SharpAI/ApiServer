db_url= process.env.MONGO_GUSHITIE_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'
GushitieDB = new MongoInternals.RemoteCollectionDriver(db_url)
GushitieFeeds = new Mongo.Collection("feeds", { _driver: GushitieDB })

Meteor.methods
  getFeedsByLogin: ()->
    if not Meteor.userId()
      return []
    
    result = []
    GushitieFeeds.find({followby:Meteor.userId(),checked:false}).forEach (feed)->
      result.push(feed)
    GushitieFeeds.update({followby:Meteor.userId(),checked:false}, {$set: {checked: true}})
    
    return result