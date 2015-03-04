if Meteor.isServer
  Meteor.startup ()->
    @JPush = Meteor.npmRequire "jpush-sdk"
    @client = JPush.buildClient '50e8f00890be941f05784e6f', 'ec9940bbc7fcc646fc492ed8'
  @pushnotification = (doc)->
    post = Posts.findOne({_id: doc.postId});
    commentText = doc.content;
    extras = {
      type: "comment"
      postId: doc.postId 
    }

    toUserToken = Meteor.users.findOne({_id: post.owner})
    unless toUserToken is undefined or toUserToken.type is undefined or toUserToken.token is undefined
      pushToken = {type: toUserToken.type, token: toUserToken.token}
      console.log "toUserToken.type:"+toUserToken.type+";toUserToken.token:"+toUserToken.token
      if pushToken.type is 'JPush'
        token = pushToken.token
        console.log 'JPUSH to ' + pushToken.token
        client.push().setPlatform 'ios', 'android'
          .setAudience JPush.registration_id(token)
          .setNotification '回复通知',JPush.ios('您收到了新的回复:'+commentText,null,null,null,extras),JPush.android('您收到了新的回复:'+commentText, null, 1,extras)
          #.setMessage(commentText)
          .setOptions null, 60
          .send (err, res)->
            if err
              console.log err.message
            else
              console.log 'Sendno: ' + res.sendno
              console.log 'Msg_id: ' + res.msg_id
