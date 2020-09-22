_selectedFollower = []
_dep = new Tracker.Dependency

Template.messageGroup.events
  'click .create': ()->
    Session.set("messageGroupCreateType", 'add')
    Session.set("Social.LevelOne.Menu", 'messageGroupCreate')
  'click .group': (e)->
    Session.set("messageDialog_to", {id: e.currentTarget.id, type: 'group'})
    Session.set("Social.LevelOne.Menu", 'messageDialog')
  'click .left-btn': ()->
    Session.set("Social.LevelOne.Menu", 'contactsList')
Template.messageGroup.helpers
  groups: ()->
    MsgGroup.find({"users.userId": Meteor.userId()})
    
Template.messageGroupCreate.rendered=->
  _selectedFollower = []
  if Session.get('messageGroupCreateType') is 'edit'
    _selectedFollower = Session.get('messageGroupCreateName_follower') || []
    #console.log(_selectedFollower)
  
  _dep.changed()
Template.messageGroupCreate.helpers
  follower:()->
    if Session.get('messageGroupCreateType') is 'edit'
      group = MsgGroup.findOne(Session.get("messageGroupCreateGroupId"))
      follwer = []
      
      for item in group.users
        if item.userId isnt Meteor.userId()
          follwer.push({followerId: item.userId, followerName: item.userName, followerIcon: item.userIcon})
      for item in Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}}).fetch()
        exist = false
        for foll in follwer
          if foll.followerId is item.followerId
            exist = true
            break
        
        if !exist
          follwer.push(item)
        
      follwer
    else
      Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}})
  isManager:(id)->
    if Session.get('messageGroupCreateType') is 'edit'
      if MsgGroup.findOne(Session.get("messageGroupCreateGroupId")).create.userId is Meteor.userId()
        true
      else
        for item in Session.get('messageGroupCreateName_follower')
          if item is id
            return false
        
        true
    else
      true
  isSelected: (id)->
    _dep.depend()
    for item in _selectedFollower
      if item is id
        return true
      
    false
  exist:()->
    _dep.depend()
    _selectedFollower.length > 0
Template.messageGroupCreate.events
  'click .left-btn': ()->
    if Session.get('messageGroupCreateType') is 'edit'
      Session.set("Social.LevelOne.Menu", 'messageDialogInfo')
    else
      Session.set("Social.LevelOne.Menu", 'contactsList')
  'click .right-btn': (e)->
    if Session.get('messageGroupCreateType') is 'edit'
      if _selectedFollower.length > 0
        group = MsgGroup.findOne(Session.get("messageGroupCreateGroupId"))
        users = []      
        removeName = ''
        addName = ''
        
        for item in group.users
          users.push(item)
        
        # 移除的人
        for i in [0..group.users.length-1]
          exist = false
          for selected in _selectedFollower
            if group.users[i].userId is selected
              exist = true
              break
              
          if !exist and group.users[i].isManager isnt true
            if removeName.length > 0
              removeName += ','
              
            removeName += group.users[i].userName
            
            if users.length > 0
              for ii in [0..users.length-1]
                if users[ii].userId is group.users[i].userId
                  users.splice(ii, 1)
                  break
        
        # 邀请的人
        for selected in _selectedFollower
          exist = false
          for user in users
            if user.userId is selected
              exist = true
              break
              
          if !exist
            follower = Follower.findOne({"userId":Meteor.userId(), followerId: selected})
            users.push({userId: selected, userName: follower.followerName, userIcon: follower.followerIcon, isManager: false})
            
            if addName.length > 0
              addName += ','
            addName += follower.followerName
            
        if removeName isnt '' or addName isnt ''
          MsgGroup.update(
            {_id: group._id}
            {
              $set:{
                users: users
              }
            }
            (err, number)->
              if err or number <= 0
                PUB.toast('出错了，请重试.^_^.')
              else
                if removeName isnt ''
                  Messages.insert(
                    {
                      userId: Meteor.userId()
                      userName: Meteor.user().profile.fullname || Meteor.user().username
                      userIcon: Meteor.user().profile.icon || '/userPicture.png'
                      toGroupId: group._id
                      text: "#{Meteor.user().profile.fullname || Meteor.user().username}从群中移除了#{removeName}"
                      isRead: false
                      msgType: 'text'
                      sesType: 'chatNotify'
                      createTime: new Date()
                    }
                  )
          
                if addName isnt ''
                  Messages.insert(
                    {
                      userId: Meteor.userId()
                      userName: Meteor.user().profile.fullname || Meteor.user().username
                      userIcon: Meteor.user().profile.icon || '/userPicture.png'
                      toGroupId: group._id
                      text: "#{Meteor.user().profile.fullname || Meteor.user().username}邀请#{addName}加入了监控组"
                      isRead: false
                      msgType: 'text'
                      sesType: 'chatNotify'
                      createTime: new Date()
                    }
                  )
                
                Session.set("Social.LevelOne.Menu", 'messageDialog')
          )
        else
          Session.set("Social.LevelOne.Menu", 'messageDialog')
              
    else if _selectedFollower.length > 0
      Session.set("messageGroupCreateName_follower", _selectedFollower)
      Session.set("Social.LevelOne.Menu", 'messageGroupCreateName')
  'click .eachViewer': (e)->
    id = e.currentTarget.id
    index = -1
    exist = false
    
    if _selectedFollower.length > 0
      for i in [0.._selectedFollower.length-1]
        if _selectedFollower[i] is id
          index = i
          exist = true
          break
          
    if !exist
      _selectedFollower.push(id)
    else
      if Template.messageGroupCreate.__helpers.get('isManager')(id)
        _selectedFollower.splice(index, 1)
      
    _dep.changed()
    
Template.messageGroupCreateName.rendered=->
  $('.showPostsBox').css('display', 'none')
  $('.chatFooter').css('display', 'none')
  $('#postFooter').css('display', 'none')
  $('.chatBoxContent').css('min-height', '0px')
  $('.showBgColor').css('min-height','0px')
  $('body').css('background-color' ,'#fff')
  $('.text').focus()
Template.messageGroupCreateName.destroyed=->
  $('.showPostsBox').css('display', 'block')
  $('.chatFooter').css('display', 'block')
  $('.chatBoxContent').css('min-height',$(window).height()-90)
  $('.showBgColor').css('min-height',$(window).height())
  $('body').css('background-color' ,'#000')
Template.messageGroupCreateName.helpers
  name:()->
    if Session.get('messageGroupCreateType') is 'edit'
      MsgGroup.findOne(Session.get("messageGroupCreateGroupId")).name
    else
      ''
Template.messageGroupCreateName.events
  'click .left-btn': ()->
    if Session.get('messageGroupCreateType') is 'edit'
      Session.set("Social.LevelOne.Menu", 'messageDialogInfo')
    else
      Session.set("Social.LevelOne.Menu", 'contactsList')
  'click .right-btn': ()->
    $('.message-group-create-name-form').submit()
  'submit .message-group-create-name-form': (e)->
    if e.target.text.value is ''
      PUB.toast('给群取个名称吧.^_^.')
      return false
    
    if Session.get('messageGroupCreateType') is 'edit'
      group = MsgGroup.findOne(Session.get("messageGroupCreateGroupId"))
      MsgGroup.update(
        {_id: group._id}
        {
          $set: {
            name: e.target.text.value
          }
        }
        (err, number)->
          if err or number <= 0
            PUB.toast('出错了，请重试.^_^.')
          else
            Messages.insert(
              {
                userId: Meteor.userId()
                userName: Meteor.user().profile.fullname || Meteor.user().username
                userIcon: Meteor.user().profile.icon || '/userPicture.png'
                toGroupId: group._id
                text: "#{Meteor.user().profile.fullname || Meteor.user().username}修改了群#{group.name}的名称为#{e.target.text.value}"
                isRead: false
                msgType: 'text'
                sesType: 'chatNotify'
                createTime: new Date()
              }
            )
            Session.set("Social.LevelOne.Menu", 'messageDialog')
      )
      return false
      
    users = []
    users.push(
      {
        userId: Meteor.userId()
        userName: Meteor.user().profile.fullname || Meteor.user().username
        userIcon: Meteor.user().profile.icon || '/userPicture.png'
        isManager: true
      }
    )
    
    userNames = ''
    for item in Session.get('messageGroupCreateName_follower')
      follower = Follower.findOne({"userId":Meteor.userId(), followerId: item})
      users.push({userId: item, userName: follower.followerName, userIcon: follower.followerIcon, isManager: false})
      if userNames.length > 0
        userNames += ","
      userNames += follower.followerName
    
    MsgGroup.insert(
      {
        name: e.target.text.value
        users: users
        create: {
          userId: Meteor.userId()
          userName: Meteor.user().profile.fullname || Meteor.user().username
          userIcon: Meteor.user().profile.icon || '/userPicture.png'
          createTime: new Date()
        }
      }
      (err, _id)->
        if err
          PUB.toast('创建失败，请重试.^_^.')
        else
          Messages.insert(
            {
              userId: Meteor.userId()
              userName: Meteor.user().profile.fullname || Meteor.user().username
              userIcon: Meteor.user().profile.icon || '/userPicture.png'
              toGroupId: _id
              text: "#{Meteor.user().profile.fullname || Meteor.user().username}邀请#{userNames}加入了监控组"
              isRead: false
              msgType: 'text'
              sesType: 'chatNotify'
              createTime: new Date()
            }
          )
          Session.set("Social.LevelOne.Menu", 'chatContent')
    )
    
    false
    