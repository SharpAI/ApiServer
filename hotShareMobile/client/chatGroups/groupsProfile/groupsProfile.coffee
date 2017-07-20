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
  UI.registerHelper('checkedIf',(val)->
    return if val then 'checked' else ''
  )
  Template.groupInformation.helpers
    rejectLabelMsg: ()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      return group.rejectLabelMsg
    userIsAdmin: ()->
      user = Meteor.user()
      isAdmin = user.profile and user.profile.userType and user.profile.userType is 'admin'
      return isAdmin && withSwitchNormalLabelMsg
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
    hasTemplate:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.template and group.template._id
        return true
      else
        return false
    templateName:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      return group.template.name
    templateIcon:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      return group.template.icon
    hasAnnouncement:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if  group and group.announcement and group.announcement.length > 0
        return true
      else
        return false
    groupAnnouncement:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      return group.announcement
    isMobile:()->
      Meteor.isCordova
    show_more:()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      return group.announcement.length > 2
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
          try
            where = {'to.id': id, to_type: 'group'};
            SimpleChat.Messages.remove(where);
            Meteor.setTimeout(()->
              if SimpleChat.MessagesHis.find(where).count() > 0
                SimpleChat.MessagesHis.remove(where);
            ,100)
            SimpleChat.MessagesHis.remove(where);
          catch e
            console.log 'remove-group-user err:'+e
          Meteor.setTimeout(()->
            PUB.back()
          ,100)
        )
      )
    'click .scanPerfBarcode':(event)->
      console.log 'scan performance barcode'
      cordova.plugins.barcodeScanner.scan((result)->
        console.log("We got a barcode\n" + "Result: "
          + result.text + "\n" + "Format: "
          + result.format
          + "\n" + "Cancelled: "
          + result.cancelled);
        if (result.text)
          console.log 'result.txt: ' + result.text
          txtObj = JSON.parse(result.text);
          Meteor.call('set-perf-link',Session.get('groupsId'), txtObj, (err, ret)->
            console.log 'set-perf-link, err: ' + err + ', ret: ' + ret
            if err
              PUB.toast '扫描失败，请重试~'
              return
            PUB.toast '扫描成功！可查看绩效~'
          )
        if (result.cancelled)
          return;
        if (result.alumTapped)
          return;
      , (error)->
        alert("Scanning failed: " + error);
      , {
          preferFrontCamera: false, # iOS and Android
          showFlipCameraButton: true, # iOS and Android
          showTorchButton: true, # iOS and Android
          torchOn: true, # Android, launch with the torch switched on (if available)
          prompt: "Place a barcode inside the scan area", # Android
          resultDisplayDuration: 500, # Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats: "QR_CODE,PDF_417", # default: all but PDF_417 and RSS_EXPANDED
          orientation: "landscape", # Android only (portrait|landscape), default unset so it rotates with the device
          #disableAnimations: true, # iOS
          #disableSuccessBeep: false // iOS
        }
      );
    'click .checkPerf':(event)->
      group_id = Session.get('groupsId')
      group = SimpleChat.Groups.findOne({_id: group_id})

      perf_url = null
      console.log('Got group Info='+JSON.stringify(group))
      if group and group.perf_info and group.perf_info.reportUrl
          perf_url = group.perf_info.reportUrl
          console.log "perf url is not 0: " + perf_url
      # if group is not null and group is not undefined
      #     console.log "group is not 0  "
      #     if group.perf_info is not null and group.perf_info is not undefined
      #         console.log "perf info is not 0 "
      #         if group.perf_info.perf_url is not null and group.perf_info.perf_url is not undefined
      #             perf_url = group.perf_info.perf_url
      #             console.log "perf url is not 0: " + perf_url

      if perf_url is null
          console.log "perf url is null, browser: " + perf_url
          perf_url = 'http://aixd.raidcdn.cn/reporter/f5ZocsFpQn9CApmy8'
      cordova.InAppBrowser.open(perf_url, '_system')
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
        try
          SimpleChat.Messages.remove(where);
          Meteor.setTimeout(()->
            if SimpleChat.MessagesHis.find(where).count() > 0
              SimpleChat.MessagesHis.remove(where);
          ,100)
        catch e
          console.log 'remove-group-user err:'+e

        console.log '训练记录已清空';
        SimpleChat.MsgSession.update({toUserId:to},{$set:{lastText:''}})
        window.plugins.toast.hide();
        # groupid = Session.get('groupsId')
        # type = Session.get('groupsType')
        # url = '/simple-chat/to/'+type+'?id='+groupid
        # Router.go(url)
      )

    'click .copy':(event)->
      value = $(event.currentTarget).prev().text()
      console.log (value)
      cordova.plugins.clipboard.copy(value)
      PUB.toast('复制成功~')
    'click .show_more':(event)->
      $show = $('.show_more');
      if $('.announcementVal').find('._close').length > 0
        $show.html('<i class="fa fa-angle-up"></i>')
        $('.announcementVal').find('.announcement_item').removeClass('_close');
      else
        $show.html('<i class="fa fa-angle-down"></i>');
        $('.announcementVal').find('.announcement_item').addClass('_close');
    'click #switchNormalLabelMsg':(event)->
        $('#switchNormalLabelMsg').attr('disabled')
        group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
        rejectLabelMsg =  group.rejectLabelMsg
        if rejectLabelMsg
          SimpleChat.Groups.update({_id: Session.get('groupsId')},{$set:{rejectLabelMsg: false}},(err,result)->
            $('#switchNormalLabelMsg').removeAttr('disabled')
          )
        else
          SimpleChat.Groups.update({_id: Session.get('groupsId')},{$set:{rejectLabelMsg: true}},(err,result)->
            $('#switchNormalLabelMsg').removeAttr('disabled')
          )

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
