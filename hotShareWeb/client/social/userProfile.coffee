if Meteor.isClient

  suggestCurrentPost = (userId)->
    username = Meteor.user().username
    if Meteor.user().profile.fullname
      username = Meteor.user().profile.fullname
    Feeds.insert {
      owner:Session.get("postContent").owner
      ownerName:Session.get("postContent").ownerName
      ownerIcon:Session.get("postContent").ownerIcon
      eventType:'recommand'
      postId:Session.get("postContent")._id
      postTitle:Session.get("postContent").title
      mainImage:Session.get("postContent").mainImage
      createdAt:new Date()
      heart:Session.get("postContent").heart
      retweet:Session.get("postContent").retweet
      comment:Session.get("postContent").comment
      followby: Session.get(userId)
      recommander:username
      recommanderIcon:Meteor.user().profile.icon
      recommanderId:Meteor.userId()
    }
  addToContactList = (userId)->
    username = Meteor.user().username
    if Meteor.user().profile.fullname
      username = Meteor.user().profile.fullname
    UserProfile = UserDetail.findOne {_id: Session.get(userId)}
    requestee = UserProfile.username
    if UserProfile.profile.fullname
      requestee = UserProfile.profile.fullname
    if Follower.findOne({"userId":UserProfile._id,"followerId":Meteor.userId()})
      Follower.insert {
        userId: Meteor.userId()
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: ''
        followerId: UserProfile._id
        followerName: requestee
        followerIcon: UserProfile.profile.icon
        followerDesc: ''
        createAt: new Date()
      }
      return
    if Feeds.findOne({"requesteeId":Meteor.userId(),"requesterId":UserProfile._id})
      Follower.insert {
        userId: Meteor.userId()
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: ''
        followerId: UserProfile._id
        followerName: requestee
        followerIcon: UserProfile.profile.icon
        followerDesc: ''
        createAt: new Date()
      }
      Follower.insert {
        userId: UserProfile._id
        userName: requestee
        userIcon: UserProfile.profile.icon
        userDesc: ''
        followerId: Meteor.userId()
        followerName: username
        followerIcon: Meteor.user().profile.icon
        followerDesc: ''
        createAt: new Date()
      }
      return
    Feeds.insert {
      eventType:'sendrequest'
      createdAt:new Date()
      followby:Meteor.userId()
      requestee:requestee
      requesteeIcon:UserProfile.profile.icon
      requesteeId:UserProfile._id
      requester:username
      requesterIcon:Meteor.user().profile.icon
      requesterId:Meteor.userId()
    }
    Feeds.insert {
      eventType:'getrequest'
      createdAt:new Date()
      followby:UserProfile._id
      requestee:requestee
      requesteeIcon:UserProfile.profile.icon
      requesteeId:UserProfile._id
      requester:username
      requesterIcon:Meteor.user().profile.icon
      requesterId:Meteor.userId()
    }
  # Initialize the Swiper
  Meteor.startup ()->
    @UserProfilesSwiper = new Swipe(['userProfilePage1', 'userProfilePage2', 'userProfilePage3'])
  Template.userProfile.helpers
    Swiper: -> UserProfilesSwiper
  Template.userProfile.rendered = ->
    # starting page
    console.log 'Showing userProfile'
    UserProfilesSwiper.setInitialPage 'userProfilePage1'
    if window.userProfileTrackerHandler
      window.userProfileTrackerHandler.stop()
      window.userProfileTrackerHandler = null
    Tracker.autorun (handler)->
      window.userProfileTrackerHandler = handler
      if UserProfilesSwiper.pageIs('userProfilePage1')
        if Session.get("currentPageIndex") isnt 1 and Session.get("currentPageIndex") isnt -1
          userProfileList = Session.get("userProfileList")
          if Session.get("currentPageIndex") is 2
            currentProfileIndex = Session.get("currentProfileIndex")-1
            if currentProfileIndex < 0
               currentProfileIndex = userProfileList.length-1
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex-1
            if nextProfileIndex <  0
               nextProfileIndex = userProfileList.length-1
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId3", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId3", userProfileList[nextProfileIndex].followerId)
          if Session.get("currentPageIndex") is 3
            currentProfileIndex = Session.get("currentProfileIndex")+1
            if currentProfileIndex >  userProfileList.length-1
               currentProfileIndex = 0
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex+1
            if nextProfileIndex >  userProfileList.length-1
               nextProfileIndex = 0
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId2", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId2", userProfileList[nextProfileIndex].followerId)
          Session.set("currentPageIndex", 1)
        if Session.get("currentPageIndex") is -1
          UserProfilesSwiper.leftRight(null, null)
        else
          UserProfilesSwiper.leftRight('userProfilePage3', 'userProfilePage2')

      if UserProfilesSwiper.pageIs('userProfilePage2')
        if Session.get("currentPageIndex") isnt 2
          userProfileList = Session.get("userProfileList")
          if Session.get("currentPageIndex") is 1
            currentProfileIndex = Session.get("currentProfileIndex")+1
            if currentProfileIndex >  userProfileList.length-1
               currentProfileIndex = 0
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex+1
            if nextProfileIndex >  userProfileList.length-1
               nextProfileIndex = 0
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId3", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId3", userProfileList[nextProfileIndex].followerId)
          if Session.get("currentPageIndex") is 3
            currentProfileIndex = Session.get("currentProfileIndex")-1
            if currentProfileIndex < 0
               currentProfileIndex = userProfileList.length-1
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex-1
            if nextProfileIndex <  0
               nextProfileIndex = userProfileList.length-1
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId1", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId1", userProfileList[nextProfileIndex].followerId)
          Session.set("currentPageIndex", 2)
        UserProfilesSwiper.leftRight('userProfilePage1', 'userProfilePage3')

      if UserProfilesSwiper.pageIs('userProfilePage3')
        if Session.get("currentPageIndex") isnt 3
          userProfileList = Session.get("userProfileList")
          if Session.get("currentPageIndex") is 1
            currentProfileIndex = Session.get("currentProfileIndex")-1
            if currentProfileIndex < 0
               currentProfileIndex = userProfileList.length-1
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex-1
            if nextProfileIndex <  0
               nextProfileIndex = userProfileList.length-1
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId2", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId2", userProfileList[nextProfileIndex].followerId)
          if Session.get("currentPageIndex") is 2
            currentProfileIndex = Session.get("currentProfileIndex")+1
            if currentProfileIndex >  userProfileList.length-1
               currentProfileIndex = 0
            Session.set("currentProfileIndex", currentProfileIndex)
            nextProfileIndex = currentProfileIndex+1
            if nextProfileIndex >  userProfileList.length-1
               nextProfileIndex = 0
            if Session.get("userProfileType") is "newfriends"
              Session.set("ProfileUserId1", userProfileList[nextProfileIndex].ta)
            else
              Session.set("ProfileUserId1", userProfileList[nextProfileIndex].followerId)
          Session.set("currentPageIndex", 3)
        UserProfilesSwiper.leftRight('userProfilePage2', 'userProfilePage1')

  Template.userProfilePage1.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfilePage1.helpers
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId1"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      UserDetail.findOne {_id: Session.get("ProfileUserId1")}
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId1")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId1")},{sort: {createdAt: -1}, limit:3})
    compareViewsCount:(value)->
      if (ViewLists.find({userId:Session.get("ProfileUserId1")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    isSuggested:()->
      Meteor.subscribe("userFeeds", Session.get("ProfileUserId1"),Session.get("postContent")._id)
      if Feeds.find({followby: Session.get("ProfileUserId1"),postId: Session.get("postContent")._id,recommanderId:Meteor.userId()}).count()>0
        true
      else
        false
  Template.userProfilePage1.events
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
    'click #suggestCurrentPost': ()->
      suggestCurrentPost("ProfileUserId1")
    'click #sendChatMessage': ()->
      Session.set("messageDialog_to", {id: Session.get("ProfileUserId1"), type: 'user'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/redirect/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId1")
  Template.userProfilePage2.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfilePage2.helpers
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId2"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      UserDetail.findOne {_id: Session.get("ProfileUserId2")}
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId2")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId2")},{sort: {createdAt: -1}, limit:3})
    compareViewsCount:(value)->
      if (ViewLists.find({userId:Session.get("ProfileUserId2")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    isSuggested:()->
      Meteor.subscribe("userFeeds", Session.get("ProfileUserId2"),Session.get("postContent")._id)
      if Feeds.find({followby: Session.get("ProfileUserId2"),postId: Session.get("postContent")._id,recommanderId:Meteor.userId()}).count()>0
        true
      else
        false
  Template.userProfilePage2.events
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
    'click #suggestCurrentPost': ()->
      suggestCurrentPost("ProfileUserId2")
    'click #sendChatMessage': ()->
      Session.set("messageDialog_to", {id: Session.get("ProfileUserId2"), type: 'user'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/redirect/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId2")

  Template.userProfilePage3.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfilePage3.helpers
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId3"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      UserDetail.findOne {_id: Session.get("ProfileUserId3")}
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId3")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId3")},{sort: {createdAt: -1}, limit:3})
    compareViewsCount:(value)->
      if (ViewLists.find({userId:Session.get("ProfileUserId3")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    isSuggested:()->
      Meteor.subscribe("userFeeds", Session.get("ProfileUserId3"),Session.get("postContent")._id)
      if Feeds.find({followby: Session.get("ProfileUserId3"),postId: Session.get("postContent")._id,recommanderId:Meteor.userId()}).count()>0
        true
      else
        false
  Template.userProfilePage3.events
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
    'click #suggestCurrentPost': ()->
      suggestCurrentPost("ProfileUserId3")
    'click #sendChatMessage': ()->
      Session.set("messageDialog_to", {id: Session.get("ProfileUserId3"), type: 'user'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/redirect/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId3")
