if Meteor.isClient
  Template.socialContent.helpers
    viewer:()->
      Viewers.find({postId:Session.get("postContent")._id}, {sort: {createdAt: 1}})
    isMyself:()->
      this.userId is Meteor.userId()
  Template.socialContent.events
    'click .chatBtn':->
      $('.contactsList').fadeOut 300
      $('.contactsBtn').removeClass "focusColor"
      $('.chatContent').fadeIn 300
      $('.chatBtn').addClass "focusColor"
    'click .contactsBtn':->
      $('.chatContent').fadeOut 300
      $('.chatBtn').removeClass "focusColor"
      $('.contactsList').fadeIn 300
      $('.contactsBtn').addClass "focusColor"
