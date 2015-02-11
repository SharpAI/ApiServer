#space 2
if Meteor.isClient
  Template.user.helpers
    followers:->
      #Follower存放用户间关注记录， Follows是推荐偶像列表
      #followerId是偶像userId, userId是粉丝userId
      Follower.find({"followerId":Meteor.userId()}).count()
    draftsCount:->
      SavedDrafts.find().count()
    compareDraftsCount:(value)->
      if (SavedDrafts.find().count() > value)
        true
      else
        false
    items:()->
      value = 0
      count = SavedDrafts.find().count()
      if count >=2
        value = 1
      else
        value = count-1
      for i in [0..value]
        SavedDrafts.find().fetch()[i]
    postsCount:->
      Posts.find({owner: Meteor.userId()}).count()
    comparePostsCount:(value)->
      if (Posts.find({owner: Meteor.userId()}).count() > value)
        true
      else
        false
    postItems:()->
      value = 0
      count = Posts.find({owner: Meteor.userId()}).count()
      if count >= 4
        value = 3
      else
        value = count-1
      for i in [0..value]
        Posts.find({owner: Meteor.userId()}).fetch()[i]
    followCount:->
      Follower.find({"userId":Meteor.userId()}).count()
  Template.user.events
    'click #follow': (event)->
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        Router.go '/searchFollow'
      ,900
    'click .icon':(e)->
      val = e.currentTarget.innerHTML
      uploadFile (result)->
        e.currentTarget.innerHTML = '<span class="fa fa-spinner fa-spin"></span>'
        if result
          e.currentTarget.innerHTML = '<img src="'+result+'"  width="80" height="80">'
          Meteor.users.update Meteor.userId(),{$set:{'profile.icon':result}}
          console.log '头像上传成功：' + result
        else
          e.currentTarget.innerHTML = val
        return
      return
    'click #setting' :->
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        Router.go '/dashboard'
      ,900
    'click .follower' :->
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', false
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,900
    'click .following' :->
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', true
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,900
    'click .draftImages ul li':(e)->
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: e.currentTarget.id}).fetch()[0]
      pub = savedDraftData.pub;
      for i in [0..(pub.length-1)]
          Drafts.insert(pub[i])
      Session.set 'isReviewMode','1'
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        PUB.page('/add')
      ,900
      
    'click .draftRight':(e)->
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        PUB.page('/allDrafts')
      ,900
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        Router.go '/posts/'+postId
      ,900
    'click .postRight':(e)->
      $('.user').addClass('animated fadeOutLeft');
      Meteor.setTimeout ()->
        PUB.page('/myPosts')
      ,900
