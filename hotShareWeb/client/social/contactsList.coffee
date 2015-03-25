if Meteor.isClient
  Template.contactsList.helpers
    viewer:()->
      Viewers.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}})
    isMyself:()->
      this.userId is Meteor.userId()