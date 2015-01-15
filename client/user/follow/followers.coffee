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
    page_title:->
      #true 列出偶像列表，false 列出粉丝列表
      if Session.get('followers_tag')
         '正在关注'
      else
         '关注者'
  Template.followers.events
    'click .back' :->
      Router.go '/user'
