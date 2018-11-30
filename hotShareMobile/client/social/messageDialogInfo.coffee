Template.messageDialogGroupInfo.rendered=->
  $('.messageDialogInfo').css('min-height',$(window).height()-90)
  document.body.scrollTop = document.body.scrollHeight
  
Template.messageDialogGroupInfo.helpers
  group:()->
    to = Session.get("messageDialog_to") || {}
    
    switch to.type
      when "group"
        return MsgGroup.findOne(to.id)
      when "session"
        session = MsgSession.findOne(to.id)
        if session.sesType is 'chatNotify' or session.sesType is 'groupChat'
          return MsgGroup.findOne(session.toGroupId)
        
    PUB.toast('当前聊天会话不是监控组！')
    Session.set("Social.LevelOne.Menu", 'contactsList')
    
  is_manager:(group)->
    group.create.userId is Meteor.userId()
    
  count:(group)->
    group.users.length
  isManager:()->
    group = Template.messageDialogGroupInfo.__helpers.get('group')()
    group.create.userId is Meteor.userId()
    
Template.messageDialogGroupInfo.events
  'click .btn-danger': ()->
    isManager = Template.messageDialogGroupInfo.__helpers.get('isManager')()
    PUB.confirm(
      "您确定要#{if isManager then '解散群' else '退出群'}吗？"
      ()->
        if isManager
          MsgGroup.remove(
            {_id: Template.messageDialogGroupInfo.__helpers.get('group')()._id}
            (err)->
              if err
                PUB.toast('失败，请重试！')
              else
                Session.set("Social.LevelOne.Menu", 'chatContent')
          )
        else
          group = Template.messageDialogGroupInfo.__helpers.get('group')()
          user = {}
          
          for item in group.users
            if item.userId is Meteor.userId()
              user = item
              break
          
          MsgGroup.update(
            {_id: group._id}
            {
              $pull: {
                users: user
              }
            }
            (err, number)->
              if err or number <= 0
                PUB.toast('失败，请重试！')
              else
                Messages.insert(
                  {
                    userId: group.create.userId
                    userName: group.create.userName
                    userIcon: group.create.userIcon
                    toGroupId: group._id
                    text: "#{Meteor.user().profile.fullname || Meteor.user().username}退出了群"
                    isRead: false
                    msgType: 'text'
                    sesType: 'chatNotify'
                    createTime: new Date()
                  }
                )
                MsgSession.remove({toGroupId: group._id, userId: Meteor.userId()})
                Session.set("Social.LevelOne.Menu", 'chatContent')
          )
    )
  'click .left-btn': ()->
    Session.set("Social.LevelOne.Menu", 'messageDialog')
  'click .j-bao': ()->
    PUB.toast('举报成功！')
  'click .set-name': ()->
    to = Session.get("messageDialog_to") || {}
    users = []
    
    switch to.type
      when "group"
        for item in MsgGroup.findOne(to.id).users
          users.push(item.userId)
        break
      when "session"
        session = MsgSession.findOne(to.id)
        if session.sesType is 'chatNotify' or session.sesType is 'groupChat'
          to.id = session.toGroupId
          for item in MsgGroup.findOne(session.toGroupId).users
            users.push(item.userId)
        break
        
    if users isnt []
      Session.set("messageGroupCreateName_follower", users)
      Session.set("messageGroupCreateGroupId", to.id)
      Session.set("messageGroupCreateType", 'edit')
      Session.set("Social.LevelOne.Menu", 'messageGroupCreateName')
  'click .add': ()->
    to = Session.get("messageDialog_to") || {}
    users = []
    
    switch to.type
      when "group"
        for item in MsgGroup.findOne(to.id).users
          users.push(item.userId)
        break
      when "session"
        session = MsgSession.findOne(to.id)
        if session.sesType is 'chatNotify' or session.sesType is 'groupChat'
          to.id = session.toGroupId
          for item in MsgGroup.findOne(session.toGroupId).users
            users.push(item.userId)
        break
        
    if users isnt []
      Session.set("messageGroupCreateName_follower", users)
      Session.set("messageGroupCreateGroupId", to.id)
      Session.set("messageGroupCreateType", 'edit')
      Session.set("Social.LevelOne.Menu", 'messageGroupCreate')