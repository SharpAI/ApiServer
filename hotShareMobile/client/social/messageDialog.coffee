chat_now_time = undefined
chat_show_time = undefined

Template.messageDialog.created=->
  chat_now_time = new Date()
  chat_show_time = undefined

Template.messageDialog.rendered=->
  this.$('.message').css('min-height',$(window).height()-90)
  to = Session.get("messageDialog_to") || {}
  
  if to.type is 'user'
    Meteor.subscribe("userinfo", to.id)
  
  Meteor.subscribe(
    "messages"
    to
    onStop: ()->
    onReady: ()->
      document.body.scrollTop = document.body.scrollHeight
  )
  
Template.messageDialog.helpers
  isMe: (obj)->
    obj.userId is Meteor.userId() and obj.sesType isnt 'chatNotify'
    
  isImage: (obj)->
    obj.msgType is 'image'
    
  isText: (obj)->
    obj.msgType is 'text'
    
  messages: ()->
    to = Session.get("messageDialog_to") || {}
    if to.type is 'session'
      Meteor.call('readMessage', to.id)
      
    filter = {}
    switch to.type
      when "user"
        filter = {
          $or: [
            # 我发给ta的
            {userId: Meteor.userId(), toUserId: to.id}
            # ta发给我的
            {userId: to.id, toUserId: Meteor.userId()}
          ]
        }
      when "group"
        group = MsgGroup.findOne(to.id)
        filter = {
          $or: [
            # 我发的群消息
            {userId: Meteor.userId(), toGroupId: group._id}
            # 给我的群消息
            {'toUsers.userId': Meteor.userId(), toGroupId: group._id}
          ]
        }
      when "session"
        session = MsgSession.findOne(to.id)
        if session.sesType is 'singleChat'
          filter = {
            $or: [
              # 我发给ta的
              {userId: Meteor.userId(), toUserId: session.toUserId}
              # ta发给我的
              {userId: session.toUserId, toUserId: Meteor.userId()}
            ]
          }
        else
          filter = {
            $or: [
              # 我发的群消息
              {userId: Meteor.userId(), toGroupId: session.toGroupId}
              # 给我的群消息
              {'toUsers.userId': Meteor.userId(), toGroupId: session.toGroupId}
            ]
          }
      else
        return []

    Messages.find(filter, {sort: {createTime: 1}})
    
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
    
  is_chatNotify: (sesType)->
    sesType is 'chatNotify'
  is_groupChat: (sesType)->
    sesType is 'groupChat'
    
Template.messageDialog.events
  'click .left-btn': ()->
    Session.set("Social.LevelOne.Menu", 'chatContent')

Template.messageDialogInput.events
  'click .submit': ()->
    $('.message-dialog-input-form').submit()
    
  'click .image': ()->
    selectMediaFromAblum(
      1
      (cancel, result)->
        if !cancel and result
          to = Session.get("messageDialog_to") || {}
          insert = {}

          switch to.type
            when "user"
              toUser = Meteor.users.findOne(to.id)
              insert = {
                userId: Meteor.userId()
                userName: Meteor.user().profile.fullname || Meteor.user().username
                userIcon: Meteor.user().profile.icon || '/userPicture.png'
                toUserId: toUser._id
                toUserName: toUser.profile.fullname || toUser.username
                toUserIcon: toUser.profile.icon || '/userPicture.png'
                image: result
                isRead: false
                msgType: 'image'
                sesType: 'singleChat'
                createTime: new Date()
              }
            when "group"
              insert = {
                userId: Meteor.userId()
                userName: Meteor.user().profile.fullname || Meteor.user().username
                userIcon: Meteor.user().profile.icon || '/userPicture.png'
                toGroupId: to.id
                image: result
                isRead: false
                msgType: 'image'
                sesType: 'groupChat'
                createTime: new Date()
              }
            when "session"
              session = MsgSession.findOne(to.id)
              if session.sesType is 'singleChat'
                insert = {
                  userId: Meteor.userId()
                  userName: Meteor.user().profile.fullname || Meteor.user().username
                  userIcon: Meteor.user().profile.icon || '/userPicture.png'
                  toUserId: session.toUserId
                  toUserName: session.toUserName
                  toUserIcon: session.toUserIcon
                  image: result
                  isRead: false
                  msgType: 'image'
                  sesType: 'singleChat'
                  createTime: new Date()
                }
              else
                insert = {
                  userId: Meteor.userId()
                  userName: Meteor.user().profile.fullname || Meteor.user().username
                  userIcon: Meteor.user().profile.icon || '/userPicture.png'
                  toGroupId: session.toGroupId
                  image: result
                  isRead: false
                  msgType: 'image'
                  sesType: 'groupChat'
                  createTime: new Date()
                }
          Messages.insert(
            insert
            (err, _id)->
              if err
                PUB.toast('发送失败，请重试.^_^.')
              else
                e.target.text.value = ''
                document.body.scrollTop = document.body.scrollHeight
                if to.type is 'session'
                  Meteor.call('readMessage', to.id)
          )
    )
    
  'submit .message-dialog-input-form': (e)->
    if e.target.text.value is ''
      PUB.toast('你不想说点什么.^_^.')
      return false
    
    if Meteor.user() is null
      PUB.toast('你还没有登录.^_^.')
      return false
    
    to = Session.get("messageDialog_to") || {}
    insert = {}
    
    switch to.type
      when "user"
        toUser = Meteor.users.findOne(to.id)
        insert = {
          userId: Meteor.userId()
          userName: Meteor.user().profile.fullname || Meteor.user().username
          userIcon: Meteor.user().profile.icon || '/userPicture.png'
          toUserId: toUser._id
          toUserName: toUser.profile.fullname || toUser.username
          toUserIcon: toUser.profile.icon || '/userPicture.png'
          text: e.target.text.value
          isRead: false
          msgType: 'text'
          sesType: 'singleChat'
          createTime: new Date()
        }
      when "group"
        insert = {
          userId: Meteor.userId()
          userName: Meteor.user().profile.fullname || Meteor.user().username
          userIcon: Meteor.user().profile.icon || '/userPicture.png'
          toGroupId: to.id
          text: e.target.text.value
          isRead: false
          msgType: 'text'
          sesType: 'groupChat'
          createTime: new Date()
        }
      when "session"
        session = MsgSession.findOne(to.id)
        if session.sesType is 'singleChat'
          insert = {
            userId: Meteor.userId()
            userName: Meteor.user().profile.fullname || Meteor.user().username
            userIcon: Meteor.user().profile.icon || '/userPicture.png'
            toUserId: session.toUserId
            toUserName: session.toUserName
            toUserIcon: session.toUserIcon
            text: e.target.text.value
            isRead: false
            msgType: 'text'
            sesType: 'singleChat'
            createTime: new Date()
          }
        else
          insert = {
            userId: Meteor.userId()
            userName: Meteor.user().profile.fullname || Meteor.user().username
            userIcon: Meteor.user().profile.icon || '/userPicture.png'
            toGroupId: session.toGroupId
            text: e.target.text.value
            isRead: false
            msgType: 'text'
            sesType: 'groupChat'
            createTime: new Date()
          }
    
    Messages.insert(
      insert
      (err, _id)->
        if err
          PUB.toast('发送失败，请重试.^_^.')
        else
          e.target.text.value = ''
          document.body.scrollTop = document.body.scrollHeight
          if to.type is 'session'
            Meteor.call('readMessage', to.id)
    )
    
    false
  