if Meteor.isClient
  hasMoreResult = ()->
    if NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
      !(NewDynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
    else
      false
  hasMoreResult1 = ()->
    !(FavouritePosts.find({userId: Session.get("ProfileUserId1")}).count() < Session.get("favouritepostsLimit1"))
  hasMoreResult2 = ()->
    !(FavouritePosts.find({userId: Session.get("ProfileUserId2")}).count() < Session.get("favouritepostsLimit2"))
  hasMoreResult3 = ()->
    !(FavouritePosts.find({userId: Session.get("ProfileUserId3")}).count() < Session.get("favouritepostsLimit3"))     
  updateMeetsCount = (userId)->
    meetInfo = PostFriends.findOne({me:Meteor.userId(),ta:userId})
    if(meetInfo)
      meetCount=meetInfo.count
      if(meetCount and meetCount is 1)
        Meets.update({_id: meetInfo._id}, {$set: {count: 2}})
  getLocation = (userId)->
    userInfo = PostFriends.findOne({ta:userId})
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
    UserProfile = PostFriends.findOne({ta:Session.get(userId)})
    requestee = UserProfile.displayName
    UserProfile._id = UserProfile.ta
    console.log  'addToContactList！！！'
    if Follower.findOne({"userId":UserProfile._id,"followerId":Meteor.userId()})
      insertObj = {
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
      addFollower(insertObj)
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
    #@UserProfilesSwiper = new Swipe(['userProfilePage'])
  Template.userProfile.helpers
    Swiper: -> UserProfilesSwiper
  Template.userProfile.onRendered ->
    # starting page
    Session.set("postPageScrollTop", 0)
    console.log 'Showing userProfile'
    Session.set('favouritepostsLimit1', 10)
    Session.set('favouritepostsLimit2', 10)
    Session.set('favouritepostsLimit3', 10)
    UserProfilesSwiper.setInitialPage 'userProfilePage1'
    if window.userProfileTrackerHandler
      window.userProfileTrackerHandler.stop()
      window.userProfileTrackerHandler = null
    Tracker.autorun (handler)->
      window.userProfileTrackerHandler = handler
      Session.set('favouritepostsLimit1', 10)
      Session.set('favouritepostsLimit2', 10)
      Session.set('favouritepostsLimit3', 10)
      if UserProfilesSwiper.pageIs('userProfilePage1')
        if Session.get("currentPageIndex") isnt 1 and Session.get("currentPageIndex") isnt -1
          updateMeetsCount Session.get("ProfileUserId1")
          userProfileList = Session.get("userProfileList")
          Session.set("momentsitemsLimit", 10)
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
          updateMeetsCount Session.get("ProfileUserId2")
          userProfileList = Session.get("userProfileList")
          Session.set("momentsitemsLimit", 10)
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
          updateMeetsCount Session.get("ProfileUserId3")
          userProfileList = Session.get("userProfileList")
          Session.set("momentsitemsLimit", 10)
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
    $('.page').addClass('scrollable')
    if PostFriends.find({ta: Session.get("ProfileUserId1")}).count() is 0
      Meteor.subscribe "postOwnerInfo",Session.get("ProfileUserId1")
  Template.userProfilePage1.helpers
    isFollowedTheAuthor: ()->
      Follower.find({followerId: Session.get("ProfileUserId1"), userId: Meteor.userId()}).count()>0
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    isMyself:()->
      Session.get("ProfileUserId1") is Meteor.userId()
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Cookies.check("display-lang")
        if Cookies.get("display-lang") is 'en'
          addstr = 'Add'
        else
          addstr = '添加'
      else
        addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId1"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            addstr = 'Invitation has been sent'
          else
            addstr = '已发送邀请'
        else
          addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      if Session.get("ProfileUserId1") is Meteor.userId()
        Meteor.user()
      else
        if PostFriends.findOne {ta: Session.get("ProfileUserId1")}
          PostFriends.findOne {ta: Session.get("ProfileUserId1")}
        else
          Meteor.users.findOne {_id: Session.get("ProfileUserId1")}
    location:->
      getLocation(Session.get("ProfileUserId1"))
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId1")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId1")},{sort: {createdAt: -1}, limit:3})
    favouriteList: ()->
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId1"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId1")}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
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
    'click #followAuthor': (e)->
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      else
        username = Meteor.user().username
      profile = Template.userProfilePage1.__helpers.get('profile')()
      followerName = ''
      if profile and profile.profile and profile.profile.fullname
        followerName = profile.profile.fullname
      else if profile
        followerName = profile.username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: Session.get("ProfileUserId1")
        #这里存放fullname
        followerName: followerName
        followerIcon: profile.profile.icon
        followerDesc: profile.profile.desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click #unFollowAuthor': (e)->
      followId = Follower.findOne({followerId: Session.get("ProfileUserId1"), userId: Meteor.userId()})._id
      Follower.remove {
        _id: followId
      }
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
    # 'click #suggestCurrentPost': ()->
    #   suggestCurrentPost("ProfileUserId1")
    # 'click #sendChatMessage': ()->
    #   Session.set("messageDialog_to", {id: Session.get("ProfileUserId1"), type: 'user'})
    #   Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
        
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId1")
  Template.userProfilePage2.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfilePage2.helpers
    isFollowedTheAuthor: ()->
      Follower.find({followerId: Session.get("ProfileUserId2"), userId: Meteor.userId()}).count()>0
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Cookies.check("display-lang")
        if Cookies.get("display-lang") is 'en'
          addstr = 'Add'
        else
          addstr = '添加'
      else
        addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId2"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            addstr = 'Invitation has been sent'
          else
            addstr = '已发送邀请'
        else
          addstr = '已发送邀请'

      addstr
    withChat:->
      withChat
    profile:->
      if Session.get("ProfileUserId2") is Meteor.userId()
        Meteor.user()
      else
        PostFriends.findOne {ta: Session.get("ProfileUserId2")}
    location:->
      getLocation(Session.get("ProfileUserId2"))
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId2")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId2")},{sort: {createdAt: -1}, limit:3})
    favouriteList: ()->
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId2"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId2")}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
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
    'click #followAuthor': (e)->
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      else
        username = Meteor.user().username
      profile = Template.userProfilePage2.__helpers.get('profile')()
      followerName = ''
      if profile and profile.profile and profile.profile.fullname
        followerName = profile.profile.fullname
      else if profile
        followerName = profile.username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: Session.get("ProfileUserId2")
        #这里存放fullname
        followerName: followerName
        followerIcon: profile.profile.icon
        followerDesc: profile.profile.desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click #unFollowAuthor': (e)->
      followId = Follower.findOne({followerId: Session.get("ProfileUserId2"), userId: Meteor.userId()})._id
      Follower.remove {
        _id: followId
      }
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
    # 'click #suggestCurrentPost': ()->
    #   suggestCurrentPost("ProfileUserId2")
    # 'click #sendChatMessage': ()->
    #   Session.set("messageDialog_to", {id: Session.get("ProfileUserId2"), type: 'user'})
    #   Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId2")

  Template.userProfilePage3.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
  Template.userProfilePage3.helpers
    isFollowedTheAuthor: ()->
      Follower.find({followerId: Session.get("ProfileUserId3"), userId: Meteor.userId()}).count()>0
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Cookies.check("display-lang")
        if Cookies.get("display-lang") is 'en'
          addstr = 'Add'
        else
          addstr = '添加'
      else
        addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId3"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            addstr = 'Invitation has been sent'
          else
            addstr = '已发送邀请'
        else
          addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      if Session.get("ProfileUserId3") is Meteor.userId()
        Meteor.user()
      else
        PostFriends.findOne {ta: Session.get("ProfileUserId3")}
    location:->
      getLocation(Session.get("ProfileUserId3"))
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId3")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId3")},{sort: {createdAt: -1}, limit:3})
    favouriteList: ()->
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId3"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId3")}).forEach((item) ->
          if !~postIds.indexOf(item.postId)
            postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
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
    'click #followAuthor': (e)->
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      else
        username = Meteor.user().username
      profile = Template.userProfilePage3.__helpers.get('profile')()
      followerName = ''
      if profile and profile.profile and profile.profile.fullname
        followerName = profile.profile.fullname
      else if profile
        followerName = profile.username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: Session.get("ProfileUserId3")
        #这里存放fullname
        followerName: followerName
        followerIcon: profile.profile.icon
        followerDesc: profile.profile.desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click #unFollowAuthor': (e)->
      followId = Follower.findOne({followerId: Session.get("ProfileUserId3"), userId: Meteor.userId()})._id
      Follower.remove {
        _id: followId
      }
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
    # 'click #suggestCurrentPost': ()->
    #   suggestCurrentPost("ProfileUserId3")
    # 'click #sendChatMessage': ()->
    #   Session.set("messageDialog_to", {id: Session.get("ProfileUserId3"), type: 'user'})
    #   Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId3")


  Template.userProfilePage.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
    $('.page').addClass('scrollable')
  Template.userProfilePage.helpers
    isFollowedTheAuthor: ()->
      Follower.find({followerId: Session.get("ProfileUserId"), userId: Meteor.userId()}).count()>0
    showPostSuggestionToUser: ()->
      withPostSuggestionToUser
    isMale:(sex)->
      sex is 'male'
    isFemale:(sex)->
      sex is 'female'
    AddFriend:->
      Meteor.subscribe("friendFeeds", Session.get("ProfileUserId1"),Meteor.userId())
      addstr = '添加'
      if Cookies.check("display-lang")
        if Cookies.get("display-lang") is 'en'
          addstr = 'Add'
        else
          addstr = '添加'
      else
        addstr = '添加'
      if Feeds.find({requesteeId:Session.get("ProfileUserId3"),requesterId:Meteor.userId()}).count()>0
        addstr = '已发送邀请'
        if Cookies.check("display-lang")
          if Cookies.get("display-lang") is 'en'
            addstr = 'Invitation has been sent'
          else
            addstr = '已发送邀请'
        else
          addstr = '已发送邀请'
      addstr
    withChat:->
      withChat
    profile:->
      if Session.get("ProfileUserId") is Meteor.userId()
        Meteor.user()
      else
        UserDetail.findOne {_id: Session.get("ProfileUserId")}
    location:->
      getLocation(Session.get("ProfileUserId"))
    isFollowed:()->
      fcount = Follower.find({"followerId":Session.get("ProfileUserId")}).count()
      if fcount > 0
        true
      else
        false
    viewLists:()->
      ViewLists.find({userId:Session.get("ProfileUserId")},{sort: {createdAt: -1}, limit:3})
    favouriteList: ()->
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId1"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId1")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
    compareViewsCount:(value)->
      if (ViewLists.find({userId:Session.get("ProfileUserId")}, {sort: {createdAt: -1}, limit:3}).count() > value)
        true
      else
        false
    isSuggested:()->
      Meteor.subscribe("userFeeds", Session.get("ProfileUserId"),Session.get("postContent")._id)
      if Feeds.find({followby: Session.get("ProfileUserId"),postId: Session.get("postContent")._id,recommanderId:Meteor.userId()}).count()>0
        true
      else
        false
  Template.userProfilePage.events
    'click #followAuthor': (e)->
      if Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      else
        username = Meteor.user().username
      profile = Template.userProfilePage.__helpers.get('profile')()
      followerName = ''
      if profile and profile.profile and profile.profile.fullname
        followerName = profile.profile.fullname
      else if profile
        followerName = profile.username
      insertObj = {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: Session.get("ProfileUserId")
        #这里存放fullname
        followerName: followerName
        followerIcon: profile.profile.icon
        followerDesc: profile.profile.desc
        createAt: new Date()
      }
      addFollower(insertObj)
    'click #unFollowAuthor': (e)->
      followId = Follower.findOne({followerId: Session.get("ProfileUserId"), userId: Meteor.userId()})._id
      Follower.remove {
        _id: followId
      }
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
        # $('.popUpBox, .b-modal').hide()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
  Template.favoritePosts.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'contactsList'
        MOMENTS_ITEMS_INCREMENT = 10;
        #console.log("moments window scroll event: "+event);
        if window.innerHeight
          winHeight = window.innerHeight
        else
          winHeight = $(window).height() # iphone fix
        closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
        #console.log('Close to bottom: '+closeToBottom)
        if (closeToBottom and hasMoreResult())
          if window.momentsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
            console.log('Triggered data source refresh');
            window.momentsCollection_getmore = 'inprogress'
            Session.set("momentsitemsLimit",Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
  Template.favoritePosts.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        !Session.equals('momentsCollection_getmore','done')) and
        Session.equals("SocialOnButton",'contactsList')
    onPostId:()->
      Session.get("postContent")._id
    favoritePosts:()->
      #NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      console.log(postIds)
      Posts.find({_id: {$in: postIds}})
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')

  Template.favoritePosts1.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'contactsList' and UserProfilesSwiper.getPage() is 'userProfilePage1'
        MOMENTS_ITEMS_INCREMENT = 10;
        console.log("moments window scroll event: "+event);
        if window.innerHeight
          winHeight = window.innerHeight
        else
          winHeight = $(window).height() # iphone fix
        closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
        #console.log('Close to bottom: '+closeToBottom)
        if (closeToBottom and hasMoreResult1())
          #if window.momentsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
          if window.favouritepostsCollection1_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
            console.log('Triggered data source refresh');
            window.favouritepostsCollection1_getmore = 'inprogress'
            Session.set("favouritepostsLimit1",Session.get("favouritepostsLimit1") + MOMENTS_ITEMS_INCREMENT);
  Template.favoritePosts1.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        #!Session.equals('momentsCollection_getmore','done')) and
        !Session.equals('favouritepostsCollection1_getmore','done')) and
        Session.equals("SocialOnButton",'contactsList')
    onPostId:()->
      Session.get("postContent")._id
    favoritePosts1:()->
      #NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId1")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      console.log(postIds)
      #Posts.find({_id: {$in: postIds}})
      posts = Posts.find({_id: {$in: postIds}}).fetch()
      posts.sort((p1, p2)->
        return -(FavouritePosts.findOne({postId: p1._id, userId: Session.get("ProfileUserId1")}).createdAt - FavouritePosts.findOne({postId: p2._id, userId: Session.get("ProfileUserId1")}).createdAt)
      )
      posts         
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')
  Template.favoritePosts2.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'contactsList' and UserProfilesSwiper.getPage() is 'userProfilePage2'
        MOMENTS_ITEMS_INCREMENT = 10;
        #console.log("moments window scroll event: "+event);
        if window.innerHeight
          winHeight = window.innerHeight
        else
          winHeight = $(window).height() # iphone fix
        closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
        #console.log('Close to bottom: '+closeToBottom)
        if (closeToBottom and hasMoreResult2())
          if window.favouritepostsCollection2_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
            console.log('Triggered data source refresh');
            window.favouritepostsCollection2_getmore = 'inprogress'
            Session.set("favouritepostsLimit2",Session.get("favouritepostsLimit2") + MOMENTS_ITEMS_INCREMENT);
  Template.favoritePosts2.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        #!Session.equals('momentsCollection_getmore','done')) and
        !Session.equals('favouritepostsCollection2_getmore','done')) and
        Session.equals("SocialOnButton",'contactsList')
    onPostId:()->
      Session.get("postContent")._id
    favoritePosts2:()->
      #NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId2")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      console.log(postIds)
      #Posts.find({_id: {$in: postIds}})
      posts = Posts.find({_id: {$in: postIds}}).fetch()
      posts.sort((p1, p2)->
        return -(FavouritePosts.findOne({postId: p1._id, userId: Session.get("ProfileUserId2")}).createdAt - FavouritePosts.findOne({postId: p2._id, userId: Session.get("ProfileUserId2")}).createdAt)
      )
      posts
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')
  Template.favoritePosts3.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'contactsList' and UserProfilesSwiper.getPage() is 'userProfilePage3'
        MOMENTS_ITEMS_INCREMENT = 10;
        #console.log("moments window scroll event: "+event);
        if window.innerHeight
          winHeight = window.innerHeight
        else
          winHeight = $(window).height() # iphone fix
        closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
        #console.log('Close to bottom: '+closeToBottom)
        if (closeToBottom and hasMoreResult3())
          if window.favouritepostsCollection3_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
            console.log('Triggered data source refresh');
            window.favouritepostsCollection3_getmore = 'inprogress'
            #Session.set("momentsitemsLimit",Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
            Session.set("favouritepostsLimit3",Session.get("favouritepostsLimit3") + MOMENTS_ITEMS_INCREMENT);
  Template.favoritePosts3.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        #!Session.equals('momentsCollection_getmore','done')) and
        !Session.equals('favouritepostsCollection3_getmore','done')) and
        Session.equals("SocialOnButton",'contactsList')
    onPostId:()->
      Session.get("postContent")._id
    favoritePosts3:()->
      #NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId3")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      console.log(postIds)
      #Posts.find({_id: {$in: postIds}})
      posts = Posts.find({_id: {$in: postIds}}).fetch()
      posts.sort((p1, p2)->
        return -(FavouritePosts.findOne({postId: p1._id, userId: Session.get("ProfileUserId3")}).createdAt - FavouritePosts.findOne({postId: p2._id, userId: Session.get("ProfileUserId3")}).createdAt)
      )
      posts
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')
