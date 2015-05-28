if Meteor.isClient
  Template.showImagesBox.helpers
    displayShowImagesBox:()->
      Session.get('displayShowImagesBox')
