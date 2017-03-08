if Meteor.isClient
  Meteor.startup ()->
    Session.setDefault 'newfriends_data',[]
    ###
    Deps.autorun ()->
      console.log('In newfriends ' + Meteor.userId())
      if Session.get("postContent") and  Meteor.userId()
        Meteor.subscribe("userDetail",Meteor.userId())
        Meteor.subscribe "newfriends", Meteor.userId(),Session.get("postContent")._id
        Meteor.subscribe 'followToWithLimit', 9999
    ###
  onUserProfile = ->
    #Router.go '/userProfilePage'
    Session.set("momentsitemsLimit", 10)
    #Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId"), Session.get("momentsitemsLimit"))
    #Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId1"), Session.get("momentsitemsLimit"))
    #Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId2"), Session.get("momentsitemsLimit"))
    #Meteor.subscribe("userfavouriteposts", Session.get("ProfileUserId3"), Session.get("momentsitemsLimit"))
    @PopUpBox = $('.popUpBox').bPopup
      positionStyle: 'fixed'
      position: [0, 0]
      onClose: ->
        Session.set('displayUserProfileBox',false)
      onOpen: ->
        Session.set('displayUserProfileBox',true)
  Template.contactsList.helpers
    follower:()->
      Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}})
    isViewer:()->
      Meteor.subscribe("userViewers", Session.get("postContent")._id,this.followerId)
      if Viewers.find({postId:Session.get("postContent")._id, "userId":this.followerId}).count()>0
        true
      else
        false
  Template.contactsList.events
     'click .contactsList .back' :->
      $(window).children().off()
      $(window).unbind('scroll')
      Meteor.setTimeout ()->
        PUB.postPageBack()
    "click #addNewFriends":()->
      Session.set("Social.LevelOne.Menu",'addNewFriends')
    "click .oldFriends":(e)->
      userProfileList = Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}}).fetch()
      Session.set("userProfileList", userProfileList)
      Session.set("userProfileType", "oldfriends");
      Session.set("currentPageIndex", 1);
      for i in [0..userProfileList.length-1]
        if userProfileList[i].followerId is this.followerId
          Session.set("currentProfileIndex", i)
      prevProfileIndex = Session.get("currentProfileIndex")-1
      nextProfileIndex = Session.get("currentProfileIndex")+1
      if prevProfileIndex < 0
         prevProfileIndex = userProfileList.length-1
      if nextProfileIndex > userProfileList.length-1
         nextProfileIndex = 0
      Session.set("ProfileUserId", this.followerId)
      Session.set("ProfileUserId1", this.followerId)
      Session.set("ProfileUserId3", userProfileList[prevProfileIndex].followerId)
      Session.set("ProfileUserId2", userProfileList[nextProfileIndex].followerId)
      #click on current friends list
      onUserProfile()
      #PUB.page('userProfilePage1')
    'click .messageGroup': ()->
      Session.set("Social.LevelOne.Menu", 'messageGroup')
  Template.addNewFriends.onRendered ()->
    $(window).scroll (event)->
      if Session.get("Social.LevelOne.Menu") is 'contactsList'
        console.log "postfriends window scroll event: "+event
        target = $("#showMorePostFriendsResults");
        POSTFRIENDS_ITEMS_INCREMENT = 10;
        console.log "target.length: " + target.length
        if (!target.length)
          return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();
        console.log "threshold: " + threshold
        console.log "target.top: " + target.offset().top
        if $('#newFriendRedSpotReal').is(":hidden") and parseInt($('#newFriendRedSpotReal').html()) > 0
          $('#newFriendRedSpotReal').show()
          $('#newFriendRedSpot').hide()
        if target.offset().top < threshold
          if (!target.data("visible"))
            target.data("visible", true);
            Session.set("postfriendsitemsLimit",Session.get("postfriendsitemsLimit")+POSTFRIENDS_ITEMS_INCREMENT)
        else
          if (target.data("visible"))
            target.data("visible", false);
  Template.addNewFriends.helpers
    meeter:()->
      PostFriends.find({meetOnPostId:Session.get("postContent")._id,ta:{$ne:null}},{sort:{createdAt:-1}})
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
    showRedSpot:()->
      if this.count>1
        false
      else
        true
    moreResults:()->
      return PostFriendsCount.findOne({_id:Meteor.userId()+'_'+Session.get("postContent")._id})?.count > Session.get("postfriendsitemsLimit")
      # !(PostFriends.find({meetOnPostId:Session.get("postContent")._id}).count()+1 < Session.get("postfriendsitemsLimit"))
    loading:()->
      Session.equals('postfriendsCollection','loading')
    loadError:()->
      Session.equals('postfriendsCollection','error')
  Template.addNewFriends.events
    "click .newFriends":(e)->
      currentId =  e.currentTarget.id
      if $('#' + currentId + ' .red_spot').length > 0
        $('#' + currentId + ' .red_spot').remove()
        totalCount = parseInt($('#newFriendRedSpotReal').html()) - 1
        if totalCount > 0
          $('#newFriendRedSpot').html(totalCount.toString())
          $('#newFriendRedSpot').show()
          $('#newFriendRedSpotReal').hide()
        else
          $('#newFriendRedSpot').hide()
          $('#newFriendRedSpotReal').hide()
      if this.count is 1
        Meets.update({_id: this._id}, {$set: {count: 2}})
      userProfileList = PostFriends.find({meetOnPostId:Session.get("postContent")._id,ta:{$ne:null}},{sort:{createdAt:-1}}).fetch()
      Session.set("userProfileList", userProfileList)
      Session.set("userProfileType", "newfriends")
      Session.set("currentPageIndex", 1)
      for i in [0..userProfileList.length-1]
        if userProfileList[i].ta is this.ta
          Session.set("currentProfileIndex", i)
      prevProfileIndex = Session.get("currentProfileIndex")-1
      nextProfileIndex = Session.get("currentProfileIndex")+1
      if prevProfileIndex < 0
         prevProfileIndex = userProfileList.length-1
      if nextProfileIndex > userProfileList.length-1
         nextProfileIndex = 0
      Session.set("ProfileUserId", this.ta)
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
      console.log  'contactsList addFollow!'
      insertObj = {
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
      addFollower(insertObj)
