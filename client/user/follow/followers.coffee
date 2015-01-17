#space 2
if Meteor.isClient
  Template.followers.helpers
    followers:->
      #true 列出偶像列表，false 列出粉丝列表
      #Follower存放用户间关注记录， Follows是推荐偶像列表
      #followerId是偶像userId, userId是粉丝userId
      if Session.get('followers_tag')
          #粉丝是自己的； true 列出偶像
          Follower.find({"userId":Meteor.userId()}, {sort: {createdAt: -1}})
      else
          #偶像id是自己的； false 列出粉丝
          Follower.find({"followerId":Meteor.userId()}, {sort: {createdAt: -1}})
    isFollowers:->
      if Session.get('followers_tag')
         true
      else
         false
    page_title:->
      #true 列出偶像列表，false 列出粉丝列表
      if Session.get('followers_tag')
         '正在关注'
      else
         '关注者'
    isFollowed:(follow)->
      if Session.get('followers_tag')
         #follow.userId是自己
         #follow.followerId是偶像
         #这个页面可以取消关注，所以要重新检查是否还有关注
         fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.followerId}).count()
      else
         #follow.userId是粉丝
         #找followerId是follow.userId，是否互粉
         fcount = Follower.find({"userId":Meteor.userId(),"followerId":follow.userId}).count()
      if fcount > 0
         true
      else
         false

  Template.followers.events
    'click .back' :->
      Router.go '/user'
    'click .del':(e)->
      followerId = e.currentTarget.id
      FollowerId = Follower.findOne({
                     userId: Meteor.userId()
                     followerId: followerId
                 })._id
      Follower.remove(FollowerId)
    'click .add':(e)->
      followerId = e.currentTarget.id
      Meteor.subscribe "userinfo", followerId, ()->
      follower = Meteor.users.findOne {_id: followerId}
      if follower.profile.fullname
         followername = follower.profile.fullname
      else
         followername = follower.username
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
        followerId: followerId
        #这里存放fullname
        followerName: followername
        followerIcon: follower.profile.icon
        followerDesc: follower.profile.desc
        createAt: new Date()
    }
