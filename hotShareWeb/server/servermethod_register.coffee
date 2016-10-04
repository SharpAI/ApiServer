if Meteor.isServer
  myCrypto = Meteor.npmRequire "crypto"
  aliyun = Meteor.npmRequire "aliyun-sdk"
  aliyun_access_key_id = process.env.ALIYUN_ACCESS_KEY_ID
  aliyun_access_key_secret = process.env.ALIYUN_ACCESS_KEY_SECRET
  @nodemailer = Meteor.npmRequire('nodemailer');
  if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
    process.env['HTTP_FORWARDED_COUNT'] = 1
  console.log("process.env.HTTP_FORWARDED_COUNT="+process.env.HTTP_FORWARDED_COUNT);
  # 权限验证
  @confirmReporterAuth = (userId)->
    console.log(userId)
    user = Meteor.users.findOne({_id: userId})
    return user.profile.reporterSystemAuth

  # cdn 刷新
  @refreshPostsCDNCaches = (postId)->
    # this.unblock()
    cdn = new aliyun.CDN({
        accessKeyId: aliyun_access_key_id || 'Vh0snNA4Orv3emBj',
        secretAccessKey: aliyun_access_key_secret || 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz',
        endpoint: 'https://cdn.aliyuncs.com',
        apiVersion: '2014-11-11'
      }
    );
    objectPath = 'http://cdcdn.tiegushi.com/posts/' + postId;

    cdn.refreshObjectCaches({
      ObjectType: 'File',
      ObjectPath: objectPath
    }, (err, res)-> 
      console.log(err, res)
    )
  # 删除阿里云图片
  @delectAliyunPictureObject = (postId)->
    # this.unblock()
    oss = new aliyun.OSS({
      accessKeyId: aliyun_access_key_id || 'Vh0snNA4Orv3emBj',
      secretAccessKey: aliyun_access_key_secret || 'd7p2eNO8GuMl1GtIZ0at4wPDyED4Nz',
      endpoint: 'https://cdn.aliyuncs.com',
      apiVersion: '2014-11-11'
    })
    post =  BackUpPosts.findOne({_id: postId});
    images = []
    if post and post.pub
      post.pub.forEach (item)->
        if item.isImage
          uri = item.imgUrl.split('/')
          filename = uri[uri.length-1]
          images.push {key:filename}
      oss.deleteObjects({
        Bucket: 'tiegushi',
        Delete: {images,Quiet:true}
      }, (err,data)->
        console.log(err, data)
      )
  Meteor.startup ()->
    Meteor.methods
      'socialData': (postId)->
        if !Match.test(postId, String)
          return []
        socialData = getSocialDataFromPostId(postId,this.userId)
        socialData
      'updateThumbs': (postId,userId,pindex,type)->
        if postId is undefined or userId is undefined or pindex is undefined or type is undefined
          return false
        this.unblock();
        post = Posts.findOne({_id: postId})
        if post
          pub = post.pub
          console.log('===userId=='+pub[pindex].likeSum)
          console.log('===type==='+pub[pindex].dislikeSum)
          if pub and pub[pindex]
            # 喜欢
            if type is 'likeAdd'
              if pub[pindex].likeSum isnt 0
                pub[pindex].likeSum = pub[pindex].likeSum +1
              if pub[pindex].likeUserId
                pub[pindex].likeUserId.userId = true
              else
                pub[pindex].likeUserId = {}
                pub[pindex].likeUserId.userId = true
            if type is 'likeDel'
              if pub[pindex].likeSum isnt 0
                pub[pindex].likeSum = pub[pindex].likeSum -1
              if pub[pindex].likeUserId
                  pub[pindex].likeUserId.userId = false
              else
                pub[pindex].likeUserId = {}
                pub[pindex].likeUserId.userId = false
            # 不喜欢
            if type is 'dislikeAdd'
              if pub[pindex].dislikeSum isnt 0
                pub[pindex].dislikeSum = pub[pindex].dislikeSum +1
              if pub[pindex].dislikeUserId
                  pub[pindex].dislikeUserId.userId = false
              else
                pub[pindex].dislikeUserId = {}
                pub[pindex].dislikeUserId.userId = false
            if type is 'dislikeDel'
              if pub[pindex].dislikeSum isnt 0
                pub[pindex].dislikeSum = pub[pindex].dislikeSum -1
              if pub[pindex].dislikeUserId
                  pub[pindex].dislikeUserId.userId = false
              else
                pub[pindex].dislikeUserId = {}
                pub[pindex].dislikeUserId.userId = false

            Posts.update({_id: postId},{$set:{'pub':pub}})
      'updatePcommitContent': (postId, userId, pindex,content)->
        if postId is undefined or userId is undefined or pindex is undefined or content is undefined
          return false
        this.unblock();
        post = Posts.findOne({_id: postId})
        user = Meteor.users.findOne({_id: userId})
        if user 
          userIcon = user.profile.icon
          if user.profile and user.profile.fullname
            userName = user.profile.fullname
          else 
            username = username
        pcomment = {
          content: content,
          createdAt: new Date(),
          userIcon: userIcon,
          userId: userId,
          username: userName
        }
        if post 
          pub = post.pub
          if pub and pub[pindex]
            if !pub[pindex].pcomments
              pub[pindex].pcomments = []
            pub[pindex].pcomments.push(pcomment)
          Posts.update({_id: postId},{$set:{'pub':pub}})
      # Reporter START
      'isTrustedUser': (userId)->
        user = Meteor.users.findOne({_id: userId})
        if !user
          return {hasUser: false}
        else
          if user.profile and user.profile.isTrusted
            return {isTrusted:user.profile.isTrusted,hasUser: true}
          else
            return {isTrusted:false,hasUser: true}
      # mark as trusted
      'markUserAsTrusted': (userId)->
        user = Meteor.users.findOne({_id: userId})
        if !user
          return {noUser: true}
        return Meteor.users.update {_id: userId},{
          $set:{'profile.isTrusted': true}
        }
      'markUserAsMistrusted': (userId)->
        user = Meteor.users.findOne({_id: userId})
        if !user
          return {noUser: true}
        return Meteor.users.update {_id: userId},{
          $set:{'profile.isTrusted': false}
        }
      'reviewPostPass':(userId,postId)->
        if !confirmReporterAuth(userId)
          return false
        url = 'http://cdcdn.tiegushi.com/restapi/postInsertHook/'+userId+'/'+postId
        return HTTP.get(url)
      'reviewPostMiss':(userId,postId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne(postId)
        Posts.remove(postId)
        if post
          return BackUpPosts.insert(post)
      'delectPostAndBackUp': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne({_id:postId})
        if post
          # backup
          BackUpPosts.insert(post)
          # remove
          Posts.remove(postId)
          refreshPostsCDNCaches(postId)
      'delectPostWithUserAndBackUp': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne({_id:postId})
        if post
          # backup
          BackUpPosts.insert(post)
          # remove
          Posts.remove(postId)
          refreshPostsCDNCaches(postId)
        # 禁止用户登录或者发帖
        if post and post.owner
          owner = Meteor.users.findOne({_id: post.owner})
          LockedUsers.insert(owner)
      'restorePost': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = BackUpPosts.findOne({_id:postId})
        if post
          Posts.insert(post)
          BackUpPosts.remove(postId)
          refreshPostsCDNCaches(postId)
      'restoreUser': (userA,userB)->
        if !confirmReporterAuth(userA)
          return false
        LockedUsers.remove({_id: userB})
      'delPostfromDB': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = BackUpPosts.findOne({_id:postId})
        if post
          BackUpPosts.remove(postId)
          delectAliyunPictureObject(postId)
      # reporter END
      'updateTopicPostsAfterComment':(topicPostId,topic,topicPostObj)->
        if Topics.find({text:topic}).count() > 0
          topicData = Topics.find({text:topic}).fetch()[0]
          topicId = topicData._id
        else
          topicId = Topics.insert {
            type:"topic",
            text:topic,
            imgUrl: ""
          }
        topicPostObj.topicId = topicId
        
        console.log topicId
        unless TopicPosts.findOne({postId:topicPostId,topicId: topicId})
          try
            TopicPosts.insert topicPostObj,(err,id)->
              console.log(">>>id>>"+id)
              Topics.update({_id: topicId},{$inc: {posts: 1}})
              return 
          catch error
            console.log error
      'sendErrorReport':(to, from, subject, text)->
        console.log(to)
        console.log(from)
        console.log(subject)
        console.log(text)
        check([from, subject, text], [String])
        this.unblock()
        Email.send ({
            to: to,
            from: from,
            subject: subject,
            text: text
        })
      "updateUserLanguage": (userId, lang)->
        Meteor.defer ()->
          Meteor.users.update({_id: userId},{$set: {'profile.language': lang}})
      'httpCall': (method, url, options)->
        url += '?ip='+this.connection.clientAddress
        if Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0
          url += '&server='+Meteor.absoluteUrl();
        #url += '?ip=12.206.217.29'
        console.log("Call httpCall, url="+url);
        return HTTP.call(method, url, options)
      "updataFeedsWithMe": (userId)->
        Meteor.defer ()->
          Feeds.update({followby: userId},{$set:{isRead: true}},{multi: true})
      "feedsMsgSetAsRead": (id)->
        Meteor.defer ()->
          Feeds.update({_id:id},{$set: {isRead:true}})
      'sendEmailToAdmin':(from, subject, text)->
        to = 'admin@tiegushi.com'
        check([from, subject, text], [String])
        this.unblock()
        Email.send ({
            to: to,
            from: from,
            subject: subject,
            text: text
        })
      "unpublish":(postId,userId,drafts)->
        Meteor.defer ()->
          Posts.update({_id:postId},{$set:{publish:false}})
          SavedDrafts.insert drafts
          FollowPosts.update({postId:postId},{$set:{publish:false}},{multi: true, upsert:true})
          FavouritePosts.remove({postId:postId})
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
            FavouritePosts.remove({postId:postId})
          catch error
      "readPostReport": (postId,userId,NoUpdateShare)->
        if(!Match.test(postId, String) || !Match.test(userId, String))
          return
        try
          this.unblock();
          post = Posts.findOne({_id:postId},{fields:{owner:1,browse:1,title:1}})
          browseTimes = 1;
          if post
            # ======是否显示关注框=========
            view_count = 0
            views= Viewers.find({owner: post.owner, userId: this.userId}, {fields: {count: 1}}).fetch()
            if(views.length > 0)
              for item in views
                view_count += item.count
            view_count += 1

            has_follower = Follower.find({userId: Meteor.userId(), followerId: post.owner}).count() > 0
            has_slef = post.owner is this.userId

            owner_user = Meteor.users.findOne({_id: post.owner})
            has_show_tip = owner_user && owner_user.followTips isnt false ? true : false

            return_result = view_count%5 == 0 and !has_follower and !has_slef and has_show_tip
            console.log('show follow tip:', return_result)
            # ===========================

            if post.browse isnt undefined
              browseTimes = post.browse + 1
            Meteor.defer ()->
              Posts.update({_id:postId},{$set:{browse:browseTimes}})
              Viewers.update({postId: postId, userId: userId}, {$inc: {count: 1}, $set: {owner: post.owner}}); 
              pushnotification("read",post,userId)
              unless NoUpdateShare
                Feeds.update({postId:postId,eventType: 'share'},{
                  $inc: { ReadAfterShare: 1 },
                  $set:{checked:false}
                });

            return return_result
        catch error
          console.log('Error on RedpostReport' + error)
        return

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
      "changeMyPassword": (userId, newPassword)->
        Accounts.setPassword userId, newPassword
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
          Viewers.find({userId: userId}, {sort: {createdAt: -1}, limit: 50}).forEach((item)->
            postIds.push(item.postId)
          )

          Posts.find({_id: {$in: postIds}, browse: {$gte: 5}}, {sort: {browse: -1}, limit: 9}).forEach((item)->
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

          relatedUserIds = []
          Posts.find({_id: {$in: groups}}).forEach((item)->
            if !~relatedUserIds.indexOf(item.owner)
              relatedUserIds.push(item.owner)

              recommendItem = {
                targetPostId: item._id
                targetPostTitle: item.title
                targetPostAddonTitle: item.addontitle
                relatedUserId: item.owner
                relatedUserName: item.ownerName
                relatedUserIcon: item.ownerIcon
                recommendUserId: feed.owner
                recommendUserName: feed.ownerName
                recommendUserIcon: feed.ownerIcon
                recommendPostId: feed.postId
                recommendPostTitle: feed.postTitle
                recommendPostMainImage: feed.mainImage
                recommendPostCreatedAt: feed.createdAt
                readUsers: []
                createdAt: new Date()
              }
              Recommends.insert(recommendItem)
          )          
        true

      'pushPostToHotPostGroups': (feed, groups)->
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
          Posts.update({_id: {$in: groups}}, {$set: {hasPush: true}}, {multi: true})
        true

      'addAssociatedUserNew': (userInfo)->
        this.unblock()
        isEmail = /[a-z0-9-]{1,30}@[a-z0-9-]{1,65}.[a-z]{2,6}/
        # check params
        if !this.userId or !userInfo or !userInfo.username or !userInfo.password
          return {status: 'ERROR', message: 'Invalid Username'}
        # find user
        # console.log 'testEmail is ' + isEmail.test(userInfo.username)
        if isEmail.test(userInfo.username) is true
          userTarget = Accounts.findUserByEmail(userInfo.username)
          # console.log 'this User Target is Email ' + userTarget
        else
          userTarget = Accounts.findUserByUsername(userInfo.username)
          # console.log 'this User Target is Username ' + userTarget
        if !userTarget
          return {status: 'ERROR', message: 'Invalid Username'}
        if userTarget._id is this.userId
          return {status: 'ERROR', message: 'Can not add their own'}

        # console.log 'userTarget is ' + userTarget
        # check passwod
        isMatch = false
        if userTarget isnt undefined and userTarget isnt null
          if userInfo.type is undefined or userInfo.type is null
            userInfo.type = ''
          if userInfo.token is undefined or userInfo.token is null
            userInfo.token = ''
          passwordTarget = {digest: userInfo.password, algorithm: 'sha-256'};
          result = Accounts._checkPassword(userTarget, passwordTarget)
          isMatch = (result.error is undefined)
        unless isMatch
          return {status: 'ERROR', message: 'Invalid Password'}

        # check relation
        if UserRelation.find({userId: this.userId, toUserId: userTarget._id}).count() > 0
          return {status: 'ERROR', message: 'Exist Associate User'}

        # update token
        if userInfo.type and userInfo.token
          Meteor.users.update({_id: userTarget._id}, {$set: {type: userInfo.type, token: userInfo.token}})

        # save relation
        # 只记录单向关系
        me = Meteor.users.findOne({_id: this.userId}, {fields: {_id: 1, username: 1, 'profile.fullname': 1, 'profile.icon': 1}})
        UserRelation.insert {
          userId: me._id
          name: if me.profile and me.profile.fullname then me.profile.fullname else me.username
          icon: if me.profile and me.profile.icon then me.profile.icon else '/userPicture.png'
          toUserId: userTarget._id
          toName: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
          toIcon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
          createAt: new Date()
        }
        if UserRelation.find({toUserId: this.userId, userId: userTarget._id}).count() <= 0
          UserRelation.insert {
            userId: userTarget._id
            name: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
            icon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
            toUserId: me._id
            toName: if me.profile and me.profile.fullname then me.profile.fullname else me.username
            toIcon: if me.profile and me.profile.icon then me.profile.icon else '/userPicture.png'
            createAt: new Date()
          }
        # me = Meteor.users.findOne({_id: this.userId})
        # UserRelation.insert {
        #   userId: me._id
        #   name: if me.profile and me.profile.fullname then me.profile.fullname else me.username
        #   icon: if me.profile and me.profile.icon then me.profile.icon else '/userPicture.png'
        #   toUserId: userTarget._id
        #   toName: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
        #   toIcon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
        #   createAt: new Date()
        # }
        # UserRelation.insert {
        #   userId: userTarget._id
        #   name: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
        #   icon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
        #   toUserId: me._id
        #   toName: if me.profile and me.profile.fullname then me.profile.fullname else me.username
        #   toIcon: if me.profile and me.profile.icon then me.profile.icon else '/userPicture.png'
        #   createAt: new Date()
        # }
        # UserRelation.find({userId: this.userId}).forEach (relation)->
        #   if relation.toUserId isnt userTarget._id
        #     UserRelation.insert {
        #       userId: relation.toUserId
        #       name: relation.toName
        #       icon: relation.toIcon
        #       toUserId: userTarget._id
        #       toName: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
        #       toIcon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
        #       createAt: new Date()
        #     }
        #     UserRelation.insert {
        #       userId: userTarget._id
        #       name: if userTarget.profile and userTarget.profile.fullname then userTarget.profile.fullname else userTarget.username
        #       icon: if userTarget.profile and userTarget.profile.icon then userTarget.profile.icon else '/userPicture.png'
        #       toUserId: relation.toUserId
        #       toName: relation.toName
        #       toIcon: relation.toIcon
        #       createAt: new Date()
        #     }

        return {status: 'SUCCESS'}

      'removeAssociatedUserNew': (userId)->
        this.unblock()
        if !this.userId or !userId
          return false
        if UserRelation.find({userId: this.userId, toUserId: userId}).count() <= 0
          return false

        UserRelation.remove({userId: this.userId, toUserId: userId})
        UserRelation.remove({userId: userId, toUserId: this.userId})
        # UserRelation.remove({userId: userId})

        return true

      'addAssociatedUser': (userInfo)->
        this.unblock()
        Meteor.defer ()->
          try
            Meteor.call 'addAssociatedUserNew', userInfo
          catch e

        if this.userId is undefined or this.userId is null or userInfo is undefined or userInfo is null
          return false

        if userInfo.username is undefined or userInfo.username is null or userInfo.password is undefined or userInfo.password is null
          return false

        #this.unblock()

        self = this

        #Meteor.defer ()->
        userTarget = Accounts.findUserByUsername(userInfo.username)

        if userTarget is undefined or userTarget is null
          userTarget = Accounts.findUserByEmail(userInfo.username)
        #userTarget = Meteor.users.findOne({username: userInfo.username});

        if userTarget is undefined or userTarget is null
          return {status: 'ERROR', message: 'Invalid Username'}

        if userTarget._id is this.userId
          return {status: 'ERROR', message: 'Can not add their own'}

        if AssociatedUsers.find($or: [{userIdA: userTarget._id, userIdB: self.userId}, {userIdA: self.userId, userIdB: userTarget._id}]).count() > 0
          return {status: 'ERROR', message: 'Exist Associate User'}

        isMatch = false
        if userTarget isnt undefined and userTarget isnt null
          if userInfo.type is undefined or userInfo.type is null
            userInfo.type = ''
          if userInfo.token is undefined or userInfo.token is null
            userInfo.token = ''

          passwordTarget = {digest: userInfo.password, algorithm: 'sha-256'};
          result = Accounts._checkPassword(userTarget, passwordTarget)
          isMatch = (result.error is undefined)
          isMatch && AssociatedUsers.insert({userIdA: self.userId, userIdB: userTarget._id, createdAt: Date.now()})
          if isMatch
            Meteor.users.update({_id: userTarget._id}, {$set: {type: userInfo.type, token: userInfo.token}})
        #  return
        if isMatch
        #throw new Meteor.Error 404, "value should be 1, bro"
          return {status: 'SUCCESS'}
        else
          return {status: 'ERROR', message: 'Invalid Password'}
      'removeAssociatedUser': (userId)->
        this.unblock()
        Meteor.defer ()->
          try
            Meteor.call 'removeAssociatedUserNew', userId
          catch e

        if this.userId is undefined or this.userId is null or userId is undefined or userId is null
          return false
        self = this
        Meteor.defer ()->
          AssociatedUsers.remove($or: [{userIdA: userId, userIdB: self.userId}, {userIdA: self.userId, userIdB: userId}])
          return
        return
      'addBlackList': (blacker, blackBy)->
        BlackList.insert({blacker: [blacker],blackBy: blackBy})
      'refreshAssociatedUserToken': (data)->
        return
        # if data is undefined or data is null
        #   return false
        # if data.type is undefined or data.type is null
        #   data.type = ''
        # if data.token is undefined or data.token is null
        #   data.token = ''

        # this.unblock()
        # self = this
        # Meteor.defer ()->
        #   AssociatedUsers.find({$or: [{userIdA: self.userId}, {userIdB: self.userId}]}).forEach((item)->
        #     if item.userIdA != self.userId
        #       Meteor.users.update({_id: item.userIdA}, {$set: {type: data.type, token: data.token}})
        #     if item.userIdB isnt self.userId
        #       Meteor.users.update({_id: item.userIdB}, {$set: {type: data.type, token: data.token}})
        #   )

      'sendEmailByWebFollower': (id, event)->
        console.log("start send share email")
        user = Meteor.users.findOne({_id: this.userId})
        if user.profile.fullname
          username = user.profile.fullname
        else
          username = user.username
        slef = this
        Meteor.defer ()->
          post = Posts.findOne({_id: id})
          reg = new RegExp('[.^*#]','g')
          title = post.title.replace(reg,'-')
          addontitle = post.addontitle.replace(reg,'-')
          subject = '您在故事贴上关注的“'+username+'”'+(if event is 'share' then '分享了故事' else '发表了新故事')+'：《'+title+'》'
          text = Assets.getText(if event is 'share' then 'email/share-post.html' else 'email/push-post.html')
          text = text.replace('{{post.title}}', title)
          text = text.replace('{{post.subtitle}}', addontitle)
          text = text.replace('{{post.author}}', post.ownerName)
          if post.ownerIcon is '/userPicture.png'
            text = text.replace('{{post.icon}}', 'http://www.tiegushi.com'+post.ownerIcon)
          else
            text = text.replace('{{post.icon}}', post.ownerIcon)
          text = text.replace('{{post.time}}', PUB.formatTime(post.createdAt))
          text = text.replaceAll('{{post.href}}', 'http://cdn.tiegushi.com/posts/' + post._id)
          text = text.replace('{{post.mainImage}}', post.mainImage)

          content = '[暂无内容]'
          for item in post.pub
            if item.type is 'text'
              content = item.text
              break
          text = text.replace('{{post-content}}', content)
          userEmail = []
          Follower.find({followerId: slef.userId, fromWeb: true}).fetch().forEach (item)->
            userEmail.push(item.userEmail)
          try
              Email.send {
                bcc: userEmail
                from: '故事贴<notify@mail.tiegushi.com>'
                subject: subject
                html: text
              }
              console.log('send mail to:', userEmail)
          catch ex
            console.log(ex)
        return
      'readFeedsStatus': (id)->
        console.log('readFeedsStatus:', id);
        Feeds.update({_id:id},{$set: {checked:true}})
