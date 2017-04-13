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
  Template.groupInformation.events
    'click #groupsProfilePageback':(event)->
      groupid = Session.get('groupsId')
      url = '/simple-chat/to/group?id='+groupid
      Router.go(url)
    'click .name': (event)->
      Session.set("groupsProfileMenu","setGroupname")
    'click .barcode': (event)->
      Session.set("groupsProfileMenu","groupBarCode")
    'click .deleteAndExit':(event)->
      PUB.confirm('删除并退出后，将不再接收此群聊消息',()->
        Meteor.call('remove-group-user',Session.get('groupsId'),Meteor.userId(),(err,id)->
          console.log(err)
          if err or !id
            return PUB.toast('删除失败，请重试~')
          if mqtt_connection 
            mqtt_connection.unsubscribe("/msg/g/" + id)
          MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: blackerId})
          if MsgSessionId
            SimpleChat.MsgSession.remove(MsgSessionId._id)
          PUB.back()
        )
        )

  Template.groupUsers.helpers
    groupUsers:()->
      limit = withShowGroupsUserMaxCount || 29;
      return SimpleChat.GroupUsers.find({group_id:Session.get('groupsId')},{sort: {createdAt: 1},limit:limit})
    moreResults:()->
      limit = withShowGroupsUserMaxCount || 29;
      return Counts.get('groupsUserCountBy-'+Session.get('groupsId')) > limit
    isMobile:()->
      Meteor.isCordova

  Template.groupUsers.events
    'click #addUserInGroup':(event)->
      Session.set("groupsProfileMenu","inviteFriendIntoGroup")
    'click #showAllResults':(event)->
      Session.set("groupsProfileMenu","groupAllUser")
    'click .userItem': (event)->
      #Session.set("groupsProfileMenu","setGroupname")
   
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
        Meteor.call('updateGroupName',Session.get('groupsId'),e.target.text.value)

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
