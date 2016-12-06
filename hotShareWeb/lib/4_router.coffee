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
if Meteor.isServer
  request = Meteor.npmRequire('request')
  ###
  Router.route '/posts/:_id', {
      waitOn: ->
          [subs.subscribe("publicPosts",this.params._id),
           subs.subscribe "pcomments"]
      fastRender: true
    }
  ###
  injectSignData = (req,res)->
    try
      console.log(req.url)
      if req.url
        signature=generateSignature('http://'+server_domain_name+req.url)
        if signature
          console.log(signature)
          InjectData.pushData(res, "wechatsign",  signature);
    catch error
      return null
  Router.configure {
    waitOn: ()->
      if this and this.path
        path=this.path
        if path.indexOf('/posts/') is 0
          if path.indexOf('?') > 0
            path = path.split('?')[0]
          params=path.replace('/posts/','')
          params=params.split('/')
          if params.length > 0
            return [subs.subscribe("publicPosts",params[0]),
            subs.subscribe("postsAuthor",params[0]),
            subs.subscribe "pcomments"]
    fastRender: true
  }

  #SSR.compileTemplate('post', Assets.getText('template/post.html'))
  Router.route '/posts/:_id', (req, res, next)->
    _post = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1,isReview:1}})

    if !_post
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(Assets.getText('page-not-found.html'))

    if _post and _post.isReview is false
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(Assets.getText('post-no-review.html'))
    ###
    BOTS = [
      'googlebot',
      'baiduspider',
      '360Spider',
      'sosospider',
      'sogou spider',
      'facebookexternalhit',
      'twitterbot',
      'rogerbot',
      'linkedinbot',
      'embedly',
      'bufferbot',
      'quora link preview',
      'showyoubot',
      'outbrain',
      'pinterest',
      'developers.google.com/+/web/snippet',
      'slackbot'
    ]
    agentPattern = new RegExp(BOTS.join('|'), 'i')
    userAgent = req.headers['user-agent']
    if agentPattern.test(userAgent)
      console.log('user Agent: '+userAgent);
      postItem = Posts.findOne({_id: this.params._id})
      postHtml = SSR.render('post', postItem)

      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.end(postHtml)
    else
    ###
    # postItem = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1}});
    
    Inject.rawModHtml('addxmlns', (html) ->
      return html.replace(/<html>/, '<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:fb="http://ogp.me/ns/fb#">');
    )
    Inject.rawHead("inject-image", "<meta property=\"og:image\" content=\"#{_post.mainImage}\"/>", res);
    Inject.rawHead("inject-description", "<meta property=\"og:description\" content=\"#{_post.title} #{_post.addontitle} 故事贴\"/>",res);
    Inject.rawHead("inject-url", "<meta property=\"og:url\" content=\"http://#{server_domain_name}/posts/#{_post._id}\"/>",res);
    Inject.rawHead("inject-title", "<meta property=\"og:title\" content=\"#{_post.title} - 故事贴\"/>",res);
    Inject.rawHead("inject-width", "<meta property=\"og:image:width\" content=\"400\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"og:image:height\" content=\"300\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"fb:app_id\" content=\"1759413377637096\" />",res);

    #injectSignData(req,res)
    next()
  , {where: 'server'}
  Router.route '/posts/:_id/:index', (req, res, next)->
    _post = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1,isReview:1}})

    if !_post
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(Assets.getText('page-not-found.html'))

    if _post and _post.isReview is false
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      return res.end(Assets.getText('post-no-review.html'))

    # postItem = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1}});
    Inject.rawModHtml('addxmlns', (html) ->
      return html.replace(/<html>/, '<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">');
    )
    Inject.rawHead("inject-image", "<meta property=\"og:image\" content=\"#{_post.mainImage}\"/>", res);
    Inject.rawHead("inject-description", "<meta property=\"og:description\" content=\"#{_post.title} #{_post.addontitle} 故事贴\"/>",res);
    Inject.rawHead("inject-url", "<meta property=\"og:url\" content=\"http://#{server_domain_name}/posts/#{_post._id}\"/>",res);
    Inject.rawHead("inject-title", "<meta property=\"og:title\" content=\"#{_post.title} - 故事贴\"/>",res);
    Inject.rawHead("inject-width", "<meta property=\"og:image:width\" content=\"400\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"og:image:height\" content=\"300\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"fb:app_id\" content=\"1759413377637096\" />",res);

    #injectSignData(req,res)
    next()
  , {where: 'server'}
  ###
  Router.route '/posts/:_id/:_index', {
      waitOn: ->
        [subs.subscribe("publicPosts",this.params._id),
         subs.subscribe "pcomments"]
      fastRender: true
    }
  ###

  Router.route('/restapi/importPost/:type', (req, res, next)->
    req_data = null
    req_type = this.params.type

    res.writeHead(200, {
      'Content-Type': 'text/html'
    })
    req.setEncoding('utf8')
    req.on 'data', (data)->
      # console.log(data)
      req_data = JSON.parse(data)
    req.on 'end', ()->
      if(!req_data)
        return res.end(JSON.stringify({result: 'fail'}))

      Fiber = Meteor.npmRequire('fibers')
      Fiber(()->
        if req_type is 'insert'
          Posts.insert req_data, (err, id)->
            if err or !id
              return res.end(JSON.stringify({result: 'fail'}))
            res.end(JSON.stringify({result: 'ok'}))
        else
          Posts.update {_id: req_data._id}, {$set: req_data}, (err, num)->
            if err or num <= 0
              return res.end(JSON.stringify({result: 'fail'}))

            post = Posts.findOne({_id: req_data._id})
            request({method: 'GET', uri: '/restapi/postInsertHook/' + post.owner + '/' + post._id})
            res.end(JSON.stringify({result: 'ok'}))
      ).run()
  , {where: 'server'})

  Router.route('/restapi/postInsertHook/:_userId/:_postId', (req, res, next)->
    return_result = (result)->
      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.end(JSON.stringify({result: result}))
    _user = Meteor.users.findOne({_id: this.params._userId})
    #unless _user and _user.profile and _user.profile.reporterSystemAuth
      #console.log('sep1');
    #  return return_result(false)

    _post = Posts.findOne({_id: this.params._postId})
    if(!_post)
      return return_result(false)
    
    #if !_post or _post.isReview is true or _post.isReview is null or _post.isReview is undefined
      #console.log('sep2:', _post.isReview);
    #  return return_result(false)
    
    # update topicposs mainImage
    try
      topicpossCount = TopicPosts.find({postId: this.params._postId, owner: this.params._userId}).count()
      if topicpossCount > 0
        TopicPosts.update({postId: this.params._postId, owner: this.params._userId},{$set:{mainImage: _post.mainImage}})
    catch error
      console.log('update topicposs mainImage error, MSG = ',error)
    
    # review
    Posts.update {_id: this.params._postId}, {$set: {isReview: true}}, (err, num)->
      if err or num <= 0
        #console.log('sep3');
        return return_result(false)

      RePosts.remove({_id: _post._id})
      _post.isReview = true
      doc = _post
      userId = doc.owner
      if doc.owner != userId
        me = Meteor.users.findOne({_id: userId})
        if me and me.type and me.token
          Meteor.users.update({_id: doc.owner}, {$set: {type: me.type, token: me.token}})

      refreshPostsCDNCaches(doc._id);
      globalPostsInsertHookDeferHandle(doc.owner,doc._id);
      #console.log('sep4');
      return_result(true)

    # self = this
    # failPage = ()->
    #   res.writeHead(404, {
    #     'Content-Type': 'text/html'
    #   })
    #   res.end("restapi failed! _userId="+self.params._userId+", _postId="+self.params._postId)
    # sucPage = ()->
    #   res.writeHead(200, {
    #     'Content-Type': 'text/html'
    #   })
    #   res.end("restapi suc! _userId="+self.params._userId+", _postId="+self.params._postId)
    # if this.params._userId is undefined or this.params._userId is null or this.params._postId is undefined or this.params._postId is null
    #   console.log("restapi/postInsertHook: Send fail page.");
    #   failPage()
    #   return
    # globalPostsInsertHookDeferHandle(this.params._userId, this.params._postId)
    # console.log("restapi/postInsertHook: Send suc page.");
    # sucPage()
    # return
  , {where: 'server'})

  Router.route('/download-reporter-logs', (req, res, next)->
    data = reporterLogs.find({},{sort:{createdAt:-1}}).fetch()
    fields = [
      {
        key:'postId',
        title:'帖子Id',
      },
      {
        key:'postTitle',
        title:'帖子标题',
      },
      {
        key:'postCreatedAt',
        title:'帖子创建时间',
        transform: (val, doc)->
          d = new Date(val)
          return d.toLocaleString()
      },
      {
        key: 'userId',
        title: '用户Id(涉及帖子操作时，为帖子Owner)'
      },
      {
        key:'userName',
        title:'用户昵称'
      },
      {
        key:'userEmails',
        title:'用户Email',
        transform: (val, doc)->
          emails = ''
          if val and val isnt null
            val.forEach (item)->
              emails += item.address + '\r\n'
          return emails;
      },
      {
        key:'eventType',
        title: '操作类型'
      },
      {
        key:'loginUser',
        title: '操作人员',
        transform: (val, doc)->
          user = Meteor.users.findOne({_id: val})
          userInfo = '_id: '+val+'\r\n username: '+user.username
          return userInfo
      },
      {
        key: 'createdAt',
        title: '操作时间',
        transform: (val, doc)->
          d = new Date(val)
          return d.toLocaleString()
      },

    ]

    title = 'hotShareReporterLogs-'+ (new Date()).toLocaleDateString()
    file = Excel.export(title, fields, data)
    headers = {
      'Content-type': 'application/vnd.openxmlformats',
      'Content-Disposition': 'attachment; filename=' + title + '.xlsx'
    }

    this.response.writeHead(200, headers)
    this.response.end(file, 'binary')
  , { where: 'server' })



