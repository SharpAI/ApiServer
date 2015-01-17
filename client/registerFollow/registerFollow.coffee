#用户 space2
Template.follow_user.helpers
  follows: ->
    Follows.find()
Template.follow_user_list.helpers
   isFollowed:(follow)->
       fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
       if fcount > 0
           true
       else
           false
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
    Router.go('/')
  'click .add':(e)->
    followsId = e.currentTarget.id
    Follower.insert {
      userId: Meteor.userId()
      #用户更新fullname后，这里存放fullname
      userName: Meteor.user().username
      #刚注册，用户还没有设置头像和个性签名
      userIcon: Meteor.user().profile.icon
      userDesc: Meteor.user().profile.desc
      followerId: Follows.findOne({_id:followsId}).userId
      #这里存放fullname
      followerName: Follows.findOne({_id:followsId}).fullname
      followerIcon: Follows.findOne({_id:followsId}).icon
      followerDesc: Follows.findOne({_id:followsId}).desc
      createAt: new Date()
    }
  'click .del':(e)->
    followsId = e.currentTarget.id
    followerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: Follows.findOne({_id:followsId}).userId
                 })._id
    Follower.remove(followerId)
