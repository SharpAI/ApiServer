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
    'click #cancle':->
      Router.go('/')
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
        return
    'click #publish':->
      if Meteor.user() is null
        Router.go('/user')
        false
      else
        pub=[]
#        console.log "#####" + pub
        for i in [0..(Drafts.find().fetch().length-1)]
#          console.log i
          pub.push {
            imgUrl:Drafts.find().fetch()[i].imgUrl,
            text: $("#"+Drafts.find().fetch()[i]._id+"text").val(),
          }
#        console.log "#####end" + pub
        Posts.insert {
          _id:Drafts.find().fetch()[0]._id
          pub:pub,
          owner:Meteor.userId(),
          createdAt: new Date()
        }
        Router.go('/posts/'+Drafts.find().fetch()[0]._id)
        Drafts
          .find {owner: Meteor.userId()}
          .forEach (drafts)->
            Drafts.remove drafts._id
          return
    'click .remove':(event)->
      Drafts.remove this._id
