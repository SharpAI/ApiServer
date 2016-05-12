
Meteor.startup ()->
  url = process.env.NEO4J_URL or process.env.GRAPHENEDB_URL or "http://neo4j:123456@localhost:7474"
  Neo4j = new Neo4jDb url

  Meteor.methods
    'getMyState':(gUserID,skip)->
      this.unblock()
      unless skip
        skip = 0
      console.log('This is '+gUserID)
      result = Neo4j.query "MATCH (v:Viewer),(p:Post) WHERE v.viewerId=\"#{gUserID}\" AND p.postId=v.postId RETURN v.createdAt,p ORDER BY v.createdAt DESC SKIP #{skip} LIMIT 50"
      console.log result
      return result