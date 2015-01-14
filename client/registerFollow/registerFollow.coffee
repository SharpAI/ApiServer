#用户 space2
Template.follow_user.helpers
  follows: ->
    Follows.find()
Template.registerFollow.events
  'click #continue':->
    Router.go('/')
  'click .add':(e)->
    followsId = e.currentTarget.id
    
    Follower.insert {
      userId: Meteor.userId()
      userName: Meteor.user().username
      userIcon: Meteor.user().profile.icon
      userDesc: Meteor.user().profile.desc
      followerId: Follows.findOne({_id:followsId}).userId
      followerName: Follows.findOne({_id:followsId}).username
      followerIcon: Follows.findOne({_id:followsId}).icon
      followerDesc: Follows.findOne({_id:followsId}).desc
      createAt: new Date()
    }