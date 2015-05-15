if Meteor.isClient
  Template.userProfileBox.helpers
    displayUserProfileBox:()->
      Session.get('displayUserProfileBox')