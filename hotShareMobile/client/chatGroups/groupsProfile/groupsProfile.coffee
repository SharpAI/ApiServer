if Meteor.isClient
  Session.setDefault("groupsProfileMenu",'groupInformation')
  Template.groupsProfile.helpers
    whichOne:()->
      Session.get("groupsProfileMenu")
  Template.groupInformation.rendered=->
    $('.content').css 'min-height',$(window).height()
    groupid = Session.get('groupsId')
    Meteor.subscribe("get-group",groupid)
    Meteor.subscribe('group-user-counter',groupid)
  Template.groupInformation.helpers
    isGroup:()->
      if Session.get('groupsType') is 'group'
        return true
      else
        return false
    groupName:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.name
        return group.name
      else
        return '[无]' 
    hasBarCode:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.barcode
        return true
      else 
        return false

    barcodeUrl:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.barcode
        return group.barcode

    hasAnnouncement:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.announcement
        return true
      else 
        return false
    groupAnnouncement:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.announcement
        return group.announcement
  Template.groupInformation.events
    'click #groupsProfilePageback':(event)->
      groupid = Session.get('groupsId')
      type = Session.get('groupsType')
      url = '/simple-chat/to/'+type+'?id='+groupid
      Router.go(url)
    'click .name': (event)->
      Session.set("groupsProfileMenu","setGroupname")
    'click .barcode': (event)->
      Session.set("groupsProfileMenu","groupBarCode")
    'click .deleteAndExit':(event)->
      PUB.confirm('删除并退出后，将不再接收本AI训练群消息',()->
        Meteor.call('remove-group-user',Session.get('groupsId'),Meteor.userId(),(err,id)->
          console.log(err)
          if err or !id
            return PUB.toast('删除失败，请重试~')
          if mqtt_connection 
            mqtt_connection.unsubscribe("/msg/g/" + id)
          MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: id})
          if MsgSessionId
            SimpleChat.MsgSession.remove(MsgSessionId._id)
          where = {'to.id': id, to_type: 'group'};
          SimpleChat.Messages.remove(where);
          Meteor.setTimeout(()->
            PUB.back()
          ,100)
        )
      )
    'click .emptyMessages':(event)->
      PUB.confirm('确定要清空训练记录吗？',()->
        type = Session.get('groupsType')
        to = Session.get('groupsId')
        if type is 'group'
          where = {'to.id': to, to_type: type};
        else
          where = {
            $or: [
              {'form.id': Meteor.userId(), 'to.id': to, to_type: type}, 
              {'form.id': to, 'to.id': Meteor.userId(), to_type: type}  
            ]
          };
        console.log('where:', where);
        window.plugins.toast.showLongCenter('请稍候~')
        SimpleChat.Messages.remove(where);
        console.log '训练记录已清空';
        SimpleChat.MsgSession.update({toUserId:to},{$set:{lastText:''}})
        window.plugins.toast.hide();
        # groupid = Session.get('groupsId')
        # type = Session.get('groupsType')
        # url = '/simple-chat/to/'+type+'?id='+groupid
        # Router.go(url)
      )

    'click .copy':(event)->
      value = $('.announcementVal').text()
      cordova.plugins.clipboard.copy(value)
      PUB.toast('复制成功~')

  Template.groupUsers.helpers
    isGroup:()->
      if Session.get('groupsType') is 'group'
        return true
      else
        return false
    groupUsers:()->
      limit = withShowGroupsUserMaxCount || 29;
      return SimpleChat.GroupUsers.find({group_id:Session.get('groupsId')},{sort: {createdAt: 1},limit:limit})
    moreResults:()->
      limit = withShowGroupsUserMaxCount || 29;
      return Counts.get('groupsUserCountBy-'+Session.get('groupsId')) > limit
    isMobile:()->
      Meteor.isCordova
    chat_user_id:()->
      Session.get('groupsId')
    chat_user_Icon:()->
      users = Meteor.users.findOne({_id:Session.get('groupsId')})
      if users and users.profile
         return users.profile.icon
      else
         return '/userPicture.png'
    chat_user_Name:()->
      users = Meteor.users.findOne({_id:Session.get('groupsId')})
      if users and users.profile
         return users.profile.fullname || users.username
      else
         return ''

  Template.groupUsers.events
    'click #addUserInGroup':(event)->
      Session.set("groupsProfileMenu","inviteFriendIntoGroup")
    'click #showAllResults':(event)->
      Session.set("groupsProfileMenu","groupAllUser")
    'click .userItem': (event)->
      #Session.set("groupsProfileMenu","setGroupname")
      console.log event.currentTarget.id
      PUB.page('/simpleUserProfile/'+event.currentTarget.id);
   
  Template.setGroupname.helpers
    groupName:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.name
        return group.name
      else
        return ''
  Template.setGroupname.events
    'click .left-btn':(event)->
      Session.set("groupsProfileMenu","groupInformation")
    'click .right-btn':(e)->
      $('.setGroupname-form').submit()
    'submit .setGroupname-form': (e)->
      if e.target.text.value isnt ''
        console.log 'Change Groups Name to ' +e.target.text.value
        Meteor.call('updateGroupName',Session.get('groupsId'),e.target.text.value,(error)->
            SimpleChat.MsgSession.update({toUserId:to},{$set:{toUserName:e.target.text.value}})
          )

        Session.set("groupsProfileMenu","groupInformation")

  Template.groupBarCode.helpers
    groupIcon:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.icon
        return group.icon
      else
        return ''
    groupName:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.name
        return group.name
      else
        return '' 
    barcodeUrl:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.barcode
        return group.barcode
  Template.groupBarCode.events
    'click #groupBarCodePageback':(event)->
      Session.set("groupsProfileMenu","groupInformation")
    'click #savebarcode':(event)->
      group = SimpleChat.Groups.findOne({_id:Session.get('groupsId')});
      cordova.plugins.barcodeScanner.saveBarCodeToPhotoAlum group.barcode, ((result) ->
        console.log 'res:' + result
        PUB.toast '保存成功！'
        return
      ), (error) ->
        console.log 'error:' + error
        PUB.toast '保存失败！'
        return
    'click #scanbarcode':(event)->
      ScanBarcodeByBarcodeScanner()
