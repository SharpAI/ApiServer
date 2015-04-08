Template.messageDialogGroupInfo.rendered=->
  $('.messageDialogInfo').css('min-height',$(window).height()-90)
  
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
        
    PUB.toast('当前聊天会话不是群聊！')
    Session.set("Social.LevelOne.Menu", 'contactsList')
    
  is_manager:(group)->
    group.create.userId is Meteor.userId()
    
  count:(group)->
    group.users.length
    
Template.messageDialogGroupInfo.events
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