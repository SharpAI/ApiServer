#space 2
if Meteor.isClient
  Meteor.startup ()->
    ###
    Session.setDefault('myFollowedByCount',0)
    Session.setDefault('mySavedDraftsCount',0)
    Session.setDefault('myPostsCount',0)
    Session.setDefault('myFollowToCount',0)
    ###
    Tracker.autorun ()->
      if Counts.get('myFollowedByCount') > 0
        Session.setPersistent('myFollowedByCount',Counts.get('myFollowedByCount'))
      if Counts.get('mySavedDraftsCount') > 0
        Session.setPersistent('mySavedDraftsCount',Counts.get('mySavedDraftsCount'))
      if Counts.get('myPostsCount') > 0
        Session.setPersistent('myPostsCount',Counts.get('myPostsCount'))
      if Counts.get('myFollowToCount') > 0
        Session.setPersistent('myFollowToCount',Counts.get('myFollowToCount'))

    Tracker.autorun ()->
      if Meteor.user() and Session.equals('channel','user')
        Meteor.subscribe("myCounter")
        Meteor.subscribe("postsWithLimit",4)
        Meteor.subscribe("savedDraftsWithLimit",2)
        Meteor.subscribe("followedByWithLimit",10)
        Meteor.subscribe("followToWithLimit",10)
  Template.user.helpers
    myProfileIcon:->
      me = Meteor.user()
      if me and me.profile and me.profile.icon
        Session.setPersistent('persistentProfileIcon',me.profile.icon)
      Session.get('persistentProfileIcon')
    myProfileName:->
      me = Meteor.user()
      if me and me.profile and me.profile.fullname
        Session.setPersistent('persistentProfileName',me.profile.fullname)
      else if me and me.username
        Session.setPersistent('persistentProfileName',me.username)
      Session.get('persistentProfileName')
    followers:->
      #Follower存放用户间关注记录， Follows是推荐偶像列表
      #followerId是偶像userId, userId是粉丝userId
      myFollowedByCount = Session.get('myFollowedByCount')
      if myFollowedByCount
        myFollowedByCount
      else
        0
    draftsCount:->
      mySavedDraftsCount = Session.get('mySavedDraftsCount')
      if mySavedDraftsCount
        mySavedDraftsCount
      else
        0
    compareDraftsCount:(value)->
      if (Session.get('mySavedDraftsCount')> value)
        true
      else
        false
    items:()->
      mySavedDrafts = SavedDrafts.find({},{sort: {createdAt: -1},limit:2})
      if mySavedDrafts.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentMySavedDrafts',mySavedDrafts.fetch())
        return mySavedDrafts
      else
        Session.get('persistentMySavedDrafts')
    postsCount:->
      myPostsCount = Session.get('myPostsCount')
      if myPostsCount
        myPostsCount
      else
        0
    comparePostsCount:(value)->
      if (Session.get('myPostsCount') > value)
        true
      else
        false
    postItems:()->
      myOwnPosts = Posts.find({owner: Meteor.userId()}, {sort: {createdAt: -1},limit:4})
      if myOwnPosts.count() > 0
        Meteor.defer ()->
          Session.setPersistent('persistentMyOwnPosts',myOwnPosts.fetch())
        return myOwnPosts
      else
        Session.get('persistentMyOwnPosts')
    followCount:->
      myFollowToCount = Session.get('myFollowToCount')
      if myFollowToCount
        myFollowToCount
      else
        0
    getmainImage:()->
      mImg = this.mainImage
      if (mImg.indexOf('file:///') >= 0)
        selector = "draftImg_"+this._id
        ProcessImage = (URI,smallImage)->
          if smallImage
            $(selector).attr('style',"background-image:url("+smallImage+")")
          else
            $(selector).attr('style',"background-image:url('/noimage.png')")
        getBase64OfImage('','',mImg,ProcessImage)
        return ''
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
      uploadFile 160, 160, 60, (status,result)->
        e.currentTarget.innerHTML = '<span class="fa fa-spinner fa-spin"></span>'
        if status is 'done' and result
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
      Session.set('followersitemsLimit', 10);
      Session.set('followeesitemsLimit', 10);
      #true 列出偶像列表，false 列出粉丝列表
      Session.set 'followers_tag', false
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/followers'
      ,animatePageTrasitionTimeout
    'click .following' :->
      Session.set('followeesitemsLimit', 10);
      Session.set('followersitemsLimit', 10);
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
      savedDraftData = SavedDrafts.find({_id: this._id}).fetch()[0]
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
      Session.set("postPageScrollTop", 0)
      postId = e.currentTarget.id
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        Router.go '/posts/'+postId
      ,animatePageTrasitionTimeout
    'click .postRight':(e)->
      #Session.set("mypostsitemsLimit", 15)
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/myPosts')
      ,animatePageTrasitionTimeout
