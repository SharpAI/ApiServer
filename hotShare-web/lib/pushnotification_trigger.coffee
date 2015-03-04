if Meteor.isServer
  Meteor.startup ()->
    @JPush = Meteor.npmRequire "jpush-sdk"
    @client = JPush.buildClient '50e8f00890be941f05784e6f', 'ec9940bbc7fcc646fc492ed8'
  @pushnotification = (type, doc, userId)->
    if type == "comment"
      post = Posts.findOne({_id: doc.postId});
      if post.owner == userId
        #console.log "comment self post"
        return
      commentText = doc.content;
      content = '您收到了新的回复:\n'+commentText
      extras = {
        type: "comment"
        postId: doc.postId
      }
      toUserToken = Meteor.users.findOne({_id: post.owner})
    else
      if doc.owner == userId
        #console.log "read self post"
        return
      content = '有人正在阅读您的故事:\n《' + doc.title + '》'
      extras = {
        type: "read"
        postId: doc._id
      }
      toUserToken = Meteor.users.findOne({_id: doc.owner})


    unless toUserToken is undefined or toUserToken.type is undefined or toUserToken.token is undefined
      pushToken = {type: toUserToken.type, token: toUserToken.token}
      console.log "toUserToken.type:"+toUserToken.type+";toUserToken.token:"+toUserToken.token
      if pushToken.type is 'JPush'
        token = pushToken.token
        console.log 'JPUSH to ' + pushToken.token
        client.push().setPlatform 'ios', 'android'
          .setAudience JPush.registration_id(token)
          .setNotification '回复通知',JPush.ios(content,null,null,null,extras),JPush.android(content, null, 1,extras)
          #.setMessage(commentText)
          .setOptions null, 60
          .send (err, res)->
            if err
              console.log err.message
            else
              console.log 'Sendno: ' + res.sendno
              console.log 'Msg_id: ' + res.msg_id
      else if pushToken.type is 'iOS'
        console.log 'Server PN to iOS '
        token = pushToken.token
        pushServer.sendIOS 'me', token , '', content, 1
      else if pushToken.type is 'GCM'
        console.log 'Server PN to GCM '
        token = pushToken.token
        pushServer.sendAndroid 'me', token , '',content, 1
