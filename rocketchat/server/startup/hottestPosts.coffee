
Meteor.startup ()->
  hottestPosts=[]
  caleHottestPosts=(limit)->
    limit = limit || 15
    hottestPosts=[]
    latestPost = new Date()
    latestPost.setHours(latestPost.getHours() - 48)
    latestPost = latestPost.getTime()

    latestView = new Date()
    latestView.setHours(latestView.getHours() - 24)
    latestView = latestView.getTime()

    queryString = "MATCH (u:User)-[v:VIEWER]->(p:Post) WITH v,p,length(()--p) AS views WHERE v.by > #{latestView} AND views > 50 AND p.createdAt > #{latestPost}  RETURN DISTINCT p.postId,p,length(()--p) AS views  ORDER BY views DESC LIMIT " + limit
    queryResult = Neo4j.query queryString
    console.log queryString
    if queryResult and queryResult.length > 0
      queryResult.forEach (item)->
        if hottestPosts.length > 5
          return hottestPosts

        postId=item[0]
        postInfo=item[1]
        postViews=item[2]
        console.log('postViews: '+postViews+' PostInfo '+JSON.stringify(postInfo))
        if postInfo and postInfo.postId and postInfo.name and _.pluck(hottestPosts, 'postId').indexOf(postInfo.postId) is -1
          hottestPosts.push(postInfo)
      
      if hottestPosts.length < 5
        caleHottestPosts(25)
  @getHottestPosts=()->
    if hottestPosts and hottestPosts.length > 0
      return hottestPosts
    else
      return null
  Meteor.setInterval caleHottestPosts,60*60*1000
  caleHottestPosts()
