if Meteor.isServer
  myCrypto = Meteor.npmRequire "crypto"
  Meteor.startup ()->
    Meteor.methods
      "unpublish":(postId,userId,drafts)->
        Meteor.defer ()->
          Posts.update({_id:postId},{$set:{publish:false}})
          SavedDrafts.insert drafts
          FollowPosts.update({postId:postId},{$set:{publish:false}},{multi: true},{upsert:true})
      "unpublishPosts":(postId,userId,drafts)->
        Meteor.defer ()->
          Posts.remove {_id:postId}
          FollowPosts.remove({postId:postId})
          SavedDrafts.insert drafts
          try
            Moments.remove({$or:[{currentPostId:postId},{readPostId:postId}]})
            Feeds.remove({owner:userId,eventType:'SelfPosted',postId:postId})
            TPs=TopicPosts.find({postId:postId})
            if TPs.count()>0
                TPs.forEach (data)->
                    PostsCount = Topics.findOne({_id:data.topicId}).posts
                    if PostsCount is 1
                      Topics.remove({_id:data.topicId})
                    else if PostsCount > 1
                      Topics.update({_id: data.topicId}, {$set: {'posts': PostsCount-1}})
            TopicPosts.remove({postId:postId})
          catch error
      "readPostReport": (postId,userId)->
        if(!Match.test(postId, String) || !Match.test(userId, String))
          return
        try
          post = Posts.findOne({_id:postId})
          browseTimes = 1;
          if post
            if post.browse isnt undefined
              browseTimes = post.browse + 1
            Meteor.defer ()->
              pushnotification("read",post,userId)
          Posts.update({_id:postId},{$set:{browse:browseTimes}})
        catch error
          console.log('Error on RedpostReport' + error)

      "getS3WritePolicy": (filename, URI)->
        MAXIMUM_MB = 10
        SECONDS_BEFORE_TIMEOUT = 600
        s3 = new s3Policies 'AKIAJY2UYZVD3WWOF4JA', 'cTLpygPleqe4BVMlIOo3cJCEza82E7LwSVTwATiM'
        policy = s3.writePolicy filename,'travelers-bucket', SECONDS_BEFORE_TIMEOUT, MAXIMUM_MB
        policy.orignalURI = URI
        #console.log('return policy ' + JSON.stringify(policy))
        policy
      "getBCSSigniture": (filename,URI)->
        content = "MBO" + "\n"+"Method=PUT" + "\n"+"Bucket=travelers-km" + "\n"+"Object=/" + filename + "\n"
        apiKey = '9Ud6jfxuTwkM0a7G6ZPjXbCe'
        SecrectKey = 'zhoMHNUqtmQGgR4Il1GqmZiYoP0pX2AT'
        hash = myCrypto.createHmac('sha1', SecrectKey).update(content).digest()
        Signture = encodeURIComponent hash.toString('base64')
        policy = {
          signture: "MBO:"+apiKey+":"+Signture
          orignalURI: URI
        }
        policy
      "changeMyPassword": (newPassword)->
        Accounts.setPassword this.userId, newPassword
      "getAliyunWritePolicy": (filename, URI)->
        apiKey = 'Vh0snNA4Orv3emBj'
        SecrectKey = 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz'
        date = new Date()
        content = 'PUT\n\nimage/jpeg\n' + date.toGMTString() + '\n' + '/tiegushi/'+filename
        hash = myCrypto.createHmac('sha1', SecrectKey).update(content).digest()
        Signture = unescape(encodeURIComponent hash.toString('base64'))
        #console.log 'Content is ' + content + ' Signture ' + Signture
        authheader = "OSS " + apiKey + ":" + Signture
        policy = {
          orignalURI: URI
          date: date.toGMTString()
          auth: authheader
          acceccURI: 'http://oss.tiegushi.com/'+filename
          readURI: 'http://data.tiegushi.com/'+filename
        }
        policy
      "getGeoFromConnection":()->
        clientIp = this.connection.clientAddress
        #clientIp = '173.236.169.5'
        json = GeoIP.lookup clientIp
        #console.log('This connection is from ' + clientIp + ' Lookup result + ' + JSON.stringify(json))
        json
      'readMessage': (to)->
        switch to.type
          when "user"
            MsgSession.update({userId: this.userId, toUserId: to.id}, {$set: {isRead: true, readTime: new Date(), waitRead: 0}})
            Messages.update({userId: to.id, toUserId: this.userId},$set: {isRead: true, readTime: new Date()})
          when "group"
            MsgSession.update({userId: this.userId, toGroupId: to.id}, {$set: {isRead: true, readTime: new Date(), waitRead: 0}})
            Messages.update({'toUsers.userId': this.userId, toGroupId: to.id},$set: {isRead: true, readTime: new Date()})
          when "session"
            session = MsgSession.findOne(to.id)
            if session.sesType is 'singleChat'
              MsgSession.update({userId: this.userId, toUserId: session.toUserId}, {$set: {isRead: true, readTime: new Date(), waitRead: 0}})
              Messages.update({userId: session.toUserId, toUserId: this.userId},$set: {isRead: true, readTime: new Date()})
            else
              MsgSession.update({userId: this.userId, toGroupId: session.toGroupId}, {$set: {isRead: true, readTime: new Date(), waitRead: 0}})
              Messages.update({'toUsers.userId': this.userId, toGroupId: session.toGroupId},$set: {isRead: true, readTime: new Date()})
      'initReaderPopularPosts': ()->
        this.unblock()
        userId = Meteor.userId()
        if userId is undefined or userId is null
          return false

        Meteor.defer ()->          
          ReaderPopularPosts.find({userId: userId}).forEach((item)->
            ReaderPopularPosts.remove({_id: item._id})
          )

          postIds = []
          Viewers.find({userId: userId}, {sort: {createdAt: -1}, limit: 200}).forEach((item)->
            postIds.push(item.postId)
          )

          Posts.find({_id: {$in: postIds}, browse: {$gte: 10}}, {sort: {browse: -1}, limit: 9}).forEach((item)->
            ReaderPopularPosts.insert({userId: userId, postId: item._id, title: item.title, browse: item.browse, createdAt: new Date()})
          )
        true
      'pushPostToReaderGroups': (feed, groups)->
        if this.userId is null or feed is undefined or feed is null or groups is undefined or groups is null or groups.length is 0
          return false
        self = this
        this.unblock()
        Meteor.defer ()->          
          feeds = []
          readers = []
          Viewers.find({postId: {$in: groups}}).forEach((item)->
            if !~readers.indexOf(item.userId) and item.userId isnt self.userId
              readers.push(item.userId)
              feedItem = _.extend(feed, {followby: item.userId})
              #feeds.push(feedItem)
              Feeds.insert(feedItem)

              Meteor.users.update({_id: item.userId}, {$inc: {'profile.waitReadCount': 1}})
              pushnotification("newpost", {_id: feedItem.postId, ownerName: feedItem.ownerName, title: feedItem.postTitle}, item.userId)
          )
        true


