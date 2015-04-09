if Meteor.isClient
  Template.contactsList.helpers
    location:->
      Meteor.subscribe("userinfo",this.followerId);
      UserProfile = Meteor.users.findOne {_id: this.followerId}
      UserProfile.profile.location
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
    "click .userProfile":(e)->
      Session.set("ProfileUserId", this.followerId)
      Meteor.subscribe("userinfo", this.followerId)
      Meteor.subscribe("recentPostsViewByUser", this.followerId)
      Session.set("Social.LevelOne.Menu", 'userProfile')
    'click .messageGroup': ()->
      Session.set("Social.LevelOne.Menu", 'messageGroup')      
  Template.addNewFriends.helpers
    is_meet_count: (count)->
      count > 0
    username:->
      Meteor.subscribe("userinfo",this.ta)
      taUser = Meteor.users.findOne {_id: this.ta}
      if taUser is undefined
        return ''
      UserName = taUser.username
      if taUser.profile.fullname
        UserName = taUser.profile.fullname
      UserName
    userIcon:->
      Meteor.subscribe("userinfo",this.ta)
      taUser = Meteor.users.findOne {_id: this.ta}
      if taUser is undefined
        return ''
      taUser.profile.icon
    meet_count:->
      meetItem = Meets.findOne({me:Meteor.userId(),ta:this.ta})
      if meetItem
        meetCount = meetItem.count
      else
        meetCount = 0
      meetCount
    location:->
      Meteor.subscribe("userinfo",this.userId);
      UserProfile = Meteor.users.findOne {_id: this.userId}
      if  UserProfile and UserProfile.profile.location
        UserProfile.profile.location
      else
        ""
    viewer:()->
      #Viewers.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}, limit:21})
      viewerResult = Viewers.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}, limit:21}).fetch()
      if viewerResult and (viewerResult.length > 1)
        for i in [0..(viewerResult.length-1)]
          meetItem = Meets.findOne({me:Meteor.userId(),ta:viewerResult[i].userId})
          if meetItem
            meetCount = meetItem.count
          else
            meetCount = 0
          viewerResult[i].meetCount = meetCount
        sortBy = (key, a, b, r) ->
            r = if r then 1 else -1
            return -1*r if a[key] > b[key]
            return +1*r if a[key] < b[key]
            return 0
        viewerResult.sort((a, b)->
          sortBy('meetCount', a, b, 1)
        )
        return viewerResult
    meeter:()->
      meeterResult = Meets.find({me:Meteor.userId()}, {sort: {count: -1}, limit:20}).fetch()
      return meeterResult
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
    "click .newUserProfile":(e)->
      Session.set("ProfileUserId", this.ta)
      Meteor.subscribe("userinfo",this.ta)
      Meteor.subscribe("recentPostsViewByUser",this.ta)
      Session.set("Social.LevelOne.Menu", 'userProfile')
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
