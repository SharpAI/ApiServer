#space 2
if Meteor.isClient
  Template.user.onCreated ()->
    Meteor.subscribe("posts")
    Meteor.subscribe("saveddrafts")
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
      SavedDrafts.find({},{sort: {createdAt: -1},limit:2})
    postsCount:->
      Posts.find({owner: Meteor.userId()}).count()
    comparePostsCount:(value)->
      if (Posts.find({owner: Meteor.userId()}).count() > value)
        true
      else
        false
    postItems:()->
      Posts.find({owner: Meteor.userId()}, {sort: {createdAt: -1},limit:4})
    followCount:->
      Follower.find({"userId":Meteor.userId()}).count()
    getmainImage:()->
      mImg = this.mainImage
      if (mImg.indexOf('file:///') >= 0) and device.platform is 'Android'
        if Session.get(mImg) is undefined
          ProcessImage = (URI,smallImage)->
            if smallImage
              Session.set(mImg, smallImage)
            else
              Session.set(mImg, '/noimage.png')
          getBase64OfImage('','',mImg,ProcessImage)
        Session.get(mImg)
      else
        this.mainImage
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
      #Use for if user discard change on Draft
      TempDrafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          TempDrafts.remove drafts._id
      #Clear draft first
      Drafts
        .find {owner: Meteor.userId()}
        .forEach (drafts)->
          Drafts.remove drafts._id
      #Prepare data
      savedDraftData = SavedDrafts.find({_id: e.currentTarget.id}).fetch()[0]
      TempDrafts.insert {
        _id:savedDraftData._id,
        pub:savedDraftData.pub,
        title:savedDraftData.title,
        addontitle:savedDraftData.addontitle,
        fromUrl:savedDraftData.fromUrl,
        mainImage: savedDraftData.mainImage,
        mainText: savedDraftData.mainText,
        owner:savedDraftData.owner,
        createdAt: savedDraftData.createdAt,
      }
      pub = savedDraftData.pub
      if device.platform is 'Android'
        pub.index = -1

        FinalProcess = () ->
          Session.set 'isReviewMode','1'
          $('.user').addClass('animated ' + animateOutLowerEffect);
          Meteor.setTimeout ()->
            PUB.page('/add')
          ,animatePageTrasitionTimeout

        Dispatch = ()->
          if ++pub.index >= pub.length
            return FinalProcess()
          if pub[pub.index].type is 'image' && (pub[pub.index].URI.indexOf('file:///') >= 0)
            filename = pub[pub.index].filename
            URI = pub[pub.index].URI
            getBase64OfImage(filename,'',URI,ProcessImage)
          else
            ProcessText()

        ProcessText = ()->
          # must text
          Drafts.insert(pub[pub.index])
          Dispatch()

        ProcessImage = (URI,smallImage)->
          if smallImage
            pub[pub.index].imgUrl = smallImage
            Drafts.insert(pub[pub.index])
          else
            pub[pub.index].imgUrl = '/noimage.png'
            Drafts.insert(pub[pub.index])
            #it was deleted
          Dispatch()

        Dispatch()
      else
        for i in [0..(pub.length-1)]
          Drafts.insert(pub[i])
        Session.set 'isReviewMode','1'
        PUB.page('/add')

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
