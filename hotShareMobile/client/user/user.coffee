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
        SavedDrafts.find({},{sort: {createdAt: -1}}).fetch()[i]
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
        Posts.find({owner: Meteor.userId()}, {sort: {createdAt: -1}}).fetch()[i]
    followCount:->
      Follower.find({"userId":Meteor.userId()}).count()
  Template.user.events
    'click #follow': (event)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/searchFollow'
      ,animatePageTrasitionTimeout
    'click .icon':(e)->
      val = e.currentTarget.innerHTML
      uploadFile 160, 160, 60, (result)->
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
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/dashboard'
      ,animatePageTrasitionTimeout
    'click .follower' :->
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', false
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,animatePageTrasitionTimeout
    'click .following' :->
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', true
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,animatePageTrasitionTimeout
    'click .draftImages ul li':(e)->
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: e.currentTarget.id}).fetch()[0]
      pub = savedDraftData.pub;
      if device.platform is 'Android'
          for i in [0..(pub.length-1)]
            #Drafts.insert(pub[i])
            if (pub[i].URI.indexOf('file:///') >= 0)
              window.getBase64OfImage(pub[i].filename, pub[i].URI.replace(/^.*[\\\/]/, ''), pub[i].URI, (URI,smallImage)->
                for j in [0..(pub.length-1)]
                  if (pub[j].URI == URI)
                    pub[j].imgUrl = smallImage
                    Drafts.insert(pub[j])
              )
            else
              Drafts.insert(pub[i])
      else
          for i in [0..(pub.length-1)]
            Drafts.insert(pub[i])
      Session.set 'isReviewMode','1'
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/add')
      ,animatePageTrasitionTimeout
      
    'click .draftRight':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/allDrafts')
      ,animatePageTrasitionTimeout
    'click .postImages ul li':(e)->
      postId = e.currentTarget.id
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/posts/'+postId
      ,animatePageTrasitionTimeout
    'click .postRight':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/myPosts')
      ,animatePageTrasitionTimeout
