if Meteor.isClient
  Template.myPosts.rendered=->
    hotPostArray = Meteor.user().myHotPosts
    unless hotPostArray
      hotPostArray = []
    if hotPostArray.length < 3
      Meteor.subscribe "authorReadPopularPosts",Meteor.userId(),3
      mostReadPosts = Posts.find({owner: Meteor.userId(), publish: {$ne: false}},{sort: {browse: -1},limit: 3}).fetch()
      size = hotPostArray.length
      idx = 0
      while (size < 3 && idx < mostReadPosts.length)
        inHotPosts = false
        for itemPost in hotPostArray
          if itemPost.postId and itemPost.postId is mostReadPosts[idx]._id
            inHotPosts = true
        unless inHotPosts
          hotPostArray.push(mostReadPosts[idx])
        idx++
        size = hotPostArray.length
    Session.set("myHotPosts", hotPostArray)
    Session.set("myHotPostsChanged", false)
    $('.content').css 'min-height',$(window).height()
    if(Session.get("showBigImage") == undefined)
      Session.set("showBigImage",true)
    $(window).scroll (event)->
        console.log "myPosts window scroll event: "+event
        target = $("#showMoreMyPostsResults");
        MYPOSTS_ITEMS_INCREMENT = 300;
        if (!target.length)
            return;
        threshold = $(window).scrollTop() + $(window).height() - target.height();

        if target.offset().top < threshold
            if (!target.data("visible"))
                #console.log "my posts items limit:"+Session.get("mypostsitemsLimit")
                #console.log "my posts count:"+Session.get('myPostsCount')
                if Session.get("mypostsitemsLimit") < Session.get('myPostsCount')
                    #console.log "================Loading more==============="
                    target.data("visible", true);
                    Next_Limit = Session.get("mypostsitemsLimit") + MYPOSTS_ITEMS_INCREMENT
                    if Next_Limit > Session.get('myPostsCount')
                        Next_Limit = Session.get('myPostsCount')
                    Session.set('myPostsCollection','loading')
                    Session.set("mypostsitemsLimit", Next_Limit);
        else
            if (target.data("visible"))
                target.data("visible", false);
  Template.myPosts.helpers
    showBigImage:()->
      return Session.get("showBigImage")
    showRightIcon:()->
      if(Session.get("showBigImage"))
        return "fa fa-list fa-fw"
      else
        return "fa fa-th-large"
    items:()->
      Posts.find({owner:Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1}}, {limit:Session.get("mypostsitemsLimit")})
      #for i in [0..Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).count()-1]
      #  Posts.find({owner:Meteor.userId()}, {sort: {createdAt: -1}}).fetch()[i]
    getBrowseCount:(browse)->
      if (browse)
        browse
      else
        0
    moreResults:->
      #if (!(Posts.find({owner:Meteor.userId()}).count() < Session.get("mypostsitemsLimit"))) or (Session.equals('myPostsCollection','loading'))
      if (Posts.find({owner:Meteor.userId()}).count() < Session.get('myPostsCount')) or (Session.equals('myPostsCollection','loading'))
        true
      else
        false
    loading:->
      Session.equals('myPostsCollection','loading')
    loadError:->
      Session.equals('myPostsCollection','error')
    isHotPost:(postId)->
      myHotPosts = Session.get("myHotPosts")
      if (myHotPosts)
        for item in myHotPosts
          itemPostId = item.postId || item._id
          if (itemPostId == postId) 
            return true
      return false
  @isHotPostsChanged = ()->
    Session.get("myHotPostsChanged")
  @saveHotPosts = ()->
    if (Session.get("myHotPostsChanged"))
      myHotPosts = Session.get("myHotPosts")
      Meteor.users.update({_id: Meteor.userId()}, {$set: {'myHotPosts': myHotPosts}});
  addPostToMyHotPosts = (postId, title, addontitle, mainImage)->
    myHotPost = {postId: postId, title: title, addontitle: addontitle, mainImage: mainImage}
    hotPostArray = Session.get("myHotPosts")
    if (hotPostArray == undefined || hotPostArray == null)
      hotPostArray = []
      hotPostArray.push(myHotPost)
    else
      newArray = []
      newArray.push(myHotPost)
      if (hotPostArray.length > 0)
        newArray.push(hotPostArray[0])
      if (hotPostArray.length > 1)
        newArray.push(hotPostArray[1])
      hotPostArray = newArray
    Session.set("myHotPosts", hotPostArray)
    Session.set("myHotPostsChanged", true)
    return
  removePostFromMyHotPosts = (postId)->
    hotPostArray = Session.get("myHotPosts")
    if (hotPostArray)
      newArray = []
      for item in hotPostArray
        itemPostId = item.postId || item._id
        if itemPostId isnt postId
          newArray.push(item)
      hotPostArray = newArray
      Session.set("myHotPosts", hotPostArray)
      Session.set("myHotPostsChanged", true)
    return
  Template.myPosts.events
    'click .img_hotpost':(event)->
      event.stopPropagation()
      removePostFromMyHotPosts(this._id)
    'click .img_unhotpost':(event)->
      event.stopPropagation()
      hotPostArray = Session.get("myHotPosts")
      if (hotPostArray.length >= 3)
        PUB.toast('热门帖子最多选取三张! 请先取消其他热门帖子!')
        return
      addPostToMyHotPosts(this._id, this.title, this.addontitle, this.mainImage)
    'click .back':(event)->
        if (Session.get("myHotPostsChanged"))
          # PUB.confirm("您改变了热门帖子, 要保存吗?", ()->
          #   saveHotPosts()
          # )
          navigator.notification.confirm(
                '您改变了热门帖子, 要保存吗?'
                (index)->
                    if index is 2
                       saveHotPosts()
                    $('.home').addClass('animated ' + animateOutUpperEffect);
                    setTimeout ()->
                      PUB.page('/user')
                    ,animatePageTrasitionTimeout
                '提示'
                ['暂不','保存']
            )
        else
          $('.home').addClass('animated ' + animateOutUpperEffect);
          setTimeout ()->
            PUB.page('/user')
          ,animatePageTrasitionTimeout
    'click .mainImage':(e)->
        Session.set("postPageScrollTop", 0)
        if isIOS
          if (event.clientY + $('#footer').height()) >=  $(window).height()
            console.log 'should be triggered in scrolling'
            return false
        postId = this._id
        if (Session.get("myHotPostsChanged"))
          navigator.notification.confirm(
                '您改变了热门帖子, 要保存吗?'
                (index)->
                    if index is 2
                       saveHotPosts()
                    $('.home').addClass('animated ' + animateOutUpperEffect);
                    setTimeout ()->
                      PUB.page '/posts/'+postId
                    ,animatePageTrasitionTimeout
                    Session.set 'FollowPostsId',this._id
                    Session.set 'backtoMyPosts', true
                '提示'
                ['暂不','保存']
            )
          return
        $('.home').addClass('animated ' + animateOutUpperEffect);
        setTimeout ()->
          PUB.page '/posts/'+postId
        ,animatePageTrasitionTimeout
        Session.set 'FollowPostsId',this._id
        Session.set 'backtoMyPosts', true
        return
    'click .listView':()->
      if(Session.get("showBigImage"))
        Session.set("showBigImage",false)
      else
        Session.set("showBigImage",true)
