#用户 space2
Template.follow_user.helpers
  follows: ->
    Follows.find({},{sort: {index: 1}})
Template.follow_user_list.helpers
  isFollowed:(follow)->
    fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
    if fcount > 0
      true
    else
      false
Template.registerFollow.onCreated ()->
  Meteor.subscribe("follows")
  Meteor.subscribe("follower")
Template.registerFollow.helpers
  followCount: ->
    Follower.find({"userId":Meteor.userId()}).count()
  NeedMoreCount: ->
    4 - Follower.find({"userId":Meteor.userId()}).count()
  larger:(a,b)->
    if a > b
      true
    else
      false
Template.registerFollow.events
  'click #continue':->
    if Meteor.user().profile.new isnt undefined and Meteor.user().profile.new is true
      Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.new": false}})
      Session.setPersistent('persistentLoginStatus',true)
    Router.go('/')
  'click .layer':(e)->
    fcount = Follower.find({"userId":Meteor.userId(),"followerId":@userId}).count()
    if fcount > 0
      followerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: @userId
                 })._id
      Follower.remove(followerId)
    else
      #匿名用户刚注册，系统就已经分配随机全名
      if Meteor.user().profile and Meteor.user().profile.fullname
        username = Meteor.user().profile.fullname
      else
        username = Meteor.user().username
      Follower.insert {
        userId: Meteor.userId()
        #用户更新fullname后，这里存放fullname
        userName: username
        #刚注册，用户还没有设置头像和个性签名
        #注册时，头像用默认头像，desc用''
        userIcon: Meteor.user().profile.icon
        userDesc: Meteor.user().profile.desc
        followerId: @userId
        #这里存放fullname
        followerName: @fullname
        followerIcon: @icon
        followerDesc: @desc
        createAt: new Date()
      }
