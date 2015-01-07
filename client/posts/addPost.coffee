if Meteor.isClient
  Template.addPost.rendered = ()->
    console.log 'add Posts rendered'
    uploadFile (result)->
      console.log 'upload success: url is ' + result
      Drafts.insert {owner: Meteor.userId(), imgUrl:result}
#    $('#titlePic').css('width',$(window).width())
#    $('#titlePic').css('height',$(window).height()*0.55)
  Template.addPost.helpers
    items:()->
      Drafts.find()
    