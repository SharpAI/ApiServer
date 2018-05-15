if Meteor.isServer
  myCrypto = Npm.require "crypto"
  aliyun = Meteor.npmRequire "aliyun-sdk"
  aliyun_access_key_id = process.env.ALIYUN_ACCESS_KEY_ID
  aliyun_access_key_secret = process.env.ALIYUN_ACCESS_KEY_SECRET
  @nodemailer = Meteor.npmRequire('nodemailer');
  #if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
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
    objectPath = 'http://'  +server_domain_name+'/posts/' + postId;

    cdn.refreshObjectCaches({
      ObjectType: 'File',
      ObjectPath: objectPath
    }, (err, res)->
      console.log(err, res)
    )

    wechatPath = 'http://'  +server_domain_name+'/posts/' + postId + '?from=singlemessage&isappinstalled=1';
    cdn.refreshObjectCaches({
      ObjectType: 'File',
      ObjectPath: wechatPath
    }, (err, res)->
      console.log(err, res)
    )

    cdn.refreshObjectCaches({
        ObjectType: 'File',
        ObjectPath: rawPath
      }, (err, res)->
        console.log(err, res)
    )

    rawPath = 'http://'  +server_domain_name+'/raw/' + postId;
    cdn.refreshObjectCaches({
        ObjectType: 'File',
        ObjectPath: rawPath
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
  # 发送关注成功邮件
  @sendSubscribeAutorEmail = (ownerName,email)->
    text = Assets.getText('email/follower-notify.html')
    try
      Email.send {
        to: email,
        from: '故事贴<notify@mail.tiegushi.com>',
        subject: '成功关注作者：'+ownerName + '',
        body: '成功关注作者：'+ownerName + ',我们会不定期的为您推送关注作者的新文章！',
        html: text
      }
    catch error
      console.log("sendSubscribeAutorEmail Error===:"+error)
  @addToUserFavPosts = (postId,userId)->
    favp = FavouritePosts.findOne({postId: postId, userId: userId})
    if favp
      FavouritePosts.update({_id: favp._id}, {$set: {updateAt: new Date()}})
    else
      FavouritePosts.insert({postId: postId, userId: userId, createdAt: new Date(), updateAt: new Date()})
  Meteor.startup ()->
    Meteor.methods
      "isDeviceInDB": (uuid)->
        try
          #return Devices.find({uuid: uuid}).count() > 0
          item = Devices.findOne({uuid: uuid}, {fields:{groupId:1}})
          console.log("isDeviceInDB: item="+JSON.stringify(item))
          if item
            return [item]
          else
            return []
        catch error
          console.log('checke device in db Err=', JSON.stringify(error))
          return false
      "clusteringFixPersons": (ids, marked_ids)->
        try
          result1 = Clustering.update({_id: {$in: ids}},{
            $set:{
              isOneSelf: false,
              marked: true
            }
          },{multi: true})

          result2 = Clustering.update({_id: {$in: marked_ids}},{
            $set:{marked: true}
          },{multi: true})
          return '标记'+(result1 + result2) + '张(其中'+result1 + '为错，'+ result2 + '为对）'
        catch error
          console.log('clusteringFixPersons Err=',JSON.stringify(error))
          return false
      'clearDiscoverMSG': (userId,postId)->
        if !Match.test(userId, String) or !Match.test(postId, String)
          return {msg: 'failed'}
        console.log('user='+userId+', post=='+postId)
        Feeds.update({followby:userId,checked:false, eventType: {$nin: ['share','personalletter']}},{$set: {checked: true}},{multi: true})
        recommendPosts = Recommends.find({relatedPostId: postId}).fetch()
        if recommendPosts and recommendPosts.length > 0
          userLists = []
          recommendPosts.forEach (item)->
            if item.readUsers
              userLists = item.readUsers
            userLists.push(userId)
            Recommends.update({_id:item._id},{$set: {readUsers: userLists}})
        return {msg: 'success'}
      "isDeviceInDB": (uuid)->
        try
          return Devices.find({uuid: uuid}).count() > 0
        catch error
          console.log('checke device in db Err=', JSON.stringify(error))
          return false
      'pushRecommendStoryToReaderGroups': (postId, storyId, userId)->
        if this.userId is null or postId is undefined or postId is null or storyId is undefined or storyId is null
          return false
        self = this
        this.unblock()

        # login user
        if(!userId)
          userId = this.userId
        me = Meteor.users.findOne({_id: userId})

        Meteor.defer ()->
          readers = []
          # post = Posts.findOne({_id: postId})
          story = Posts.findOne({_id: storyId})
          feed = {
            owner: story.owner,
            ownerName: story.ownerName,
            ownerIcon: story.ownerIcon,
            # recommander 推荐者信息
            recommanderId: userId,
            recommander: if me.profile and me.profile.fullname then me.profile.fullname else me.username,
            recommanderIcon: if me.profile and me.profile.icon then me.profile.icon else '/userPicture.png',
            eventType: 'recommand',
            postId: story._id,
            postTitle: story.title,
            mainImage: story.mainImage,
            createdAt: new Date(),
            heart: 0,
            retweet: 0,
            comment: 0
          }
          Viewers.find({postId: postId}).forEach((item)->
            if !~readers.indexOf(item.userId) and item.userId isnt self.userId
              readers.push(item.userId)
              console.log(item.userId)
              feedItem = _.extend(feed, {followby: item.userId})
              Feeds.insert(feedItem)
              Meteor.users.update({_id: item.userId}, {$inc: {'profile.waitReadCount': 1}})
              pushnotification("recommand", {postId: postId, ownerName: feedItem.ownerName, title: feedItem.postTitle, recommander: feedItem.recommander, followby: item.userId}, item.userId)
          )

          relatedUserIds = []
          Posts.find({_id: postId}).forEach((item)->
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
      'getRecommendStorys': (userId,limit,skip,isFav)->
        if isFav
          postIds = []
          FavouritePosts.find({userId: userId}).forEach((item) ->
            if !~postIds.indexOf(item.postId)
              postIds.push(item.postId)
          )
          options = {_id: {$in: postIds}}
        else
          options = {owner: userId}
        posts = Posts.find(options,{fields:{mainImage:1,addontitle:1,title:1, pub:1},limit: limit,skip:skip}).fetch()
      'clearUserBellWaitReadCount': (userId)->
        Feeds.update({followby: userId,isRead:{$exists:false}},{$set:{isRead: true,checked: true}},{multi: true})
      'sendAuthorEmail': (userId,postId,email,content)->
        user = Meteor.users.findOne({_id: userId})
        post = Posts.findOne({_id: postId})
        if user
          if user.profile.fullname
            username = user.profile.fullname
          else
            username = user.username
          userIcon = user.profile.icon
        else
          return false
        doc = {
          user: userId,
          userName: username,
          userIcon: userIcon,
          email: email,
          ownerId: post.owner,
          content: content,
          postId: postId,
          title: post.title,
          addontitle: post.addontitle,
          mainImage: post.mainImage
        }
        Meteor.call('personalLetterSendEmailFeedback', doc)
      'updateSubscribeAutorEmail':(author,userId,email)->
        if !Match.test(author, String) or !Match.test(userId, String) or !Match.test(email, String)
            return {msg: 'failed'}
        try
          followerCount = Follower.find({followerId: author, userId: userId,userEmail: {$exists: true}}).count()
          owner = Meteor.users.findOne({_id: author})
          ownerName = if owner.profile.fullname and owner.profile.fullname isnt '' then owner.profile.fullname else owner.username
          if followerCount > 0
            upFollowId = Follower.findOne({followerId:author,userId: userId})._id
            result =  Follower.update {
              _id: upFollowId
            },
            {
              $set:{
                userEmail: email
                fromWeb: true
              }
            }
            if result is 1
              sendSubscribeAutorEmail(ownerName,email)
            return {msg: 'success'}
          else
            user = Meteor.users.findOne({_id: userId})
            Meteor.users.update({_id: author}, {$inc: {'profile.web_follower_count': 1}});
            result =  Follower.insert {
              userId: userId
              #这里存放fullname
              userName: if user.profile.fullname and user.profile.fullname isnt '' then user.profile.fullname else user.username
              userIcon: user.profile.icon
              userDesc: user.profile.desc
              # 存放关注者的Email
              userEmail: email
              followerId: author
              #这里存放fullname
              followerName: ownerName
              followerIcon: owner.profile.icon
              followerDesc: owner.profile.desc
              # 存放关注来源
              fromWeb: true
              createAt: new Date()
            }
            if Match.test(result, String)
              sendSubscribeAutorEmail(ownerName,email)
            return {msg: 'success'}
          return {msg: 'failed'}
        catch error
          console.log(error)
      'getMoreFavouritePosts': (userId, skip, limit)->
        postIds = []
        FavouritePosts.find({userId: userId}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
        )
        favouritePosts = Posts.find({_id: {$in: postIds}},{fields:{mainImage:1,addontitle:1,title:1},sort:{createdAt:-1},limit: limit,skip:skip}).fetch()
        return favouritePosts
      'updateUserNike': (id, val)->
        Meteor.users.update({_id: id}, {$set: {'profile.fullname': val}})
        return;
      'updateUserSex': (id, val)->
        Meteor.users.update({_id: id}, {$set: {'profile.sex': val}})
        return;
      'updateFollower':(userId,options)->
        Meteor.defer ()->
          try
            if options.name
              Follower.update({userId:userId},{$set:{'userName':options.name}},{multi: true, upsert:false})
              Follower.update({followerId:userId},{$set:{'followerName':options.name}},{multi: true, upsert:false})
              SimpleChat.GroupUsers.update({user_id:userId},{$set:{'user_name':options.name}},{multi: true, upsert:false})
            if options.icon
              Follower.update({userId:userId},{$set:{'userIcon':options.icon}},{multi: true, upsert:false})
              Follower.update({followerId:userId},{$set:{'followerIcon':options.icon}},{multi: true, upsert:false})
              SimpleChat.GroupUsers.update({user_id:userId},{$set:{'user_icon':options.icon}},{multi: true, upsert:false})
          catch error
            console.log('Error on updateFollower' + error)
      'profileData': (userId)->
        if !Match.test(userId, String)
          return []
        this.unblock()
        viewPostIds = []
        viewers = Viewers.find({userId: userId},{limit:10}).forEach((item) ->
          if !~viewPostIds.indexOf(item.postId)
            viewPostIds.push(item.postId)
        )
        console.log(JSON.stringify(viewers))
        recentViewPosts = Posts.find({_id: {$in: viewPostIds}},{fields:{mainImage:1,addontitle:1,title:1},sort:{createdAt:-1},limit: 3}).fetch()
        postIds = []
        FavouritePosts.find({userId: userId},{limit:10}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
        )
        favouritePosts = Posts.find({_id: {$in: postIds}},{fields:{mainImage:1,addontitle:1,title:1},sort:{createdAt:-1},limit: 10}).fetch()
        console.log('favouritePosts=='+JSON.stringify(favouritePosts))
        profileData = {
          recentViewPosts: recentViewPosts,
          favouritePosts: favouritePosts,
          mePosts: Posts.find({owner: userId},{fields:{mainImage:1,addontitle:1,title:1},sort:{createdAt:-1},limit: 10}).fetch()
        }
        return profileData
      'socialData': (postId)->
        if !Match.test(postId, String)
          return []
        this.unblock();
        socialData = getSocialDataFromPostId(postId,this.userId)
        socialData
      'updateThumbs': (postId,userId,pindex,type)->
        if !Match.test(postId, String) or !Match.test(userId, String) or !Match.test(pindex, Number) or !Match.test(type, String)
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
              Meteor.defer ()->
                addToUserFavPosts(postId, userId)
              if typeof pub[pindex].likeSum isnt 'undefined'
                pub[pindex].likeSum = pub[pindex].likeSum+1
              else
                pub[pindex].likeSum = 1
              unless pub[pindex].likeUserId
                pub[pindex].likeUserId = {}
              pub[pindex].likeUserId['userId'] = true
              pub[pindex].likeUserId[userId] = true
            if type is 'likeDel'
              if typeof pub[pindex].likeSum isnt 'undefined'
                pub[pindex].likeSum = pub[pindex].likeSum-1
              else
                pub[pindex].likeSum = 0
              if pub[pindex].likeSum is 0
                delete pub[pindex].likeUserId
              else
                delete pub[pindex].likeUserId[userId]
            # 不喜欢
            if type is 'dislikeAdd'
              if typeof pub[pindex].dislikeSum isnt 'undefined'
                pub[pindex].dislikeSum = pub[pindex].dislikeSum+1
              else
                pub[pindex].dislikeSum = 1
              unless pub[pindex].dislikeUserId
                pub[pindex].dislikeUserId = {}
              pub[pindex].dislikeUserId['userId'] = true
              pub[pindex].dislikeUserId[userId] = true
            if type is 'dislikeDel'
              if typeof pub[pindex].dislikeSum isnt 'undefined'
                pub[pindex].dislikeSum = pub[pindex].dislikeSum-1
              else
                pub[pindex].dislikeSum = 0
              if pub[pindex].dislikeSum is 0
                delete pub[pindex].dislikeUserId
              else
                delete pub[pindex].dislikeUserId[userId]

            Posts.update({_id: postId},{$set:{'pub':pub}})
            updateServerSidePcommentsHookDeferHandle(userId,post,type,pindex)
            return true
        false
      'updatePcommitContent': (postId, userId, pindex,content)->
        if !Match.test(postId, String) or !Match.test(userId, String) or !Match.test(pindex, Number) or !Match.test(content, String)
          return false
        this.unblock();
        Meteor.defer ()->
          addToUserFavPosts(postId, userId)
        post = Posts.findOne({_id: postId})
        user = Meteor.users.findOne({_id: userId})
        if user
          userIcon = user.profile.icon
          if user.profile and user.profile.fullname
            userName = user.profile.fullname
          else
            userName = user.username
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
          updateServerSidePcommentsHookDeferHandle(userId,post,'pcomments',pindex)
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
        url = review_post_url+userId+'/'+postId
        # console.log('reviewPostPass url:', url);
        return HTTP.get(url)
      'reviewPostMiss':(userId,postId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne(postId)
        if post
          owner = Meteor.users.findOne({_id: post.owner})
          RePosts.remove(postId)
          Posts.remove(postId)
          reporterLogs.insert({
            userId:post.owner,
            userName: post.ownerName,
            userEmails: owner.emails,
            postId: postId,
            postTitle: post.title,
            postCreatedAt: post.createdAt,
            eventType: '不通过帖子审核',
            loginUser: userId,
            createdAt: new Date()
          })
          TPs=TopicPosts.find({postId:postId})
          if TPs.count()>0
            TPs.forEach (data)->
              PostsCount = Topics.findOne({_id:data.topicId}).posts
              if PostsCount is 1
                Topics.remove({_id:data.topicId})
              else if PostsCount > 1
                Topics.update({_id: data.topicId}, {$set: {'posts': PostsCount-1}})
          TopicPosts.remove({postId:postId})
          return BackUpPosts.insert(post)
      'delectPostAndBackUp': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne({_id:postId})
        if post?
          owner = Meteor.users.findOne({_id: post.owner})
          reporterLogs.insert({
            userId:post.owner,
            userName: post.ownerName,
            userEmails: owner.emails,
            postId: postId,
            postTitle: post.title,
            postCreatedAt: post.createdAt,
            eventType: '删除帖子',
            loginUser: userId,
            createdAt: new Date()
          })
          # backup
          BackUpPosts.insert(post)
          # remove
          RePosts.remove(postId)
          Posts.remove(postId)
          refreshPostsCDNCaches(postId)
      'delectPostWithUserAndBackUp': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = Posts.findOne({_id:postId})
        owner = Meteor.users.findOne({_id: post.owner})
        reporterLogs.insert({
          userId:post.owner,
          userName: post.ownerName,
          userEmails: owner.emails,
          postId: postId,
          postTitle: post.title,
          postCreatedAt: post.createdAt,
          eventType: '删除帖子并禁止用户登录',
          loginUser: userId,
          createdAt: new Date()
        })
        if post
          # backup
          BackUpPosts.insert(post)
          # remove
          RePosts.remove(postId)
          Posts.remove(postId)
          refreshPostsCDNCaches(postId)
        # 禁止用户登录或者发帖
        if post and post.owner
          owner = Meteor.users.findOne({_id: post.owner})
          locked = LockedUsers.findOne({_id: owner._id})
          if locked is undefined
            LockedUsers.insert(owner)
      'restorePost': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = BackUpPosts.findOne({_id:postId})
        try
          owner = Meteor.users.findOne({_id: post.owner})
          reporterLogs.insert({
            userId:post.owner,
            userName: post.ownerName,
            userEmails: owner.emails,
            postId: postId,
            postTitle: post.title,
            postCreatedAt: post.createdAt,
            eventType: '恢复帖子',
            loginUser: userId,
            createdAt: new Date()
          })
        catch error
          console.log error
        if post
          Posts.insert(post)
          console.log('isReview:', post.isReview)
          if(post.isReview is false)
            RePosts.insert(post)
          BackUpPosts.remove(postId)
          refreshPostsCDNCaches(postId)
      'restoreUser': (userA,userB)->
        if !confirmReporterAuth(userA)
          return false
        owner = Meteor.users.findOne({_id: userB})
        if owner and owner.profile and owner.profile.fullname
          userName = owner.profile.fullname
        else
          userName = owner.username
        reporterLogs.insert({
          userId:owner._id,
          userName: userName,
          userEmails: owner.emails,
          postId: null,
          postTitle: null,
          postCreatedAt: null,
          eventType: '恢复用户',
          loginUser: userA,
          createdAt: new Date()
        })
        LockedUsers.remove({_id: userB})
      'delPostfromDB': (postId,userId)->
        if !confirmReporterAuth(userId)
          return false
        post = BackUpPosts.findOne({_id:postId})
        owner = Meteor.users.findOne({_id: post.owner})
        reporterLogs.insert({
          userId:post.owner,
          userName: post.ownerName,
          userEmails: owner.emails,
          postId: postId,
          postTitle: post.title,
          postCreatedAt: post.createdAt,
          eventType: '彻底删除帖子',
          loginUser: userId,
          createdAt: new Date()
        })
        if post
          BackUpPosts.remove(postId)
          RePosts.remove(postId)
          delectAliyunPictureObject(postId)
      # reporter END
      'updateTopicPostsAfterUpdatePost':(topicPostId)->
        _post = Posts.findOne({_id: topicPostId})
        if TopicPosts.find({postId:topicPostId}).count()>0 and _post
          try
            TopicPosts.update({postId:topicPostId},{$set:{mainImage:_post.mainImage,title:_post.title}},{multi: true, upsert:true})
          catch error
            console.log error
        else
         console.log 'TopicPosts not find with postId:'+topicPostId

      'updateTopicPostsAfterComment':(topicPostId,topic,topicPostObj)->
        _post = Posts.findOne({_id: topicPostId})
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
        if _post and _post.mainImage
          topicPostObj.mainImage = _post.mainImage
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
          Feeds.update({followby: userId,isRead:{$exists:false}},{$set:{isRead: true}},{multi: true})
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
          SavedDrafts.update({_id:postId}, {$set:drafts}, {upsert:true})
          FollowPosts.update({postId:postId},{$set:{publish:false}},{multi: true, upsert:true})
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
          refreshPostsCDNCaches(postId)
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
      'updatePushToken':(data)->
        console.log  'updatePushToken with userId: '+data.userId+' token:'+data.token+' type:'+data.type
        if data.token is undefined
          return
        token = data.token
        type = data.type
        userId = data.userId
        pushTokenObj = PushTokens.findOne({type: type,token: token})
        if pushTokenObj is undefined
          try
            PushTokens.insert(data)
          catch error
            console.log error
        else
          try
            if pushTokenObj.userId isnt userId and userId isnt ''
              Meteor.users.update({_id:userId}, {$set: {'profile.waitReadCount': 0}});
            PushTokens.update({type: type,token: token},{$set:{userId: userId}})
          catch error
            console.log error
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
              if owner_user
                waitReadCount = owner_user.profile.waitReadCount
              if waitReadCount is undefined or isNaN(waitReadCount)
                waitReadCount = 0
              Meteor.users.update({_id:post.owner}, {$set: {'profile.waitReadCount': waitReadCount+1}});
              console.log  'read waitReadCount'
              pushnotification("read",post,userId)
              ###
              if(browseTimes < 11)
                pushnotification("read",post,userId)
              if(browseTimes > 10 and browseTimes < 101 and (browseTimes % 5) == 0)
                pushnotification("read",post,userId)
              if(browseTimes > 100 and (browseTimes % 20) == 0)
                pushnotification("read",post,userId)
              ###
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
                relatedPostId: item._id
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
      'updatePostUser': (postId, userId)->
        Meteor.setTimeout(
          ()->
            user = Meteor.users.findOne({_id: userId})
            post = Posts.findOne({_id: postId})
            if(!user or !post)
              return
            Posts.update({_id: postId}, {$set: {
              ownerId: userId,
              owner: userId,
              ownerIcon: if user.profile and user.profile.icon then user.profile.icon else '/userPicture.png',
              ownerName: if user.profile and user.profile.fullname then user.profile.fullname else user.username
            }})
            FollowPosts.update({postId: postId, followby: post.owner}, {$set: {
              followby: userId
            }})
            FollowPosts.update({postId: postId}, {$set: {
              owner: userId,
              ownerIcon: if user.profile and user.profile.icon then user.profile.icon else '/userPicture.png',
              ownerName: if user.profile and user.profile.fullname then user.profile.fullname else user.username
            }}, {multi: true})
          1000
        )
      'updateGroupReportEmails':(groupId,emails)->
        SimpleChat.Groups.update({_id:groupId},{$set:{report_emails:emails}})
      'updateGroupUserReportEmails':(groupId,userId,emails)->
        SimpleChat.GroupUsers.update({group_id:groupId,user_id:userId},{$set:{report_emails:emails}})
      'updateGroupName':(groupId,name)->
        SimpleChat.Groups.update({_id:groupId},{$set:{name:name}})
        SimpleChat.GroupUsers.update({group_id:groupId},{$set:{group_name:name}},{multi: true})
      'enableHomeAI':()->
        return withEnableHomeAI;
