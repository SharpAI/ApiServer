_selectedFollower = []
_dep = new Tracker.Dependency

Template.messageGroup.events
  'click .create': ()->
    Session.set("Social.LevelOne.Menu", 'messageGroupCreate')
    
Template.messageGroupCreate.created=->
  _selectedFollower = []
  _dep.changed()
Template.messageGroupCreate.helpers
  follower:()->
    Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}})
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
    Session.set("Social.LevelOne.Menu", 'contactsList')
  'click .right-btn': (e)->
    if _selectedFollower.length > 0
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
      _selectedFollower.splice(index, 1)
      
    _dep.changed()
    
Template.messageGroupCreateName.events
  'click .left-btn': ()->
    Session.set("Social.LevelOne.Menu", 'contactsList')
  'click .right-btn': ()->
    $('.message-group-create-name-form').submit()
  'submit .message-group-create-name-form': (e)->
    if e.target.text.value is ''
      PUB.toast('给群取个名称吧.^_^.')
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
              text: "#{Meteor.user().profile.fullname || Meteor.user().username}邀请#{userNames}加入了群聊"
              isRead: false
              msgType: 'text'
              sesType: 'chatNotify'
              createTime: new Date()
            }
          )
          Session.set("Social.LevelOne.Menu", 'chatContent')
    )
    
    false
    