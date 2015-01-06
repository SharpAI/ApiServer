if Meteor.isClient
  Template.addPost.rendered = ()->
    console.log 'add Posts rendered'
    uploadFile (result)->
      console.log 'upload success: url is ' + result
    $('#titlePic').css('width',$(window).width())
    $('#titlePic').css('height',$(window).height()*0.55)
#        upload_images = Session.get "upload_images"
#        upload_images.push({url: result})
#        Session.set "upload_images",upload_images
  Template.addPost.helpers
    items:()->
      Drafts.find()
    