
Meteor.startup ()->
  url = process.env.NEO4J_URL or process.env.GRAPHENEDB_URL or "http://neo4j:5MW-wU3-V9t-bF6@120.24.247.107:7474"
  Neo4j = new Neo4jDb url

  mongourl = process.env.MONGO_GUSHITIE_URL || 'mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare'

  GushitieDB = new MongoInternals.RemoteCollectionDriver(mongourl)
  @GushitieViewers = new Mongo.Collection("viewers", { _driver: GushitieDB })
  @GushitiePosts = new Mongo.Collection("posts", { _driver: GushitieDB })
  @GushitieMeets = new Mongo.Collection("meets", { _driver: GushitieDB })
  @GushitieFeeds = new Mongo.Collection("feeds", { _driver: GushitieDB })

  Meteor.methods
    'getMyState':(gUserID,skip,limit)->
      this.unblock()
      unless skip
        skip = 0
      unless limit
        limit = 20
      console.log('This is '+gUserID)
      #result = Neo4j.query "MATCH (u:User)-[v:VIEWER]->(p:Post) WHERE u.userId=\"#{gUserID}\" RETURN v.by,p ORDER BY v.by DESC SKIP #{skip} LIMIT #{limit}"
      #console.log result
      #viewers = GushitieViewers.find({userId:'eWMF3NWh6Wpc9zfnt'}, {sort: {createdAt: -1}, limit: 5,skip:0})
      viewers = GushitieViewers.find({userId:gUserID}, {sort: {createdAt: 1}, limit: limit,skip:skip,fields:{postId:1,createdAt:1}})
      readList = []
      viewers.forEach((a)->
        #console.log(a)
        item=[a.createdAt]
        postDetail=GushitiePosts.findOne({_id:a.postId},fields:{mainImage:1,ownerName:1,title:1,addontitle:1,createdAt:1})
        if postDetail
          postDetail.postId=a.postId
          postDetail.name=postDetail.title

          delete postDetail['_id']
          delete postDetail['title']

          item.push postDetail
          console.log postDetail
          readList.push item
      )
      return {
        'list': readList
      }
    'getSocialState':(gUserID)->
      this.unblock()
      meet=GushitieMeets.find({me:gUserID},{sort:{createdAt:-1},limit:5}).fetch()
      result=[]
      meet.forEach((a)->
        console.log(a.ta)
        if a and a.ta
          userInfo=GushitieUsers.findOne({_id:a.ta},{fields:{username:1,'profile.fullname':1,username:1,'profile.location':1}})
          if userInfo
            if userInfo.profile and userInfo.profile.fullname and userInfo.profile.fullname isnt ''
              name = userInfo.profile.fullname
            else
              name = userInfo.fullname
            if userInfo.profile and userInfo.profile.location and userInfo.profile.location isnt ''
              location = userInfo.profile.location
            else
              location = null
            if name
              if location
                result.push({name:name,location:location})
              else
                result.push({name:name})
      )
      console.log result
      return result
    'getPostInfo':(postId)->
      this.unblock()
      postinfo = GushitiePosts.findOne({_id:postId},{fields:{mainImage:1,owner:1,ownerName:1,title:1,addontitle:1,createdAt:1}})
      return postinfo
    'getMyPostStat': (postId)->
      this.unblock()

      me=Meteor.user()
      myGushitieID=null
      if me and me.services and me.services.gushitie and me.services.gushitie.id
        myGushitieID=me.services.gushitie.id
      if me and me.gushitie and me.gushitie.id
        myGushitieID=me.gushitie.id

      console.log myGushitieID
      stat = {}
      if myGushitieID?
        postinfo = GushitiePosts.findOne({_id:postId},{fields:{browse:1}})
        console.log(postinfo)
        if postinfo and postinfo.browse
          stat.browses = postinfo.browse #GushitieViewers.find({postId: postId}).count()
        readers=GushitieViewers.find({postId: postId},{sort:{createdBy:-1},limit:5,fields:{username:1,userId:1}}).fetch()
        console.log(readers)
        readerList=[]
        readers=readers.forEach((item,index)->
          if item.userId and item.userId is myGushitieID
            return
          if item.username
            readerList.push(item.username)
          return
        )
        stat.readers=readerList
        stat.posts = GushitiePosts.find({owner: myGushitieID}).count()
        #stat.totalbrowses = 0
        stat.locations = []
        postIds = []
        readerIds = []
        ###
        GushitiePosts.find({owner: myGushitieID}).forEach((post) ->
          postIds.push(post._id)
        )
        if postIds.length > 0
          GushitieViewers.find({postId: {$in: postIds}}).forEach((viewer) ->
            if !~readerIds.indexOf(viewer.userId)
              readerIds.push(viewer.userId)
          )

        if readerIds.length > 0
          stat.totalbrowses = readerIds.length
          GushitieUsersInner.find({_id: {$in: readerIds}}).forEach((user)->
              if user.profile and user.profile.location
                if !~stat.locations.indexOf(user.profile.location) and stat.locations.length < 5
                  console.log('>>>>: ', user.profile.location)
                  stat.locations.push(user.profile.location)            
          )
          GushitieUsers.find({_id: {$in: readerIds}}).each((err, user)->
              if user.profile and user.profile.location
                if !~stat.locations.indexOf(user.profile.location) and stat.locations.length < 5
                  stat.locations.push(user.profile.location)
          )
          ###
      return stat
    'calcRelationship':(userId)->
      this.unblock()
      resp={}
      me=Meteor.user()
      taGushitieId=null
      myGushitieID=null
      if me and me.services and me.services.gushitie and me.services.gushitie.id
        myGushitieID=me.services.gushitie.id
      else if me and me.gushitie and me.gushitie.id
        myGushitieID=me.gushitie.id

      ta=Meteor.users.findOne({_id:userId})
      resp.taId=ta._id
      resp.taName=ta.name

      if ta and ta.services and ta.services.gushitie and ta.services.gushitie.id
        taGushitieId=ta.services.gushitie.id
      else if ta and ta.gushitie and ta.gushitie.id
        taGushitieId=ta.gushitie.id
      if taGushitieId and myGushitieID
        #Calc the meet time
        mutualPosts = Neo4j.query "MATCH (fromUser:User)-[v:VIEWER]->(p:Post)-[v2:VIEWER]-(toUser:User) WHERE fromUser.userId=\"#{myGushitieID}\" AND toUser.userId=\"#{taGushitieId}\"  RETURN DISTINCT p ORDER BY p.createdBy DESC LIMIT 5"
        meetTimes = mutualPosts.length
        console.log('Meet time '+meetTimes)
        #resp.meets = meetTimes
        if meetTimes > 0
          #Calc the mutual post
          resp.mutualPosts = mutualPosts
          console.log('get post list')
        #Calc the post not read but read by ta
        queryString="MATCH (u:User)-[v:VIEWER]->(p:Post),(u1:User)-[v1:VIEWER]->(p1:Post) WHERE u.userId=\"#{myGushitieID}\" AND u1.userId=\"#{taGushitieId}\" AND p.postId<>p1.postId RETURN p1 ORDER BY p1.createdBy DESC LIMIT 5"
        taRead=Neo4j.query queryString
        resp.taRead = taRead
        #console.log(queryString)
        #console.log(resp.taRead )
        return resp
      #console.log(Meteor.user())

