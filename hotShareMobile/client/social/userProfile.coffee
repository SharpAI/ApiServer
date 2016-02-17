if Meteor.isClient
  updateMeetsCount = (userId)->
    meetInfo = PostFriends.findOne({me:Meteor.userId(),ta:userId})
    if(meetInfo)
      meetCount=meetInfo.count
      if(meetCount and meetCount is 1)
        Meets.update({_id: meetInfo._id}, {$set: {count: 2}})
  getLocation = (userId)->
    userInfo = UserDetail.findOne {_id:userId}
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
    #@UserProfilesSwiper = new Swipe(['userProfilePage1', 'userProfilePage2', 'userProfilePage3'])
    @UserProfilesSwiper = new Swipe(['userProfilePage'])
  Template.userProfile.helpers
    Swiper: -> UserProfilesSwiper
  Template.userProfile.rendered = ->
    # starting page
    Session.set("postPageScrollTop", 0)
    console.log 'Showing userProfile'
    UserProfilesSwiper.setInitialPage 'userProfilePage'
    if window.userProfileTrackerHandler
      window.userProfileTrackerHandler.stop()
      window.userProfileTrackerHandler = null
    Tracker.autorun (handler)->
      window.userProfileTrackerHandler = handler
      if UserProfilesSwiper.pageIs('userProfilePage1')
        if Session.get("currentPageIndex") isnt 1 and Session.get("currentPageIndex") isnt -1
          updateMeetsCount Session.get("ProfileUserId1")
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
          updateMeetsCount Session.get("ProfileUserId2")
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
          updateMeetsCount Session.get("ProfileUserId3")
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
    $('.page').addClass('scrollable')
  Template.userProfilePage1.helpers
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
      UserDetail.findOne {_id: Session.get("ProfileUserId1")}
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
        Router.go '/posts/'+postId
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
      UserDetail.findOne {_id: Session.get("ProfileUserId2")}
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
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId1"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId1")}).forEach((item) ->
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
        Router.go '/posts/'+postId
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
      UserDetail.findOne {_id: Session.get("ProfileUserId3")}
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
      Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId1"), 3)
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId1")}).forEach((item) ->
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
        Router.go '/posts/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId3")


  Template.userProfilePage.rendered=->
    $('.userProfile').css('min-height', $(window).height() - 40)
    $('.viewPostImages ul li').css('height',$(window).width()*0.168)
    $('.page').addClass('scrollable')
  Template.userProfilePage.helpers
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
    'click .userProfile .back':()->
      if window.userProfileTrackerHandler
        window.userProfileTrackerHandler.stop()
        window.userProfileTrackerHandler = null
      Session.set("Social.LevelOne.Menu",'contactsList')
      if PopUpBox
        PopUpBox.close()
    'click #suggestCurrentPost': ()->
      suggestCurrentPost("ProfileUserId")
    'click #sendChatMessage': ()->
      Session.set("messageDialog_to", {id: Session.get("ProfileUserId"), type: 'user'})
      Session.set("Social.LevelOne.Menu", 'messageDialog')
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $(window).children().off()
      $(window).unbind('scroll')
      if PopUpBox
        PopUpBox.close()
      Meteor.setTimeout ()->
        Session.set("Social.LevelOne.Menu",'contactsList')
        Router.go '/posts/'+postId
      ,300
    'click #addToContactList': ()->
      addToContactList("ProfileUserId")
  Template.favoritePosts.rendered=->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'discover'
        MOMENTS_ITEMS_INCREMENT = 10;
        #console.log("moments window scroll event: "+event);
        if withNewLayoutMoment
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
        else
          target = $("#showMoreMomentsResults");
          console.log "target.length: " + target.length
          if (!target.length)
            return;
          threshold = $(window).scrollTop() + $(window).height() - target.height();
          console.log "threshold: " + threshold
          console.log "target.top: " + target.offset().top
          if target.offset().top < threshold
            if window.momentsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
              if (!target.data("visible"))
                target.data("visible", true);
                window.momentsCollection_getmore = 'inprogress'
                Session.set("momentsitemsLimit",Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
          else
            if (target.data("visible"))
              target.data("visible", false);
  Template.favoritePosts.helpers
    isLoading:()->
      (Session.equals('newLayoutImageDownloading',true) or
        !Session.equals('momentsCollection_getmore','done')) and
        Session.equals("SocialOnButton",'discover')
    onPostId:()->
      Session.get("postContent")._id
    newLayoutMoment:()->
      withNewLayoutMoment
    withSuggestAlreadyRead:()->
      withSuggestAlreadyRead
    showSuggestPosts:()->
      if Session.get("showSuggestPosts") is true
        allmoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count()
        mymoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id,userId:Meteor.userId()},{sort: {createdAt: -1}}).count()
        if allmoments-mymoments > 0
          false
        else
          true
      else
        false
    favoritePosts:()->
      #NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      postIds = []
      FavouritePosts.find({userId: Session.get("ProfileUserId")}).forEach((item) ->
        if !~postIds.indexOf(item.postId)
          postIds.push(item.postId)
      )
      Posts.find({_id: {$in: postIds}})
    suggestPosts:()->
      SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
    hidePost:()->
      Session.get('hideSuggestPost_'+this.readPostId) or this.userId is Meteor.userId()
    hideSuggestPost:()->
      console.log this._id
      Session.get('hideSuggestPost_'+this._id) or this.owner is Meteor.userId()
    time_diff: (created)->
      GetTime0(new Date() - created)
    moreResults:()->
      hasMoreResult()
    loading:()->
      Session.equals('momentsCollection','loading')
    loadError:()->
      Session.equals('momentsCollection','error')
