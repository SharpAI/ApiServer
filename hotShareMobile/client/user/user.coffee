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
        Session.set('myCounterCollection','loading')
        Session.set('postsWithLimitCollection','loading')
        Session.set('savedDraftsWithLimitCollection','loading')
        Session.set('followedByWithLimitCollection','loading')
        Session.set('followToWithLimitCollection','loading')
        Meteor.subscribe "myCounter",{
          onReady:()->
            Session.set('myCounterCollection','loaded')
        }
        Meteor.subscribe("postsWithLimit",4,{
          onReady:()->
            Session.set('postsWithLimitCollection','loaded')
        })
        Meteor.subscribe("savedDraftsWithLimit",2,{
          onReady:()->
            Session.set('savedDraftsWithLimitCollection','loaded')
        })
        Meteor.subscribe("followedByWithLimit",10,{
          onReady:()->
            Session.set('followedByWithLimitCollection','loaded')
        })
        Meteor.subscribe("followToWithLimit",10,{
          onReady:()->
            Session.set('followToWithLimitCollection','loaded')
        })
  Template.user.helpers
    isLoading:->
      if (
        Session.get('persistentProfileIcon') is undefined or
        Session.get('persistentProfileName') is undefined or
        Session.get('myFollowedByCount') is undefined or
        Session.get('mySavedDraftsCount') is undefined or
        Session.get('persistentMySavedDrafts') is undefined or
        Session.get('myPostsCount') is undefined or
        Session.get('persistentMyOwnPosts') is undefined or
        Session.get('myFollowToCount') is undefined
        ) and (
        Session.get('myCounterCollection') is 'loading' or
        Session.get('postsWithLimitCollection') is 'loading' or
        Session.get('savedDraftsWithLimitCollection') is 'loading' or
        Session.get('followedByWithLimitCollection') is 'loading' or
        Session.get('followToWithLimitCollection') is 'loading'
        )
          return true
      else
          return false
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
    'focus #search-box': (event)->
       PUB.page '/searchMyPosts'
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
      deferedProcessAddPostItemsWithEditingProcessBar(pub)
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
      history = []
      history.push {
          view: 'user'
          scrollTop: document.body.scrollTop
      }
      Session.set "history_view", history
      Meteor.setTimeout ()->
        Router.go '/posts/'+postId
      ,animatePageTrasitionTimeout
    'click .postRight':(e)->
      $('.user').addClass('animated ' + animateOutLowerEffect);
      Meteor.setTimeout ()->
        PUB.page('/myPosts')
      ,animatePageTrasitionTimeout

  Template.searchMyPosts.rendered=->
#    $('.content').css 'min-height',$(window).height()
    if(Session.get("showBigImage") == undefined)
      Session.set("showBigImage",true)
    if Session.get("noSearchResult") is true
      Session.set("searchLoading", false)
    if($("#search-box").val() is "")
      Session.set("showSearchStatus", false)
      Session.set("noSearchResult", false)
    $(window).scroll (event)->
        console.log "myPosts window scroll event: "+event
        target = $("#showMoreMyPostsResults");
        MYPOSTS_ITEMS_INCREMENT = 300;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                if Session.get("mypostsitemsLimit") < Session.get('myPostsCount')
                    target.data("visible", true);
                    Next_Limit = Session.get("mypostsitemsLimit") + MYPOSTS_ITEMS_INCREMENT
                    if Next_Limit > Session.get('myPostsCount')
                        Next_Limit = Session.get('myPostsCount')
                    Session.set('myPostsCollection','loading')
                    Session.set("mypostsitemsLimit", Next_Limit);
        else
            if (target.data("visible"))
                target.data("visible", false);
    $('#search-box').bind('propertychange input',(e)->
       text = $(e.target).val().trim()
       Session.set("showSearchStatus", true)
       Session.set("searchLoading", true)
       Session.set("noSearchResult", false)
       if text is ""
         Session.set("showSearchStatus", false)
         Session.set("searchLoading", false)
         Session.set("noSearchResult", false)
         return
       PostsSearch.search text
    )
#    if PostsSearch.getStatus().loaded is true
#      Session.set("searchLoading", false)
    $('#search-box').trigger('focus')
  Template.searchMyPosts.helpers
    showSearchStatus:()->
      return Session.get('showSearchStatus')
    searchLoading:()->
      return Session.get('searchLoading')
    noSearchResult:()->
      return Session.get('noSearchResult')
    showBigImage:()->
      return Session.get("showBigImage")
    showRightIcon:()->
      if(Session.get("showBigImage"))
        return "fa fa-list fa-fw"
      else
        return "fa fa-th-large"
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    moreResults:->
      if (Posts.find({owner:Meteor.userId()}).count() < Session.get('myPostsCount')) or (Session.equals('myPostsCollection','loading'))
        true
      else
        false
    loading:->
      Session.equals('myPostsCollection','loading')
    loadError:->
      Session.equals('myPostsCollection','error')
  Template.searchMyPosts.events
    'click .back':(event)->
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
#          PUB.back()
          Router.go('/user')
        ,animatePageTrasitionTimeout
    'click .mainImage':(e)->
        Session.set("postPageScrollTop", 0)
        if isIOS
          if (event.clientY + $('#footer').height()) >=  $(window).height()
            console.log 'should be triggered in scrolling'
            return false
        postId = this._id
        $('.home').addClass('animated ' + animateOutUpperEffect);
        Meteor.setTimeout ()->
          PUB.page '/posts/'+postId
          history = []
          history.push {
              view: 'searchMyPosts'
              scrollTop: document.body.scrollTop
          }
          Session.set "history_view", history
        ,animatePageTrasitionTimeout
        Session.set 'FollowPostsId',this._id
        return
    'click .listView':()->
      if(Session.get("showBigImage"))
        Session.set("showBigImage",false)
      else
        Session.set("showBigImage",true)

