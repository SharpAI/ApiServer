if Meteor.isClient
  Meteor.startup ()->
    hasMoreResult = ()->
      if NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
        !(NewDynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
      else
        false
    # Template.discover.rendered=->
    #   if withDiscover
    #     spanOuterWidth = $(".discover .discover-top .discover-con span").outerWidth() || 0
    #     $(".discover .discover-top .discover-con").css({'width': (spanOuterWidth + 40) + 'px'});

    Template.discover.helpers
      showSuggestPosts:()->
        if Session.get("showSuggestPosts") is true
          allmoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count()
          mymoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id,userId:Meteor.userId()},{sort: {createdAt: -1}}).count()
          if allmoments-mymoments > 0
            false
          else
            true
        else
          false
      hasDiscover: ()->
        withDiscover
    Template.moments.rendered=->
      $(window).scroll (event)->
        if Session.get("Social.LevelOne.Menu") is 'discover'
          MOMENTS_ITEMS_INCREMENT = 10;
          #console.log("moments window scroll event: "+event);
          if withNewLayoutMoment
            if window.innerHeight
              winHeight = window.innerHeight
            else
              winHeight = $(window).height() # iphone fix
            closeToBottom = ($(window).scrollTop() + winHeight > $(document).height() - 100);
            #console.log('Close to bottom: '+closeToBottom)
            if (closeToBottom and hasMoreResult())
              if window.momentsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
                console.log('Triggered data source refresh');
                window.momentsCollection_getmore = 'inprogress'
                Session.set("momentsitemsLimit",Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
          else
            target = $("#showMoreMomentsResults");
            console.log "target.length: " + target.length
            if (!target.length)
              return;
            threshold = $(window).scrollTop() + $(window).height() - target.height();
            console.log "threshold: " + threshold
            console.log "target.top: " + target.offset().top
            if target.offset().top < threshold
              if window.momentsCollection_getmore is 'done' and (window.newLayoutImageInDownloading < 5)
                if (!target.data("visible"))
                  target.data("visible", true);
                  window.momentsCollection_getmore = 'inprogress'
                  Session.set("momentsitemsLimit",Session.get("momentsitemsLimit") + MOMENTS_ITEMS_INCREMENT);
            else
              if (target.data("visible"))
                target.data("visible", false);
    Template.moments.helpers
      isLoading:()->
        (Session.equals('newLayoutImageDownloading',true) or
          !Session.equals('momentsCollection_getmore','done')) and
          Session.equals("SocialOnButton",'discover')
      onPostId:()->
        Session.get("postContent")._id
      newLayoutMoment:()->
        withNewLayoutMoment
      withSuggestAlreadyRead:()->
        withSuggestAlreadyRead
      showSuggestPosts:()->
        if Session.get("showSuggestPosts") is true
          allmoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count()
          mymoments = NewDynamicMoments.find({currentPostId:Session.get("postContent")._id,userId:Meteor.userId()},{sort: {createdAt: -1}}).count()
          if allmoments-mymoments > 0
            false
          else
            true
        else
          false
      moments:()->
        NewDynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      suggestPosts:()->
        SuggestPosts.find({},{sort: {createdAt: -1},limit:10})
      hidePost:()->
        Session.get('hideSuggestPost_'+this.readPostId) or this.userId is Meteor.userId()
      hideSuggestPost:()->
        console.log this._id
        Session.get('hideSuggestPost_'+this._id) or this.owner is Meteor.userId()
      time_diff: (created)->
        GetTime0(new Date() - created)
      moreResults:()->
        hasMoreResult()
      loading:()->
        Session.equals('momentsCollection','loading')
      loadError:()->
        Session.equals('momentsCollection','error')
    Template.moments.events
      'click .readpost':(e)->
        postId = this.readPostId
        scrollTop = $(window).scrollTop()
        if postId is undefined
          postId = this._id
        $(window).children().off()
        $(window).unbind('scroll')
        id = Session.get("postContent")._id
        #PUB.postPage(id,scrollTop)
        Meteor.setTimeout ()->
          Session.set("Social.LevelOne.Menu",'contactsList')
          Router.go '/posts/'+postId
        ,300
      'click .masonry_element':(e)->
        postId = $(e.currentTarget).find('.readPost')[0].id
        scrollTop = $(window).scrollTop()
        if postId is undefined
          postId = this._id
        $(window).children().off()
        $(window).unbind('scroll')
        id = Session.get("postContent")._id
        #PUB.postPage(id,scrollTop)
        Meteor.setTimeout ()->
          Session.set("Social.LevelOne.Menu",'contactsList')
          Router.go '/posts/'+postId
        ,300
    Template.lpcomments.helpers
      isShareFeed:->
        if this.eventType is "share"
          true
        else
          false    
      withSuggestAlreadyRead:()->
        withSuggestAlreadyRead
      description:->
        if this.eventType is "pcommentowner"
          "点评了您的故事"
        else
          "也点评了此故事"
      commentReply:->
        if this.eventType is "pcommentReply"
          true
        else
          false  
      hasLpcoments:()->
        Feeds.find({followby:Meteor.userId(),checked:false, eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20}).count() > 0
      lpcomments:()->
        Feeds.find({followby:Meteor.userId(),checked:false, eventType: {$nin: ['share','personalletter']}, createdAt:{$gt:new Date((new Date()).getTime() - 7 * 24 * 3600 * 1000)}},{sort: {createdAt: -1}, limit:20})
      time_diff: (created)->
        GetTime0(new Date() - created)
    Template.lpcomments.events
      'click .lpAlreadyRead':(e)->
        console.log this._id
        Feeds.update({_id:this._id},{$set: {checked:true}})
      'click .readpost':(e)->
        postId = this.postId
        scrollTop = $(window).scrollTop()
        Session.set("pcurrentIndex",this.pindex)
        Session.set("pcommetsId",this.owner)
        Session.set("pcommentsName",this.ownerName)
        Session.set "toasted",false
        if this.eventType is 'pcommentReply'
          Session.set "isPcommetReply",true
        else
          Session.set "isPcommetReply",false
        Feeds.update({_id:this._id},{$set: {checked:true}})
        id = Session.get("postContent")._id
        if postId isnt id
          Session.set('displayDiscoverContent',false)
          $(window).children().off()
          $(window).unbind('scroll')
          #PUB.postPage(id,scrollTop)
          Meteor.setTimeout ()->
            Session.set("Social.LevelOne.Menu",'contactsList')
            Session.set("needBindScroll", true)
            Router.go '/posts/'+postId
          ,300
        else
          document.body.scrollTop = 0
    Template.recommends.helpers
      recommends: ()->
        Meteor.subscribe('list_recommends', Session.get("postContent")._id);
        Recommends.find({relatedPostId: Session.get("postContent")._id})
      time_diff: (created)->
        GetTime0(new Date() - created)
    Template.recommends.events
      'click .elementBox':(e)->
        Session.set("historyForwardDisplay", false)
        postId = e.currentTarget.id
        scrollTop = $(window).scrollTop()
        Session.set("lastPost",postId)
        $(window).children().off()
        $(window).unbind('scroll')
        userLists = []
        recommend = Recommends.findOne({recommendPostId:postId})
        if recommend and recommend.readUsers
          userLists = recommend.readUsers
        userLists.push(Meteor.userId())
        Recommends.update({_id:recommend._id},{$set: {readUsers: userLists}})
        if typeof PopUpBox isnt "undefined"
          PopUpBox.close()
        Meteor.setTimeout ()->
          Session.set("Social.LevelOne.Menu",'contactsList')
          Session.set("needBindScroll", true)
          Router.go '/posts/'+postId
        ,300
        # Router.go '/posts/'+postId
