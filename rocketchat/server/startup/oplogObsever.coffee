
Meteor.startup ()->
  Fiber = Npm.require('fibers')
  MongoOplog=Meteor.npmRequire('mongo-oplog')
  oplog = MongoOplog('mongodb://oplogger:PasswordForOplogger@host1.tiegushi.com:27017/local?authSource=admin', { ns: 'hotShare.pcomments' }).tail();
  joinRoom=(room,user) ->
    rid=room._id

    if not room?
      return

    now = new Date()

    # Check if user is already in room
    subscription = RocketChat.models.Subscriptions.findOneByRoomIdAndUserId rid, user._id
    if subscription?
      return

    RocketChat.callbacks.run 'beforeJoinRoom', user, room

    RocketChat.models.Rooms.addUsernameById rid, user.username

    RocketChat.models.Subscriptions.createWithRoomAndUser room, user,
      ts: now
      open: true
      alert: true
      unread: 1

    RocketChat.models.Messages.createUserJoinWithRoomIdAndUser rid, user,
      ts: now

    Meteor.defer ->
      RocketChat.callbacks.run 'afterJoinRoom', user, room

    return true

  getUserInfo=(userId)->
    user = getOrCreateGushiTieServiceAccount(userId)
    if user and user.userId
      return Meteor.users.findOne({_id:user.userId})
    else
      return {}
  postCommentToChannel=(info,userInfo)->
    room = RocketChat.models.Rooms.findOneByName info.postId
    post = GushitiePosts.findOne({_id:info.postId})
    if room
      if info.ptype is 'like'
        msg='我喜欢这段：'
      else if info.ptype is 'dislike'
        msg='我不喜欢这段：'
      else if info.ptype is 'pcomments'
        msg=''
        pcomments=post?.pub?[info.pindex]?.pcomments
        if pcomments and pcomments.length > 0
          msg=pcomments[pcomments.length-1].content
        console.log(pcomments)
      joinRoom(room,userInfo)
      url=gushitie_server_url+'/posts/'+info.postId+'/'+info.pindex
      description=post?.pub?[info.pindex]?.text
      title=post?.title
      mainImageUrl=post?.mainImage
      #console.log(post)
      message = {
        rid: room._id,
        msg: msg,
        ts: new Date(),
        u: {
          _id: userInfo._id,
          name: userInfo.name,
          username: userInfo.username
        }
        urls : [
          {
            "url" : url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
            "meta" : {
              "ogSiteName" : "故事贴",
              "ogTitle" : if description? then description else title, #千老这个称谓的来历
              "ogUrl" :url, #http://www.tiegushi.com/posts/NYtJcHfCKSE6GWhmj
              "ogImage" : if mainImageUrl? then mainImageUrl else "", #http://data.tiegushi.com/2Yfmd5PmEDsoECLvg_1459975484141_cdv_photo_001.jpg
  #"ogDescription" : if description? then description else "", #早点一咬牙一跺脚转CS，现在幸福日子望不到头呢！…
              "ogType" : "article"
            },
            "headers" : {
              "contentType" : "text/html; charset=utf-8"
            }
          }
        ]
      }
      RocketChat.models.Messages.createWithTypeRoomIdMessageAndUser(null, message.rid, message.msg, message.u, message)
  postCommentHandle=(doc)->
    console.log(doc)
    Fiber(() ->
      info = doc.o
      userInfo=getUserInfo(info.commentUserId)
      if info and info.postId
        postCommentToChannel(info,userInfo)
      else
        Meteor.call('createChannel',info.postId,[],(err,result)->
          unless err
            postCommentToChannel(info,userInfo)
        )
      return
    ).run()

  ###
  oplog.on('op', (data)->
    console.log(data)
  )
  ###

  oplog.on('insert', (doc)->
    console.log(doc.op)
    postCommentHandle(doc)
  )
  oplog.on('update', (doc)->
    console.log(doc.op)
    postCommentHandle(doc)
  )
  oplog.on('delete', (doc)->
    console.log('delete ')
    console.log(doc)
  )
  oplog.on('error', (error)->
    console.log(error)
  )
  oplog.on('end', ()->
    console.log('Stream ended')
  )
