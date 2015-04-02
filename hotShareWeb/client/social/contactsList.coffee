if Meteor.isClient
  Template.contactsList.helpers
    follower:()->
      Follower.find({"userId":Meteor.userId()},{sort: {createdAt: -1}})
    isViewer:()->
      Meteor.subscribe("userViewers", Session.get("postContent")._id,this.followerId)
      if Viewers.find("userId":this.followerId).count()>0
        true
      else
        false
  Template.contactsList.events
    "click #addNewFriends":()->
      Session.set("Social.LevelOne.Menu",'addNewFriends')
    "click .userProfile":(e)->
      Session.set("ProfileUserId", this.followerId)
      Meteor.subscribe("userinfo", this.followerId)
      Meteor.subscribe("userViewers", this.followerId)
      Session.set("Social.LevelOne.Menu", 'userProfile')
    'click .messageGroup': ()->
      Session.set("Social.LevelOne.Menu", 'messageGroup')      
  Template.addNewFriends.helpers
    viewer:()->
      Viewers.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}})
    isMyself:()->
      this.userId is Meteor.userId()
    isSelf:(follow)->
      if follow.userId is Meteor.userId()
        true
      else
        false
    isFollowed:()->
      fcount = Follower.find({"followerId":this.userId}).count()
      if fcount > 0
        true
      else
        false
  Template.addNewFriends.events
#    "click .userProfile":(e)->
#      Session.set("ProfileUserId", @followerId)
#      Meteor.subscribe("userinfo",@followerId);
#      Session.set("Social.LevelOne.Menu", 'userProfile')
#    "click #addNewFriends":()->
#      Session.set("Social.LevelOne.Menu",'addNewFriends')
    'click .delFollow':(e)->
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: @userId
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
        followerId: @userId
        #这里存放fullname
        followerName: @username
        followerIcon: @userIcon
        createAt: new Date()
    }
