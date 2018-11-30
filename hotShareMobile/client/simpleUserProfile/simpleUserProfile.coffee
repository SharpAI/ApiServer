if Meteor.isClient
  getLocation = (userId)->
    userInfo = Meteor.users.findOne({_id:userId})
    console.log('Get location for user '+ userId + JSON.stringify(userInfo))
    if userInfo and userInfo.profile
      if userInfo.profile.location and userInfo.profile.location isnt ''
        return userInfo.profile.location
      else if userInfo.profile.lastLogonIP and userInfo.profile.lastLogonIP isnt ''
        unless Session.get('userLocation_'+userId)
          console.log 'Get Address from ' + userInfo.profile.lastLogonIP
          Session.set('userLocation_'+userId,'加载中...')
          url = "http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip="+userInfo.profile.lastLogonIP
          $.getScript url, (data, textStatus, jqxhr)->
            console.log 'status is ' + textStatus
            address = ''
            if textStatus is 'success' and remote_ip_info and remote_ip_info.ret is 1
              console.log 'Remote IP Info is ' + JSON.stringify(remote_ip_info)
              if remote_ip_info.country and remote_ip_info.country isnt '' and remote_ip_info.country isnt '中国'
                address += remote_ip_info.country
                address += ' '
              if remote_ip_info.province and remote_ip_info.province isnt ''
                address += remote_ip_info.province
                address += ' '
              if remote_ip_info.city and remote_ip_info.city isnt '' and remote_ip_info.city isnt remote_ip_info.province
                address += remote_ip_info.city
              console.log 'Address is ' + address
              if address isnt ''
                Session.set('userLocation_'+userId,address)
            else
              Session.set('userLocation_'+userId,'未知')
      else
        Session.set('userLocation_'+userId,'未知')
      return Session.get('userLocation_'+userId)
  Template.simpleUserProfile.rendered=->
    $('.simpleUserProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
    # offSettop = $('.userProfileBottom').offset().top
    # $('.userProfileBottom').css('height',$(window).height()-40-offSettop)
    $('.page').addClass('scrollable')
    groupid = Session.get('groupsId')
    Meteor.subscribe("get-group",groupid)
    Meteor.subscribe('loginuser-in-group',groupid,Session.get("simpleUserProfileUserId"));
    Meteor.subscribe('usersById',Session.get("simpleUserProfileUserId"))
    $(document).scrollTop(0)
  Template.simpleUserProfile.helpers
    isFromChat:()->
      return Router.current().params.query && Router.current().params.query.from is 'chat'
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    profile:->
      Meteor.users.findOne {_id: Session.get("simpleUserProfileUserId")}
    location:->
      getLocation(Session.get("simpleUserProfileUserId"))
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("simpleUserProfileUserId")}).count()
      if fcount > 0
        true
      else
        false
    compareViewsCount:(value)->
      if (ViewLists.find({userId:Session.get("simpleUserProfileUserId")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("simpleUserProfileUserId")},{sort: {createdAt: -1}, limit:3})
    inBlackList:()->
      if BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [Session.get("simpleUserProfileUserId")]}}).count() > 0
        return true
      else
        return false
    isGroupCreator:()->
      # 具有以下特殊权限
      # 1.监控组名称修改
      # 2.解散监控组
      # 3.群管理员管理权限
      #group = SimpleChat.Groups.findOne({_id: Session.get('groupsId')})
      #if group and group.creator and group.creator.id is Meteor.userId()
      #  return true
      #return false
      return true
    userIsGroupAdmin:()->
      groupUser = SimpleChat.GroupUsers.findOne({group_id:Session.get('groupsId'), user_id: Session.get("simpleUserProfileUserId")})
      if groupUser and groupUser.isGroupAdmin
        return true
      return false

  Template.simpleUserProfile.events
    'click #setAsGroupAdmin':()->
      user_id = Session.get("simpleUserProfileUserId")
      group_id = Session.get('groupsId')
      Meteor.call('modifyGroupUserAdmin', group_id, user_id, true)
    'click #unSetGroupAdmin':()->
      user_id = Session.get("simpleUserProfileUserId")
      group_id = Session.get('groupsId')
      Meteor.call('modifyGroupUserAdmin', group_id, user_id, false)
    'click #removeFormGroup':()->
      user_id = Session.get("simpleUserProfileUserId")
      group_id = Session.get('groupsId')
      Meteor.call('removeGroupUser', group_id, user_id)
      return PUB.back()
    'click .simpleUserProfile .back':()->
      historyArr = Session.get("history_view")
      if (historyArr and historyArr.length > 0)
        PUB.back()
      else
        history.go(-1)
    'click #removeFormBlacklist':()->
      blackId = Session.get("simpleUserProfileUserId")
      BlackList.update({_id: blackId}, {$pull: {blacker: id}})
      blacker = Meteor.users.findOne({_id: id})
      blackerName = if blacker.profile.fullname then blacker.profile.fullname else blacker.username
      Follower.insert {
        userId: Meteor.userId()
        userName: Meteor.user().profile.fullname || Meteor.user().username
        userIcon: Meteor.user().profile.icon || '/userPicture.png'
        userDesc: Meteor.user().profile.desc

        followerId: blacker._id
        followerName: blackerName
        followerIcon: blacker.profile.icon || '/userPicture.png'
        followerDesc: blacker.profile.desc

        createAt: new Date()
      }
    'click #addToBlacklist':()->
      blackerId = Session.get("simpleUserProfileUserId")
      FollowerId = Follower.findOne({userId: Meteor.userId(),followerId: blackerId})
      MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: blackerId})
      if BlackList.find({blackBy: Meteor.userId(), blacker:{$in: [blackerId]}}).count() is 0
        if BlackList.find({blackBy: Meteor.userId()}).count() is 0
          #Meteor.call('addBlackList', blackerId, Meteor.userId())
          BlackList.insert({blacker: [blackerId],blackBy: Meteor.userId()})
          if FollowerId
            Follower.remove(FollowerId._id)
          if MsgSessionId
            SimpleChat.MsgSession.remove(MsgSessionId._id)
          Session.set('fromeaddblacllist', true)
          Router.go '/my_blacklist'
        else
          id = BlackList.findOne({blackBy: Meteor.userId()})._id
          BlackList.update({_id: id}, {$addToSet: {blacker: blackerId}})
          if FollowerId
            Follower.remove(FollowerId._id)
          if MsgSessionId
            SimpleChat.MsgSession.remove(MsgSessionId._id)
          Session.set('fromeaddblacllist', true)
          Router.go '/my_blacklist'
      else
        id = BlackList.findOne({blackBy: Meteor.userId(), blacker:{$in: [blackerId]}})._id
        BlackList.update({_id: id}, {$pull: {blacker: blackerId}})
    'click #deleteUser':()->
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: Session.get('simpleUserProfileUserId')
                 })._id
      Follower.remove(FollowerId)
      MsgSessionId = SimpleChat.MsgSession.findOne({userId: Meteor.userId(),toUserId: Session.get('simpleUserProfileUserId')})
      if MsgSessionId
        SimpleChat.MsgSession.remove(MsgSessionId._id)
    'click .addToAddressbook':()->
      follow =  Meteor.users.findOne({_id:Session.get('simpleUserProfileUserId')})
      if follow.profile.fullname
        followerName = follow.profile.fullname
      else
        followerName = follow.username
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: follow._id
        #这里存放fullname
        followerName: followerName
        followerIcon: follow.profile.icon
        followerDesc: follow.profile.desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click .sendMesssage':()->
      page = '/simple-chat/to/user?id='+Session.get('simpleUserProfileUserId')
      Router.go page
    
    'click .postImages ul li':(e)->
      PUB.openPost e.currentTarget.id
      ###
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      currentPostId = Session.get("postContent")._id
      postBack = Session.get("postBack")
      postBack.push(currentPostId)
      Session.set("postForward",[])
      Session.set("postBack",postBack)
      if PopUpBox
        PopUpBox.close()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
      ###
