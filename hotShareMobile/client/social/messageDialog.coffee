chat_now_time = undefined
chat_show_time = undefined

Template.messageDialog.created=->
  chat_now_time = new Date()
  chat_show_time = undefined

Template.messageDialog.rendered=->
  this.$('.message').css('min-height',$(window).height()-90)
  Meteor.subscribe("userinfo", Session.get("ProfileUserId"))
  Meteor.subscribe(
    "messages"
    Session.get("ProfileUserId")
    onStop: ()->
    onReady: ()->
      document.body.scrollTop = document.body.scrollHeight
  )
  
Template.messageDialog.helpers
  isMe: (obj)->
    obj.userId is Meteor.userId()
    
  isImage: (obj)->
    obj.msgType is 'image'
    
  isText: (obj)->
    obj.msgType is 'text'
    
  messages: ()->
    Messages.find({userId: Meteor.userId(), toUserId: Session.get("ProfileUserId")}, {sort: {createdAt: 1}})
    
  is_show_time: (time)->
    showTime = GetTime0(chat_now_time - time)
    if showTime is chat_show_time
      return false
    chat_show_time = showTime
    true
    
  time_diff: (time)->
    now = new Date()
    showTime = GetTime0(now - time)
    showTime

Template.messageDialogInput.events
  'click .submit': ()->
    $('.message-dialog-input-form').submit()
    
  'click .image': ()->
    selectMediaFromAblum(
      1
      (cancel, result)->
        if !cancel and result
          Messages.insert(
            {
              userId: Meteor.userId()
              userName: Meteor.user().profile.fullname || Meteor.user().username
              userIcon: Meteor.user().profile.icon || '/userPicture.png'
              toUserId: toUser._id
              toUserName: toUser.profile.fullname || toUser.username
              toUserIcon: toUser.profile.icon || '/userPicture.png'
              image: result
              isRead: false
              msgType: 'image'
              createTime: new Date()
            }
            (err, _id)->
              if err
                PUB.toast('发送失败，请重试.^_^.')
              else
                e.target.text.value = ''
                document.body.scrollTop = document.body.scrollHeight
          )
    )
    
  'submit .message-dialog-input-form': (e)->
    if e.target.text.value is ''
      PUB.toast('你不想说点什么.^_^.')
      return false
    
    if Meteor.user() is null
      PUB.toast('你还没有登录.^_^.')
      return false
    
    toUser = Meteor.users.findOne(Session.get("ProfileUserId"))
    Messages.insert(
      {
        userId: Meteor.userId()
        userName: Meteor.user().profile.fullname || Meteor.user().username
        userIcon: Meteor.user().profile.icon || '/userPicture.png'
        toUserId: toUser._id
        toUserName: toUser.profile.fullname || toUser.username
        toUserIcon: toUser.profile.icon || '/userPicture.png'
        text: e.target.text.value
        isRead: false
        msgType: 'text'
        createTime: new Date()
      }
      (err, _id)->
        if err
          PUB.toast('发送失败，请重试.^_^.')
        else
          e.target.text.value = ''
          document.body.scrollTop = document.body.scrollHeight
    )
    
    false
    
    
  