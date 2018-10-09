subs = new SubsManager({
  #maximum number of cache subscriptions
  cacheLimit: 999,
  # any subscription will be expire after 30 days, if it's not subscribed again
  expireIn: 60*24*30
});

if Meteor.isClient
  Session.setDefault("postPageScrollTop", 0)
  @refreshPostContent=()->
    layoutHelperInit()
    Session.set("displayPostContent",false)
    Meteor.setTimeout ()->
      Session.set("displayPostContent",true)
    ,300
  Router.onBeforeAction ()->
    console.log  'Router.url === '+this.url
    if Meteor.loggingIn()
      this.next()
      return
    if Meteor.userId()
      this.next()
      return
    else
      if this.url.indexOf('/simple-chat') != -1
        console.log  'is open simple-chat!'
        #Session.set('disableAnonymousLogin',true);
        Session.set('routerWillRenderPage',this.url+'?id='+this.params.query['id'])
        Router.go('/authOverlay')
        this.next()
        return
      else if this.url.indexOf('/posts') != -1 or this.url.indexOf('/series') != -1
        Session.set('routerWillRenderPage',this.url)
        Router.go('/authOverlay')
        this.next()
        return
      #Router.go('/authOverlay')
      else
        this.next()
        return
  Router.route '/authOverlay',()->
    this.render 'authOverlay'
    #Session.set('disableAnonymousLogin',true);
    return
  Router.route '/loginForm', ()->
    this.render 'loginForm'
    #Session.set('disableAnonymousLogin',true);
    return
  Router.route '/signupForm', ()->
    this.render 'signupForm'
    #Session.set('disableAnonymousLogin',true);
    return
  Router.route '/recoveryForm', ()->
    #Session.set('disableAnonymousLogin',true);
    this.render 'recoveryForm'
    return
  Router.route '/deal_page',()->
    #Session.set('disableAnonymousLogin',true);
    this.render 'deal_page'
    return
  Router.route '/bell',()->
    this.render 'bell'
    Session.set 'channel','bell'
    return
  Router.route '/redirect/:_id',()->
    Session.set('nextPostID',this.params._id)
    this.render 'redirect'
    return
  Router.route '/import', ()->
    this.render 'importPost'
  Router.route '/VEWorld', ()->
    this.render 'VEWorld'
  Router.route '/VEOffice/:_id', ()->
    this.render 'VEOffice'
  Router.route '/series/:_id', {
      waitOn: ->
        [subs.subscribe("oneSeries", this.params._id)]
      action: ->
        series = Series.findOne({_id: this.params._id})
        Session.set('seriesContent',series)
        this.render 'series', {data: series}
      fastRender: true
    }
  Router.route '/posts/:_id', {
      waitOn: ->
          [subs.subscribe("publicPosts", this.params._id),
           subs.subscribe("postsAuthor",this.params._id),
           subs.subscribe "pcomments"]
      loadingTemplate: 'loadingPost'
      action: ->
        post = Posts.findOne({_id: this.params._id})
        # Server won't push data if post not review
        #if !post or (post.isReview is false and post.owner isnt Meteor.userId())
        #  return this.render 'postNotFound'
        unless post
          console.log "Cant find the request post"
          this.render 'postNotFound'
          return
        Session.set("refComment",[''])
        if post and Session.get('postContent') and post.owner isnt Meteor.userId() and post._id is Session.get('postContent')._id and String(post.createdAt) isnt String(Session.get('postContent').createdAt)
          Session.set('postContent',post)
          refreshPostContent()
          toastr.info('作者修改了帖子内容.')
        else
          Session.set('postContent',post)
        Session.set('focusedIndex',undefined)
        if post.addontitle and (post.addontitle isnt '')
          documentTitle = post.title + "：" + post.addontitle
        else
          documentTitle = post.title
        Session.set("DocumentTitle",documentTitle)
        favicon = document.createElement('link')
        favicon.id = 'icon'
        favicon.rel = 'icon'
        favicon.href = post.mainImage
        document.head.appendChild(favicon)

        unless Session.equals('channel','posts/'+this.params._id)
          refreshPostContent()
        this.render 'showPosts', {data: post}
        Session.set 'channel','posts/'+this.params._id
      fastRender: true
    }
  Router.route '/view_posts/:_id', {
      waitOn: ->
          [subs.subscribe("publicPosts", this.params._id),
           subs.subscribe("postsAuthor",this.params._id),
           subs.subscribe "pcomments"]
      loadingTemplate: 'loadingPost'
      action: ->
        post = Posts.findOne({_id: this.params._id})
        # if !post or (post.isReview is false and post.owner isnt Meteor.userId())
        #   return this.render 'postNotFound'
        unless post
          console.log "Cant find the request post"
          this.render 'postNotFound'
          return
        Session.set("refComment",[''])
        if post and Session.get('postContent') and post.owner isnt Meteor.userId() and post._id is Session.get('postContent')._id and String(post.createdAt) isnt String(Session.get('postContent').createdAt)
          Session.set('postContent',post)
          refreshPostContent()
          toastr.info('作者修改了帖子内容.')
        else
          Session.set('postContent',post)
        Session.set('focusedIndex',undefined)
        if post.addontitle and (post.addontitle isnt '')
          documentTitle = post.title + "：" + post.addontitle
        else
          documentTitle = post.title
        Session.set("DocumentTitle",documentTitle)
        favicon = document.createElement('link')
        favicon.id = 'icon'
        favicon.rel = 'icon'
        favicon.href = post.mainImage
        document.head.appendChild(favicon)

        unless Session.equals('channel','posts/'+this.params._id)
          refreshPostContent()
        this.render 'showPosts', {data: post}
        Session.set 'channel','posts/'+this.params._id
      fastRender: true
    }
  Router.route '/posts/:_id/:_index', {
    name: 'post_index'
    waitOn: ->
      [Meteor.subscribe("publicPosts",this.params._id),
       Meteor.subscribe("postsAuthor",this.params._id),
       Meteor.subscribe "pcomments"]
    loadingTemplate: 'loadingPost'
    action: ->
      if Session.get("doSectionForward") is true
        Session.set("doSectionForward",false)
        Session.set("postPageScrollTop",0)
        document.body.scrollTop = 0
      post = Posts.findOne({_id: this.params._id})
      if !post or (post.isReview is false and post.owner isnt Meteor.userId())
        return this.render 'postNotFound'
      unless post
        console.log "Cant find the request post"
        this.render 'postNotFound'
        return
      Session.set("refComment",[''])
      ###
      Meteor.subscribe "refcomments",()->
        Meteor.setTimeout ()->
          refComment = RefComments.find()
          if refComment.count() > 0
            Session.set("refComment",refComment.fetch())
        ,2000
      ###
      if post and Session.get('postContent') and post.owner isnt Meteor.userId() and post._id is Session.get('postContent')._id and String(post.createdAt) isnt String(Session.get('postContent').createdAt)
        Session.set('postContent',post)
        refreshPostContent()
        toastr.info('作者修改了帖子内容.')
      else
        Session.set('postContent',post)
      Session.set('focusedIndex',this.params._index)
      if post.addontitle and (post.addontitle isnt '')
        documentTitle = post.title + "：" + post.addontitle
      else
        documentTitle = post.title
      Session.set("DocumentTitle",documentTitle)
      favicon = document.createElement('link')
      favicon.id = 'icon'
      favicon.rel = 'icon'
      favicon.href = post.mainImage
      document.head.appendChild(favicon)

      unless Session.equals('channel','posts/'+this.params._id+'/'+this.params._index)
        refreshPostContent()

      this.render 'showPosts', {data: post}
      Session.set('channel','posts/'+this.params._id+'/'+this.params._index)
    fastRender: true
  }
  Router.route '/',()->
    this.render 'webHome'
    return
  Router.route '/help',()->
    this.render 'help'
    return
  Router.route 'userProfilePage1',
    template: 'userProfile'
    path: '/userProfilePage1'
  Router.route 'userProfilePage2',
    template: 'userProfile'
    path: '/userProfilePage2'
  Router.route 'userProfilePage3',
    template: 'userProfile'
    path: '/userProfilePage3'
  Router.route 'searchMyPosts',
    template: 'searchMyPosts'
    path: '/searchMyPosts'
  Router.route 'unpublish',
    template: 'unpublish'
    path: '/unpublish'
  Router.route 'setNickname',
    template: 'setNickname'
    path: '/setNickname'
  Router.route '/userProfilePage',()->
    this.render 'userProfilePage'
    return
  Router.route '/hotPosts/:_id',()->
    this.render 'hotPosts'
    return
  Router.route 'recommendStory',()->
    this.render 'recommendStory'
    return
  Router.route '/groupsProfile/:_id',()->
    limit = withShowGroupsUserMaxCount || 29;
    Meteor.subscribe("get-group-user-with-limit",this.params._id,limit)
    console.log(this.params._id)
    Session.set('groupsId',this.params._id)
    this.render 'groupsProfile'
    return
