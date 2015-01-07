if Meteor.isClient
  Template.addPost.rendered = ()->
    console.log 'add Posts rendered'
    uploadFile (result)->
      console.log 'upload success: url is ' + result
      Drafts.insert {owner: Meteor.userId(), imgUrl:result}
    $('.img').css('max-width',$(window).width())
#    $('#titlePic').css('max-width',$(window).width())
#    $('#titlePic').css('height',$(window).height()*0.55)
  Template.addPost.helpers
    items:()->
      Drafts.find()
  Template.addPost.events
    'click .remove':(event)->
      Drafts.remove this._id
    'click #cancle':->
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
        return