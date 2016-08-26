if Meteor.isServer
  myCrypto = Meteor.npmRequire "crypto"
  @nodemailer = Meteor.npmRequire('nodemailer');
  if (Meteor.absoluteUrl().toLowerCase().indexOf('host2.tiegushi.com') >= 0)
    process.env['HTTP_FORWARDED_COUNT'] = 1
  console.log("process.env.HTTP_FORWARDED_COUNT="+process.env.HTTP_FORWARDED_COUNT);
  Meteor.startup ()->
    Meteor.methods
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
            if post.browse isnt undefined
              browseTimes = post.browse + 1
            Meteor.defer ()->
              Posts.update({_id:postId},{$set:{browse:browseTimes}})
              pushnotification("read",post,userId)
              unless NoUpdateShare
                Feeds.update({postId:postId,eventType: 'share'},{
                  $inc: { ReadAfterShare: 1 },
                  $set:{checked:false}
                });
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
