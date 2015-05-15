if Meteor.isClient
  Meteor.startup ()->
    Session.setDefault 'newfriends_data',[]
    Deps.autorun ()->
      console.log('In newfriends ' + Meteor.userId())
      if Session.get("postContent") and  Meteor.userId()
        Meteor.subscribe "newfriends", Meteor.userId(),Session.get("postContent")._id
  onUserProfile = ->
    $('.showBgColor').hide 0
    @UserProfileBox = $('.userProfileBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        $('.showBgColor').show 0,->
          $(window).scrollTop(window.lastScroll)
      onOpen: ->
        Session.set('displayUserProfileBox',true)
  Template.contactsList.helpers
    follower:()->
      Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}})
    isViewer:()->
      Meteor.subscribe("userViewers", Session.get("postContent")._id,this.followerId)
      if Viewers.find({"userId":this.followerId,postId:Session.get("postContent")._id}).count()>0
        true
      else
        false
  Template.contactsList.events
    "click #addNewFriends":()->
      Session.set("Social.LevelOne.Menu",'addNewFriends')
    "click .eachViewer":(e)->
      userProfileList = Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}}).fetch()
      Session.set("userProfileList", userProfileList)
      Session.set("userProfileType", "oldfriends");
      Session.set("currentPageIndex", 1);
      for i in [0..userProfileList.length-1]
        Meteor.subscribe("recentPostsViewByUser", userProfileList[i].followerId)
        Meteor.subscribe "viewlists", Meteor.userId(), userProfileList[i].followerId
        Meteor.subscribe("userinfo", userProfileList[i].followerId)
        if userProfileList[i].followerId is this.followerId
          Session.set("currentProfileIndex", i)
      prevProfileIndex = Session.get("currentProfileIndex")-1
      nextProfileIndex = Session.get("currentProfileIndex")+1
      if prevProfileIndex < 0
         prevProfileIndex = userProfileList.length-1
      if nextProfileIndex > userProfileList.length-1
         nextProfileIndex = 0
      Session.set("ProfileUserId1", this.followerId)
      Session.set("ProfileUserId3", userProfileList[prevProfileIndex].followerId)
      Session.set("ProfileUserId2", userProfileList[nextProfileIndex].followerId)
      #click on current friends list
      onUserProfile()
      #PUB.page('userProfilePage1')
    'click .messageGroup': ()->
      Session.set("Social.LevelOne.Menu", 'messageGroup')      
  Template.addNewFriends.rendered=->
    Session.set('mrLimit', 0)
  Template.addNewFriends.helpers
    meeter:()->
      Newfriends.find({meetOnPostId:Session.get("postContent")._id},{sort:{count:-1}})
    isMyself:()->
      this.ta is Meteor.userId()
    isSelf:(follow)->
      if follow.userId is Meteor.userId()
        true
      else
        false
    isFollowed:()->
      fcount = Follower.find({"followerId":this.ta}).count()
      if fcount > 0
        true
      else
        false
    isViewer:()->
      vcount = Viewers.find({postId:Session.get("postContent")._id, userId:this.ta}).count()
      if vcount > 0
        true
      else
        false
  Template.addNewFriends.events
    "click .eachViewer":(e)->
      userProfileList = Newfriends.find({meetOnPostId:Session.get("postContent")._id},{sort:{count:-1}}).fetch()
      Session.set("userProfileList", userProfileList)
      Session.set("userProfileType", "newfriends")
      Session.set("currentPageIndex", 1)
      for i in [0..userProfileList.length-1]
        Meteor.subscribe("userinfo", userProfileList[i].ta)
        if userProfileList[i].ta is this.ta
          Session.set("currentProfileIndex", i)
      prevProfileIndex = Session.get("currentProfileIndex")-1
      nextProfileIndex = Session.get("currentProfileIndex")+1
      if prevProfileIndex < 0
         prevProfileIndex = userProfileList.length-1
      if nextProfileIndex > userProfileList.length-1
         nextProfileIndex = 0
      Session.set("ProfileUserId1", this.ta)
      Session.set("ProfileUserId3", userProfileList[prevProfileIndex].ta)
      Session.set("ProfileUserId2", userProfileList[nextProfileIndex].ta)
      #click on suggest friends list
      onUserProfile()
      #PUB.page('userProfilePage1')
    "click #addNewFriends":()->
      Session.set("Social.LevelOne.Menu",'addNewFriends')
    'click .delFollow':(e)->
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: this.userId
                 })._id
      Follower.remove(FollowerId)
    'click .addFollow':(e)->
      if Meteor.user().profile.fullname
         username = Meteor.user().profile.fullname
      else
         username = Meteor.user().username
      Follower.insert {
        userId: Meteor.userId()
        #这里存放fullname
        userName: username
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: this.userId
        #这里存放fullname
        followerName: this.username
        followerIcon: this.userIcon
        createAt: new Date()
    }
