
Meteor.startup ()->
  url = process.env.NEO4J_URL or process.env.GRAPHENEDB_URL or "http://neo4j:5MW-wU3-V9t-bF6@120.24.247.107:7474"
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
    'getMyState':(gUserID,skip,limit)->
      this.unblock()
      unless skip
        skip = 0
      unless limit
        limit = 20
      console.log('This is '+gUserID)
      result = Neo4j.query "MATCH (u:User)-[v:VIEWER]->(p:Post) WHERE u.userId=\"#{gUserID}\" RETURN v.by,p ORDER BY v.by DESC SKIP #{skip} LIMIT #{limit}"
      console.log result
      return result
    'getPostInfo':(postId)->
      this.unblock()
      postinfo = GushitiePosts.findOne({_id:postId},{fields:{mainImage:1,ownerName:1,title:1,addonTitle:1,createdAt:1}})
      console.log(postinfo)
      return postinfo
