if Meteor.isCordova
  Template.addPost.rendered = ()->
    console.log 'add Posts rendered'
    uploadFile (result)->
      console.log 'upload success: url is ' + result
  Template.addPost.helps
    items:()->
      Drafts.find()