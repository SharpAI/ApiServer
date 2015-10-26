if Meteor.isClient
  Meteor.startup ()->
    hasMoreResult = ()->
      if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
        !(DynamicMoments.find({currentPostId:Session.get("postContent")._id}).count() < Session.get("momentsitemsLimit"))
      else
        false
    Template.discover.helpers
      NoMoments:()->
        if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
          false
        else
          true
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
          if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
            false
          else
            true
        else
          false
      NoMoments:()->
        if DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}}).count() > 0
          false
        else
          true
      moments:()->
        DynamicMoments.find({currentPostId:Session.get("postContent")._id},{sort: {createdAt: -1}})
      suggestPosts:()->
        SuggestPosts.find({},{sort: {createdAt: -1}},limit:10)
      hidePost:()->
        Session.get('hideSuggestPost_'+this._id) || this.userId is Meteor.userId()
      hideSuggestPost:()->
        Session.get('hideSuggestPost_'+this._id)
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
      withSuggestAlreadyRead:()->
        withSuggestAlreadyRead
      description:->
        if this.eventType is "pcommentowner"
          "点评了您的故事"
        else
          "也点评了此故事"
      lpcomments:()->
        Feeds.find({followby:Meteor.userId(),checked:false},{sort: {createdAt: -1}})
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
        Feeds.update({_id:this._id},{$set: {checked:true}})
        id = Session.get("postContent")._id
        if postId isnt id
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
