if Meteor.isClient
  initGroupInOutTimeSet = ()->
    group_intime = '09:00'
    group_outtime = '18:00'
    group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})

    if (group and group.group_intime)
      group_intime = group.group_intime

    if (group && group.group_outtime)
      group_outtime = group.group_outtime

    group_intime = group_intime.split(":")
    group_outtime = group_outtime.split(":")

    $('#groupInOutTime').mobiscroll().range({
      defaultVaule: [new Date(),new Date()],
      theme: 'material',
      lang: 'zh',
      display: 'bottom',
      controls: ['time'],
      maxWidth: 100,
      setText: '设置',
      fromText: '上班时间',
      toText:'下班时间',
      defaultValue: [
          new Date(new Date().setHours(group_intime[0], group_intime[1], 0, 0)),new Date(new Date().setHours(group_outtime[0], group_outtime[1], 0, 0))
      ],
      onSet: (value, inst)->
        val = value.valueText;
        vals = val.split(' - ');
        group_intime = vals[0];
        group_outtime = vals[1];

        inArr = group_intime.split(":")
        outArr = group_outtime.split(":")
        inMin = Number(inArr[0]) * 60 + Number(inArr[1])
        outMin = Number(outArr[0]) * 60 + Number(outArr[1])
        if(outMin <= inMin)
          return PUB.toast('下班时间早于上班时间，请重试')
        Meteor.call('updateGroupInOutTime',Session.get('groupsId'),group_intime, group_outtime)
    })
  initGroupIndex = (user_id)->
      size = 0
      groupList = SimpleChat.GroupUsers.find({user_id: user_id}, { sort: { index: 1 }}).fetch();
      console.log(groupList);
      if groupList
        for group in groupList
          SimpleChat.GroupUsers.update(group._id, { $set: { index: size } });
          size = size + 1
  groupDelOrQuitCB = (err,id,isDel)->
    errMsg = '退出失败，请重试~'
    if isDel
      errMsg = '删除失败，请重试~'
    console.log(err)
    if err or !id
      #return PUB.toast(errMsg)
      PUB.toast(errMsg)
      return PUB.page '/'
    if mqtt.host
      mqtt.unsubscribe("/msg/g/" + id)
    MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: id})
    console.log MsgSessionId
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
  Session.setDefault("groupsProfileMenu",'groupInformation')
  Template.groupsProfile.helpers
    whichOne:()->
      Session.get("groupsProfileMenu")
  Template.groupInformation.rendered=->
    $('.content').css 'min-height',$(window).height()
    groupid = Session.get('groupsId')
    Meteor.subscribe("get-group",groupid, {
      onReady:()->
        initGroupInOutTimeSet()
      onError:()->
        initGroupInOutTimeSet
    })
    Meteor.subscribe('group-user-counter',groupid)
    Meteor.subscribe('loginuser-in-group',groupid, Meteor.userId())
  UI.registerHelper('checkedIf',(val)->
    return if val then 'checked' else ''
  )
  Template.groupInformation.helpers
    userTypeIsAdmin:()->
      user = Meteor.user()
      if user and user.profile and user.profile.userType is 'admin'
        return true
      return false
    getGroupInOutTime: ()->
      group_intime = '09:00'
      group_outtime = '18:00'
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.group_intime
        group_intime = group.group_intime
      if group and group.group_outtime
        group_outtime = group.group_outtime
      return group_intime+' - '+group_outtime
    groupAccuracyType: ()->
      group =  SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'),user_id:Meteor.userId()})
      if group and group.groupAccuracyType
        groupAccuracyType = group.groupAccuracyType
      if groupAccuracyType is 'accurate'
        return '精确匹配'
      else
        return '宽松匹配'
    rejectUnknowMember: ()->
      groupUser = SimpleChat.GroupUsers.findOne({group_id: Session.get('groupsId'), user_id: Meteor.userId()})
      if groupUser and  groupUser.allowUnknowMember
        return true
      return false
    reciveGif: ()->
      isShow = false
      result = null
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.settings
        result = group.settings.receive_gif
      if result is true or result is null or result is undefined
        isShow = true
      return isShow
    realTimeEmail:()->
      isShow = false
      result = null
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.settings
        result = group.settings.real_time_email
      if result is true or result is null or result is undefined
        isShow = true
      return isShow
    whats_up_send: ()->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group
        return group.whats_up_send
      return false
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
    isGroupCreator:()->
      # 具有以下特殊权限
      # 1.监控组名称修改
      # 2.解散监控组
      # 3.群管理员管理权限

      group = SimpleChat.Groups.findOne({_id: Session.get('groupsId')})
      if group and group.creator and group.creator.id is Meteor.userId()
        return true
      return false
    isGroupAdmin:()->
      # 具有以下特殊权限
      # 1.清空训练记录
      # 2.报告栏成员管理
      # 3.识别规则设置
      if Template.groupInformation.__helpers.get('isGroupCreator')()
        return true
      groupUser = SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'), user_id: Meteor.userId()})
      if groupUser and groupUser.isGroupAdmin
        return true
      return false

  Template.groupInformation.events
    'click #recognitionCounts': (event)->
      group_id = Session.get('groupsId')
      PUB.page('/recognitionCounts/'+group_id)
    'click #groupDevice': (event)->
      group_id = Session.get('groupsId')
      PUB.page '/groupDevices/'+group_id
    'click #clusteringFix': (event)->
      group_id = Session.get('groupsId')
      PUB.page('/clusteringFix/'+ group_id)
    'click #groupInOutTime':(event)->
       $('#groupInOutTime').mobiscroll('show')
       return false
    'click .groupUserHide':(event)->
      group_id = Session.get('groupsId')
      Session.set 'scrollTop',$('html,body').scrollTop()
      PUB.page('/groupUserHide/'+group_id)
    'click #groupsProfilePageback':(event)->
      return PUB.back()
      groupid = Session.get('groupsId')
      type = Session.get('groupsType')
      url = '/simple-chat/to/'+type+'?id='+groupid
      Router.go(url)
    'click .groupAccuracy': (event)->
      Session.set("groupsProfileMenu","groupAccuracy")
    'click .groupEmail': (event)->
      Session.set("groupsProfileMenu","groupEmail")
    'click .editName': (event)->
      Session.set("groupsProfileMenu","setGroupname")
    'click .barcode': (event)->
      Session.set("groupsProfileMenu","groupBarCode")
    'click .deleteAndExit':(event)->
      if event.currentTarget.id is 'delThisGroup'
        return PUB.confirm('删除后，将不再保留本监控组相关信息',()->
          Meteor.call('creator-delete-group',Session.get('groupsId'), Meteor.userId(),(err,id)->
            groupDelOrQuitCB(err,id,true)
            initGroupIndex(Meteor.userId())
          )
        )     

      PUB.confirm('退出后，将不再接收本监控组消息',()->
        Meteor.call('remove-group-user',Session.get('groupsId'),Meteor.userId(),(err,id)->
          groupDelOrQuitCB(err,id, false)
          initGroupIndex(Meteor.userId())
          # console.log(err)
          # if err or !id
          #   return PUB.toast('删除失败，请重试~')
          # if mqtt_connection
          #   mqtt_connection.unsubscribe("/msg/g/" + id)
          # MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: id})
          # if MsgSessionId
          #   SimpleChat.MsgSession.remove(MsgSessionId._id)
          # try
          #   where = {'to.id': id, to_type: 'group'};
          #   SimpleChat.Messages.remove(where);
          #   Meteor.setTimeout(()->
          #     if SimpleChat.MessagesHis.find(where).count() > 0
          #       SimpleChat.MessagesHis.remove(where);
          #   ,100)
          #   SimpleChat.MessagesHis.remove(where);
          # catch e
          #   console.log 'remove-group-user err:'+e
          # Meteor.setTimeout(()->
          #   PUB.back()
          # ,100)
        )
        
        return PUB.page '/'
      )
    'click .groupPhoto':(event)->
      Template.groupPhoto.open(Session.get('groupsId'));
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
      #cordova.InAppBrowser.open(perf_url, '_system')
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
    'click #switchRejectUnknowMember':(event)->
      Meteor.call('updateGroupUserallowUnknowMember',Session.get('groupsId'), Meteor.userId())
    'change #switchReciveGif':(event)->
      isReceive = false
      if $('#switchReciveGif').is(":checked") is true
        isReceive = true
      group_id = Session.get('groupsId')
      Meteor.call('update_group_settings', group_id, {'settings.receive_gif':isReceive});
      return
    'change #switchRealTimeEmail':(event)->
      isRealTime = false
      if $('#switchRealTimeEmail').is(":checked") is true
        isRealTime = true
      group_id = Session.get('groupsId')
      Meteor.call('update_group_settings', group_id, {'settings.real_time_email':isRealTime});
      return
    'click #switch_whats_up_send':(event)->
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if (group && group.whats_up_send)
        Meteor.call('uGroupWhatsUp', Session.get('groupsId'), false)
      else
        Meteor.call('uGroupWhatsUp', Session.get('groupsId'), true)

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
    userIsGroupCreator:()->
      group = SimpleChat.Groups.findOne({_id: Session.get('groupsId')})
      if group and group.creator and group.creator.id is this.user_id
        return true
      return false

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
    placeholderText:()->
      if Session.equals('fromCreateNewGroups',true)
         return '输入监控组名称'
      return '输入新的监控组名称'
    groupName:()->
      if Session.equals('fromCreateNewGroups',true)
         return Session.get('AI_Group_Name') || ''
      group =  SimpleChat.Groups.findOne({_id:Session.get('groupsId')})
      if group and group.name
        return group.name
      else
        return ''
  Template.setGroupname.events
    'click .left-btn':(event)->
      if Session.equals('fromCreateNewGroups',true)
        Session.set('fromCreateNewGroups',false);
        Router.go('/');
      Session.set("groupsProfileMenu","groupInformation")
    'click .right-btn':(e)->
      $('.setGroupname-form').submit()
    'submit .setGroupname-form': (e)->
      e.preventDefault();
      if e.target.text.value isnt ''
        console.log 'Change Groups Name to ' +e.target.text.value
        if Session.equals('fromCreateNewGroups',true)
          Session.set('fromCreateNewGroups',false);
          #Session.set('AI_Group_Name',e.target.text.value);
          create_group_fun(e.target.text.value);
          #Router.go('/selectTemplate');
          return
        Meteor.call('updateGroupName',Session.get('groupsId'),e.target.text.value,(error)->
            SimpleChat.MsgSession.update({toUserId:Session.get('groupsId')},{$set:{toUserName:e.target.text.value}})
          )

        Session.set("groupsProfileMenu","groupInformation")
      else
        PUB.toast '监控组名称不能为空~'
      false

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
  Template.groupAccuracy.helpers
    isAccurateAccuray: ()->
      group =  SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'),user_id:Meteor.userId()})
      if group and group.groupAccuracyType
        groupAccuracyType = group.groupAccuracyType
      return groupAccuracyType is 'accurate'
  Template.groupAccuracy.events
    'click .left-btn':(event)->
      if Session.equals('fromCreateNewGroups',true)
        Session.set('fromCreateNewGroups',false);
        Router.go('/');
      Session.set("groupsProfileMenu","groupInformation")
     'click .selectAccuracy':(event)->
       groupAccuracyType =event.currentTarget.id;
       Meteor.call('updateGroupAccuracyType',Session.get('groupsId'),groupAccuracyType)
       if Session.equals('fromCreateNewGroups',true)
         Session.set('fromCreateNewGroups',false);
         Router.go('/');
      Session.set("groupsProfileMenu","groupInformation")
  Template.groupEmail.helpers
    reportEmails: ()->
      emails = []
      groupId = Session.get 'groupsId'

      groupUser = SimpleChat.GroupUsers.findOne({group_id: groupId,user_id:Meteor.userId()})
      if groupUser.report_emails
        report_emails = groupUser.report_emails
        rmails = report_emails.split(',')
        for emailAddr in rmails
          emails.push({ reportEmailAddr: emailAddr })
      emails
  Template.groupEmail.events
    'click .left-btn':(event)->
      if Session.equals('fromCreateNewGroups',true)
        Session.set('fromCreateNewGroups',false);
        Router.go('/');
      Session.set("groupsProfileMenu","groupInformation")
    'click .adE':(event)->
      ss = $(".inpEmail").val()
      ret = ss.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      if not ret
        PUB.toast '无效邮箱地址!'
        return
      groupId = Session.get 'groupsId'
      user_id = Meteor.userId()
      groupUser = SimpleChat.GroupUsers.findOne({group_id: groupId,user_id:user_id})
      if groupUser.report_emails
        arr = groupUser.report_emails.split(',')
        if _.contains(arr,ss)
          PUB.toast '此邮箱已添加'
          return
        report_emails = groupUser.report_emails + ',' + ss
      else
        report_emails = ss

      Meteor.call('updateGroupUserReportEmails', groupId, user_id,report_emails)

      $(".inpEmail").val("")
    'click .deleEmaile':(event)->
      groupId = Session.get 'groupsId'
      newEmails = ''
      isFirst = true
      user_id = Meteor.userId()
      groupUser = SimpleChat.GroupUsers.findOne({group_id: groupId,user_id:user_id})
      if groupUser.report_emails
        aMails = groupUser.report_emails.split(',')
        for em in aMails
          if em isnt this.reportEmailAddr
            if isFirst
              isFirst = false
              newEmails = newEmails + em
            else
              newEmails = newEmails + ',' + em
      Meteor.call('updateGroupUserReportEmails', groupId, user_id,newEmails)
