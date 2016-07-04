Meteor.methods
  followAuthor: (authorId, userId) ->
    author = GushitieUsers.findOne({_id: authorId})
    user = Meteor.users.findOne({_id: userId})
    GushitieFollower.insert {
      userId: Meteor.userId()
      #这里存放fullname
      userName: user.username
      userIcon: user.profile.icon
      userDesc: if user.profile.desc then user.profile.desc else ''
      followerId: authorId
      #这里存放fullname
      followerName: author.profile.username
      followerIcon: author.profile.icon
      followerDesc: if author.profile.desc then author.profile.desc else ''
      createAt: new Date()
    },(err)->
      if !err
        return true

    