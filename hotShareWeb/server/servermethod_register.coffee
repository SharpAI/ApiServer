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
      'clearUserBellWaitReadCount': (userId)->
        Feeds.update({followby: userId,isRead:{$exists:false}},{$set:{isRead: true,checked: true}},{multi: true})

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
      'checkUserByEmail': (email)->
        return Accounts.findUserByEmail(email)
      'sendResetPasswordEmail':(userId, email)->
        return Accounts.sendResetPasswordEmail(userId, email)
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
      'updateGroupReportEmails':(groupId,emails)->
        SimpleChat.Groups.update({_id:groupId},{$set:{report_emails:emails}})
      'updateGroupUserReportEmails':(groupId,userId,emails)->
        SimpleChat.GroupUsers.update({group_id:groupId,user_id:userId},{$set:{report_emails:emails}})
      'updateGroupName':(groupId,name)->
        SimpleChat.Groups.update({_id:groupId},{$set:{name:name}})
        SimpleChat.GroupUsers.update({group_id:groupId},{$set:{group_name:name}},{multi: true})
      'enableHomeAI':()->
        return withEnableHomeAI;
