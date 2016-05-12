
Meteor.startup ()->
  url = process.env.NEO4J_URL or process.env.GRAPHENEDB_URL or "http://neo4j:123456@localhost:7474"
  Neo4j = new Neo4jDb url

  mongourl = process.env.MONGO_GUSHITIE_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'
  connect = MongoInternals.NpmModule.MongoClient.connect
  connect = Meteor.wrapAsync(connect)

  db = connect(mongourl);
  GushitiePosts = db.collection('posts');

  GushitiePosts.aggregate = Meteor.wrapAsync(GushitiePosts.aggregate, GushitiePosts)
  GushitiePosts.insert = Meteor.wrapAsync(GushitiePosts.insert, GushitiePosts)
  GushitiePosts.update = Meteor.wrapAsync(GushitiePosts.update, GushitiePosts)
  GushitiePosts.findOne = Meteor.wrapAsync(GushitiePosts.findOne, GushitiePosts)
  GushitiePosts.find = Meteor.wrapAsync(GushitiePosts.find, GushitiePosts)
  GushitiePosts._ensureIndex = Meteor.wrapAsync(GushitiePosts.ensureIndex, GushitiePosts)

  Meteor.methods
    'getMyState':(gUserID,skip)->
      this.unblock()
      unless skip
        skip = 0
      console.log('This is '+gUserID)
      result = Neo4j.query "MATCH (u:User)-[v:VIEWER]->(p:Post) WHERE u.userId=\"#{gUserID}\" RETURN v.by,p ORDER BY v.by DESC SKIP #{skip} LIMIT 50"
      console.log result
      return result
    'getPostInfo':(postId)->
      this.unblock()
      return GushitiePosts.findOne({_id:'27ZRmEeXwkoFi6BZC'},{fields:{mainImage:1,ownerName:1,name:1,addonTitle:1,createdAt:1}})

