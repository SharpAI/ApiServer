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
if Meteor.isServer
  request = Meteor.npmRequire('request')
  Fiber = Meteor.npmRequire('fibers')
  QRImage = Meteor.npmRequire('qr-image')

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
    if(_post.insertHook is true)
      return return_result(true)

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
    Posts.update {_id: this.params._postId}, {$set: {isReview: true, insertHook: true}}, (err, num)->
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

  # Router.route('/apple-app-site-association', (req, res, next)->
  #   #name = 'apple-app-site-association'
  #   #name = 'import-server'
  #   fs = Npm.require("fs")
  #   path = Npm.require('path')
  #   base = path.resolve('.');
  #   filepath = path.resolve('.') + '/app/lib/apple-app-site-association';
  #   #filepath = path.join(__dirname,'../server/import-server.js')
  #   file = fs.readFileSync(filepath, 'binary');
  #   headers = {
  #     'Content-type': 'application/vnd.openxmlformats',
  #     'Content-Disposition': 'attachment; apple-app-site-association'
  #   }

  #   this.response.writeHead(200, headers)
  #   this.response.end(file, 'binary')
  # , { where: 'server' })

if Meteor.isServer
  workaiId = 'Lh4JcxG7CnmgR3YXe'
  workaiName = 'Actiontec'
  fomat_greeting_text = (time,time_offset)->
    DateTimezone = (d, time_offset)->
      if (time_offset == undefined)
        if (d.getTimezoneOffset() == 420)
            time_offset = -7
        else 
            time_offset = 8
      # 取得 UTC time
      utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      local_now = new Date(utc + (3600000*time_offset))
      today_now = new Date(local_now.getFullYear(), local_now.getMonth(), local_now.getDate(), 
      local_now.getHours(), local_now.getMinutes());

      return today_now;
    
    self = this;
    now = new Date();
    result = '';
    self = DateTimezone(this, time_offset);

    # DayDiff = now.getDate() - self.getDate();
    Minutes = self.getHours() * 60 + self.getMinutes();
    # if (DayDiff === 0) {
    #     result += '今天 '
    # } else if (DayDiff === 1) {
    #     result += '昨天 '
    # } else {
    #     result += self.parseDate('YYYY-MM-DD') + ' ';
    # }
    if (Minutes >= 0 && Minutes < 360)
        result += '凌晨 ';
    if (Minutes >= 360 && Minutes < 660)
        result += '上午 ';
    if (Minutes >= 660 && Minutes < 780)
        result += '中午 ';
    if (Minutes >= 780 && Minutes < 960)
        result += '下午 ';
    if (Minutes >= 960 && Minutes < 1080)
        result += '傍晚 ';
    if (Minutes >= 1080 && Minutes < 1440)
        result += '晚上 ';
    result += self.parseDate('h:mm');
    result = '您的上班时间是 ' + result;
    return result;

  @send_greeting_msg = (data)->
    console.log 'try send_greeting_msg~ with data:'+JSON.stringify(data)
    if !data || !data.images ||data.images.img_type isnt 'face'
      #console.log 'invalid params'
      return
    if !data.in_out
      device =  Devices.findOne({uuid:data.people_uuid})
      if !device || !device.in_out
        #console.log ' not found device or in_device'
        return
      data.in_out = device.in_out
    person = Person.findOne({group_id:data.group_id,'faces.id':data.images.id},{sort: {createAt: 1}})
    if !person
      #console.log 'not find person with faceid is:'+data.images.id
      return
    relation = WorkAIUserRelations.findOne({'ai_persons.id':person._id})
    if !relation
      #console.log 'not find workai user relations'
      return
    create_time = new Date(data.create_time);
    if data.in_out is 'out'
      WorkAIUserRelations.update({_id:relation._id},{$set:{ai_out_time:create_time.getTime(), ai_out_image: data.images.url}});
      return
    WorkAIUserRelations.update({_id:relation._id},{$set:{ai_lastest_in_time:create_time.getTime()}});#平板最新拍到的时间
    if relation.ai_in_time 
      ai_in_time = new Date(relation.ai_in_time);
      today = new Date(create_time.getFullYear(), create_time.getMonth(), create_time.getDate()).getTime(); #凌晨
      if ai_in_time.getTime() > today
        console.log 'today greeting_msg had send'
        #WorkAIUserRelations.update({_id:relation._id},{$set:{ai_in_time:create_time.getTime()}});
        return
    WorkAIUserRelations.update({_id:relation._id},{$set:{ai_in_time:create_time.getTime(), ai_in_image: data.images.url}});
    if !relation.app_user_id
      return
    deviceUser = Meteor.users.findOne({username: data.people_uuid});
    time_offset = 8;
    group = SimpleChat.Groups.findOne({_id: data.group_id});
    if (group && group.offsetTimeZone)
      time_offset = group.offsetTimeZone;

    sendMqttMessage('/msg/u/'+ relation.app_user_id, {
        _id: new Mongo.ObjectID()._str
        # form: { 
        #   id: "fTnmgpdDN4hF9re8F",
        #   name: "workAI",
        #   icon: "http://data.tiegushi.com/fTnmgpdDN4hF9re8F_1493176458747.jpg"
        # }
        form:{
          id: deviceUser._id,
          name: deviceUser.profile.fullname,
          icon: deviceUser.profile.icon
        }
        to: {
          id: relation.app_user_id
          name: relation.app_user_name
          icon: ''
        }
        images: [data.images]
        to_type: "user"
        type: "text"
        text: fomat_greeting_text(create_time,time_offset)
        create_time: new Date()
        checkin_time:create_time
        is_agent_check:true
        offsetTimeZone:time_offset
        group_id:data.group_id
        people_uuid: data.people_uuid
        is_read: false
        checkin_out:'in'
      })


  insert_msg2 = (id, url, uuid, img_type, accuracy, fuzziness, sqlid, style,img_ts,current_ts,tracker_id)->
    #people = People.findOne({id: id, uuid: uuid})
    name = null
    #device = PERSON.upsetDevice(uuid, null)
    create_time = new Date()
    if img_ts and current_ts
      img_ts = Number(img_ts)
      current_ts = Number(current_ts)
      time_diff = img_ts + (create_time.getTime()　- current_ts)
      create_time = new Date(time_diff)

    #if !people
    #  people = {_id: new Mongo.ObjectID()._str, id: id, uuid: uuid,name: name,embed: null,local_url: null,aliyun_url: url}
    #  People.insert(people)
    #else
    #  People.update({_id: people._id}, {$set: {aliyun_url: url}})

    device = Devices.findOne({uuid: uuid})
    PeopleHis.insert {id: id,uuid: uuid,name: name, people_id: id, embed: null,local_url: null,aliyun_url: url}, (err, _id)->
      if err or !_id
        return

      user = Meteor.users.findOne({username: uuid})
      unless user
        return
      userGroups = SimpleChat.GroupUsers.find({user_id: user._id})
      unless userGroups
        return
      userGroups.forEach((userGroup)->
        group = SimpleChat.Groups.findOne({_id:userGroup.group_id});
        if group.template and group.template._id
          if group.template.img_type != img_type
            return
        name = null
        name = PERSON.getName(null, userGroup.group_id,id)
        #没有准确度的人一定是没有识别出来的
        name = if accuracy then name else null
        #没有识别的人的准确度清0
        Accuracy =  if name then accuracy else false
        Fuzziness = fuzziness
        sendMqttMessage('/msg/g/'+ userGroup.group_id, {
          _id: new Mongo.ObjectID()._str
          form: {
            id: user._id
            name: if user.profile and user.profile.fullname then user.profile.fullname else user.username
            icon: user.profile.icon
          }
          to: {
            id: userGroup.group_id
            name: userGroup.group_name
            icon: userGroup.group_icon
          }
          images: [
            {_id: new Mongo.ObjectID()._str, id: id, people_his_id: _id, url: url, label: name, img_type: img_type, accuracy: Accuracy, fuzziness: Fuzziness, sqlid: sqlid, style: style} # 暂一次只能发一张图
          ]
          to_type: "group"
          type: "text"
          text: if !name then 'AI观察到有人在活动' else name + ':'
          create_time: create_time
          people_id: id
          people_uuid: uuid
          people_his_id: _id
          wait_lable: !name
          is_people: true
          is_read: false
          tid:tracker_id
        })

        # update to DeviceTimeLine
        timeObj = {
          person_id: id,
          person_name: name,
          img_url: url,
          sqlid: sqlid, 
          style: style
        }
        PERSON.updateToDeviceTimeline(uuid,userGroup.group_id,timeObj)
        if name
          msg_data = {
            group_id:userGroup.group_id,
            create_time:create_time,
            people_uuid:uuid,
            in_out:userGroup.in_out,
            images:{
              id: id,
              people_his_id: _id,
              url: url,
              label: name,
              img_type: img_type,
              accuracy: Accuracy,
              fuzziness: Fuzziness,
              sqlid: sqlid,
              style: style
            }
          }
          person = Person.findOne({group_id: userGroup.group_id, name: name}, {sort: {createAt: 1}});
          person_info = null
          if img_type == 'face' && person && person.faceId
            #console.log('post person info to aixd.raidcdn')
            person_info = {
              'id': person._id,
              'uuid': uuid,
              'name': name,
              'group_id': userGroup.group_id,
              'img_url': url,
              'type': img_type,
              'ts': create_time.getTime(),
              'accuracy': accuracy,
              'fuzziness': fuzziness
            }

          relation = WorkAIUserRelations.findOne({'ai_persons.id': person._id})
          if (device.in_out is 'out' and relation)
            checkout_msg = {
              userId: relation.app_user_id,
              userName: relation.app_user_name,
              createAt: new Date(),
              params: {
                msg_data: msg_data,
                person: person,
                person_info: person_info
              }
            }
            UserCheckoutEndLog.remove({userId: relation.app_user_id})
            UserCheckoutEndLog.insert(checkout_msg)
            sendUserCheckoutEvent(uuid, relation.app_user_id)
            return 

          send_greeting_msg(msg_data);
          PERSON.updateWorkStatus(person._id)
          if person_info
            PERSON.sendPersonInfoToWeb(person_info)

      )

  @insert_msg2forTest = (id, url, uuid, accuracy, fuzziness)->
    insert_msg2(id, url, uuid, 'face', accuracy, fuzziness, 0, 0)

  update_group_dataset = (group_id,dataset_url,uuid)->
    unless group_id and dataset_url and uuid
      return
    group = SimpleChat.Groups.findOne({_id:group_id})
    user = Meteor.users.findOne({username: uuid})
    if group and user
      announcement = group.announcement;
      unless announcement
        announcement = []
      i = 0
      isExit = false
      while i < announcement.length
        if announcement[i].uuid is uuid
          announcement[i].dataset_url = dataset_url
          isExit = true
          break;
        i++
      unless isExit
        announcementObj = {
          uuid:uuid,
          device_name:user.profile.fullname,
          dataset_url:dataset_url
        };
        announcement.push(announcementObj);
      SimpleChat.Groups.update({_id:group_id},{$set:{announcement:announcement}})


  Router.route('/restapi/workai', {where: 'server'}).get(()->
      id = this.params.query.id
      img_url = this.params.query.img_url
      uuid = this.params.query.uuid
      img_type = this.params.query.type
      tracker_id = this.params.query.tid
      console.log '/restapi/workai get request, id:' + id + ', img_url:' + img_url + ',uuid:' + uuid
      unless id and img_url and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      accuracy = this.params.query.accuracy
      sqlid = this.params.query.sqlid
      style = this.params.query.style
      fuzziness = this.params.query.fuzziness
      img_ts = this.params.query.img_ts
      current_ts = this.params.query.current_ts
      insert_msg2(id, img_url, uuid, img_type, accuracy, fuzziness, sqlid, style,img_ts,current_ts,tracker_id)
      this.response.end('{"result": "ok"}\n')
    ).post(()->
      if this.request.body.hasOwnProperty('id')
        id = this.request.body.id
      if this.request.body.hasOwnProperty('img_url')
        img_url = this.request.body.img_url
      if this.request.body.hasOwnProperty('uuid')
        uuid = this.request.body.uuid
      if this.request.body.hasOwnProperty('type')
        img_type = this.request.body.type
      if this.request.body.hasOwnProperty('sqlid')
        sqlid = this.request.body.sqlid
      else
        sqlid = 0

      if this.request.body.hasOwnProperty('style')
        style = this.request.body.style
      else
        style = 0
      if this.request.body.hasOwnProperty('img_ts')
        img_ts = this.request.body.img_ts
      if this.request.body.hasOwnProperty('current_ts')
        current_ts = this.request.body.current_ts

      if this.request.body.hasOwnProperty('tid')
        tracker_id = this.request.body.tid

      console.log '/restapi/workai post request, id:' + id + ', img_url:' + img_url + ',uuid:' + uuid + ' img_type=' + img_type + ' sqlid=' + sqlid + ' style=' + style + 'img_ts=' + img_ts
      unless id and img_url and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      accuracy = this.params.query.accuracy
      fuzziness = this.params.query.fuzziness
      insert_msg2(id, img_url, uuid, img_type, accuracy, fuzziness, sqlid, style,img_ts,current_ts, tracker_id)
      this.response.end('{"result": "ok"}\n')
    )

  Router.route('/restapi/workai-group-qrcode', {where: 'server'}).get(()->
    group_id = this.params.query.group_id
    console.log '/restapi/workai-group-qrcode get request, group_id: ', group_id
    try
      img = QRImage.image('http://' + server_domain_name + '/simple-chat/to/group?id=' + group_id, {size: 10})
      this.response.writeHead(200, {'Content-Type': 'image/png'})
      img.pipe(this.response)
    catch
      this.response.writeHead(414, {'Content-Type': 'text/html'})
      this.response.end('<h1>414 Request-URI Too Large</h1>')
    )

  device_join_group = (uuid,group_id,name,in_out)->
    device = PERSON.upsetDevice(uuid, group_id,name,in_out)
    user = Meteor.users.findOne({username: uuid})
    if !user
      userId = Accounts.createUser({username: uuid, password: '123456', profile: {fullname: device.name, icon: '/device_icon_192.png'},is_device:true})
      user = Meteor.users.findOne({_id: userId})
    else
      Meteor.users.update({_id:user._id},{$set:{'profile.fullname':device.name}});

    group = SimpleChat.Groups.findOne({_id: group_id})

    #一个设备只允许加入一个群
    groupUsers = SimpleChat.GroupUsers.find({user_id: user._id})
    hasBeenJoined = false
    if groupUsers.count() > 0
      groupUsers.forEach((groupUser)->
        if groupUser.group_id is group_id
          SimpleChat.GroupUsers.update({_id:groupUser._id},{$set:{is_device:true,in_out:in_out,user_name:device.name}});
          hasBeenJoined = true
        else
          _group = SimpleChat.Groups.findOne({_id: groupUser.group_id})
          SimpleChat.GroupUsers.remove(groupUser._id)
          sendMqttMessage('/msg/g/'+ _group._id, {
            _id: new Mongo.ObjectID()._str
            form: {
              id: user._id
              name: if user.profile and user.profile.fullname then user.profile.fullname else user.username
              icon: user.profile.icon
            }
            to: {
              id: _group._id
              name: _group.name
              icon: _group.icon
            }
            images: []
            to_type: "group"
            type: "text"
            text: if user.profile and user.profile.fullname then user.profile.fullname + '[' +user.username + '] 已退出该群!' else '设备 ['+user.username+'] 已退出该群!'
            create_time: new Date()
            is_read: false
          })
      )
    if hasBeenJoined is false
      SimpleChat.GroupUsers.insert({
        group_id: group_id
        group_name: group.name
        group_icon: group.icon
        user_id: user._id
        user_name: if user.profile and user.profile.fullname then user.profile.fullname else user.username
        user_icon: if user.profile and user.profile.icon then user.profile.icon else '/device_icon_192.png'
        create_time: new Date()
        is_device:true
        in_out:in_out
      });
      sendMqttMessage('/msg/g/'+ group_id, {
        _id: new Mongo.ObjectID()._str
        form: {
          id: user._id
          name: if user.profile and user.profile.fullname then user.profile.fullname else user.username
          icon: user.profile.icon
        }
        to: {
          id: group_id
          name: group.name
          icon: group.icon
        }
        images: []
        to_type: "group"
        type: "text"
        text: if user.profile and user.profile.fullname then user.profile.fullname + '[' +user.username + '] 已加入!' else '设备 ['+user.username+'] 已加入!'
        create_time: new Date()
        is_read: false
      })

    Meteor.call 'ai-system-register-devices',group_id,uuid, (err, result)->
      if err or result isnt 'succ'
        return console.log('register devices to AI-system failed ! err=' + err);
      if result == 'succ'
        return console.log('register devices to AI-system succ');
    console.log('user:', user)
    console.log('device:', device)

  Router.route('/restapi/workai-join-group', {where: 'server'}).get(()->
      uuid = this.params.query.uuid
      group_id = this.params.query.group_id
      console.log '/restapi/workai-join-group get request, uuid:' + uuid + ', group_id:' + group_id
      name = this.params.query.name
      in_out = this.params.query.in_out
      unless uuid or group_id or in_out or name
        console.log '/restapi/workai-join-group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      device_join_group(uuid,group_id,name,in_out)
      this.response.end('{"result": "ok"}\n')
    ).post(()->
      if this.request.body.hasOwnProperty('uuid')
        uuid = this.request.body.uuid
      if this.request.body.hasOwnProperty('group_id')
        group_id = this.request.body.group_id
      if this.request.body.hasOwnProperty('name')
        name = this.request.body.name
      if this.request.body.hasOwnProperty('in_out')
        in_out = this.request.body.in_out
      console.log '/restapi/workai-join-group post request, uuid:' + uuid + ', group_id:' + group_id
      unless uuid or group_id or in_out or name
        console.log '/restapi/workai-join-group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      device_join_group(uuid,group_id,name,in_out)
      this.response.end('{"result": "ok"}\n')
    )

  Router.route('/restapi/workai-group-dataset', {where: 'server'}).get(()->
      group_id = this.params.query.group_id
      value = this.params.query.value
      uuid = this.params.query.uuid
      console.log '/restapi/workai-group-dataset get request, group_id:' + group_id + ', value:' + value + ', uuid:' + uuid
      unless value and group_id and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      # insert_msg2(id, img_url, uuid)
      update_group_dataset(group_id,value,uuid)
      this.response.end('{"result": "ok"}\n')
    ).post(()->
      if this.request.body.hasOwnProperty('group_id')
        group_id = this.request.body.id
      if this.request.body.hasOwnProperty('value')
        value = this.request.body.img_url
      if this.request.body.hasOwnProperty('uuid')
        uuid = this.request.body.uuid
      console.log '/restapi/workai-group-dataset get request, group_id:' + group_id + ', value:' + value + ', uuid:' + uuid
      unless value and group_id and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      #insert_msg2(id, img_url, uuid)
      update_group_dataset(group_id,value,uuid)
      this.response.end('{"result": "ok"}\n')
    )

  Router.route('/restapi/workai-getgroupid', {where: 'server'}).get(()->
      uuid = this.params.query.uuid

      console.log '/restapi/workai-getgroupid get request, uuid:' + uuid
      unless uuid
        console.log '/restapi/workai-getgroupid get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      user = Meteor.users.findOne({username: uuid})
      device_group = ''
      if user
        groupUser = SimpleChat.GroupUsers.find({user_id: user._id})
        groupUser.forEach((device)->
          if device.group_id
            device_group += device.group_id
            device_group += ','
        )
      this.response.end(device_group)
    )

  Router.route('/restapi/workai-send2group', {where: 'server'}).get(()->
      uuid = this.params.query.uuid
      group_id = this.params.query.group_id
      msg_type = this.params.query.type
      msg_text = this.params.query.text

      unless uuid or group_id
        console.log '/restapi/workai-send2group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      if (msg_type == 'text' and msg_text)
        user = Meteor.users.findOne({username: uuid})
        unless user
          return this.response.end('{"result": "failed", "cause": "device not registered"}\n')

        userGroup = SimpleChat.GroupUsers.findOne({user_id: user._id, group_id: group_id})
        unless userGroup or userGroup.group_id
          return this.response.end('{"result": "failed", "cause": "group not found"}\n')

        sendMqttMessage('/msg/g/'+ userGroup.group_id, {
          _id: new Mongo.ObjectID()._str
          form: {
            id: user._id
            name: if user.profile and user.profile.fullname then user.profile.fullname + '['+user.username+']' else user.username
            icon: user.profile.icon
          }
          to: {
            id: userGroup.group_id
            name: userGroup.group_name
            icon: userGroup.group_icon
          }
          images: []
          to_type: "group"
          type: "text"
          text: msg_text
          create_time: new Date()
          is_read: false
        })

      this.response.end('{"result": "ok"}\n')
    ).post(()->
      if this.request.body.hasOwnProperty('uuid')
        uuid = this.request.body.uuid
      if this.request.body.hasOwnProperty('group_id')
        group_id = this.request.body.group_id
      if this.request.body.hasOwnProperty('type')
        msg_type = this.request.body.type
      if this.request.body.hasOwnProperty('text')
        msg_text = this.request.body.text

      unless uuid or group_id
        console.log '/restapi/workai-send2group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      if (msg_type == 'text' and msg_text)
        user = Meteor.users.findOne({username: uuid})
        unless user
          return this.response.end('{"result": "failed", "cause": "device not registered"}\n')

        userGroup = SimpleChat.GroupUsers.findOne({user_id: user._id, group_id: group_id})
        unless userGroup or userGroup.group_id
          return this.response.end('{"result": "failed", "cause": "group not found"}\n')

        sendMqttMessage('/msg/g/'+ userGroup.group_id, {
          _id: new Mongo.ObjectID()._str
          form: {
            id: user._id
            name: if user.profile and user.profile.fullname then user.profile.fullname + '['+user.username+']' else user.username
            icon: user.profile.icon
          }
          to: {
            id: userGroup.group_id
            name: userGroup.group_name
            icon: userGroup.group_icon
          }
          images: []
          to_type: "group"
          type: "text"
          text: msg_text
          create_time: new Date()
          is_read: false
        })

      this.response.end('{"result": "ok"}\n')
    )

  Router.route('/restapi/workai-group-template', {where: 'server'}).get(()->
      result = {
        group_templates:[
          {
            "_id" : new Mongo.ObjectID()._str,
            "name": "Work AI工作效能模版",
            "icon": rest_api_url + "/workAIGroupTemplate/efficiency.jpg",
            "img_type": "face"
           },
          {
            "_id" : new Mongo.ObjectID()._str,
            "name": "家庭安全模版",
            "icon": rest_api_url + "/workAIGroupTemplate/safety.jpg",
            "img_type": "object"
           },
          {
            "_id" : new Mongo.ObjectID()._str,
            "name": "NLP情绪分析模版",
            "icon": rest_api_url + "/workAIGroupTemplate/sentiment.jpg"
            },
          {
            "_id" : new Mongo.ObjectID()._str,
            "name": "NLP通用文本分类模版",
            "icon": rest_api_url + "/workAIGroupTemplate/classification.jpg",
            "type":'nlp_classify'
          },
          {
            "_id" : new Mongo.ObjectID()._str,
            "name": "ChatBot训练模版",
            "icon": rest_api_url + "/workAIGroupTemplate/chatBot.jpg"
          }
        ]}
      this.response.end(JSON.stringify(result))
    )

  onNewHotSharePost = (postData)->
    console.log 'onNewHotSharePost:' , postData
    nlp_group = SimpleChat.Groups.findOne({_id:'92bf785ddbe299bac9d1ca82'});
    nlp_user = Meteor.users.findOne({_id: 'xWA3KLXDprNe8Lczw'});
    #nlp_classname = NLP_CLASSIFY.getName()
    nlp_classname = postData.classname
    if nlp_classname
      NLP_CLASSIFY.setName(nlp_group._id,nlp_classname)
    sendMqttMessage('/msg/g/'+ nlp_group._id, {
      _id: new Mongo.ObjectID()._str
      form: {
        id: nlp_user._id
        name: if nlp_user.profile and nlp_user.profile.fullname then nlp_user.profile.fullname + '['+nlp_user.username+']' else nlp_user.username
        icon: nlp_user.profile.icon
      }
      to: {
        id: nlp_group._id
        name: nlp_group.name
        icon: nlp_group.icon
      }
      to_type: "group"
      type: "url"
      text: if !nlp_classname then '1 个链接需要标注' else nlp_className + ':'
      urls:[{
        _id:new Mongo.ObjectID()._str,
        label: nlp_classname,
        #class_id:postData.classid,
        url:postData.posturl,
        title:postData.posttitle,
        thumbData:postData.mainimage,
        description:if postData.description then postData.description else postData.posturl
        }]
      create_time: new Date()
      class_name: nlp_classname
      wait_lable: !nlp_classname
      is_read: false
    })

  Router.route('/restapi/workai-hotshare-newpost', {where: 'server'}).get(()->
    classname = this.params.query.classname
    #username = this.params.query.username
    posttitle = this.params.query.posttitle
    posturl = this.params.query.posturl
    mainimage = this.params.query.mainimage
    description = this.params.query.description

    postData = { classname: classname, posttitle: posttitle, posturl: posturl ,mainimage:mainimage, description:description}
    onNewHotSharePost(postData)
    this.response.end('{"result": "ok"}\n')
  ).post(()->
    if this.request.body.hasOwnProperty('classname')
      classname = this.request.body.classname
    if this.request.body.hasOwnProperty('posttitle')
      posttitle = this.request.body.posttitle
    if this.request.body.hasOwnProperty('posturl')
      posturl = this.request.body.posturl
    if this.request.body.hasOwnProperty('mainimage')
      mainimage = this.request.body.mainimage
    if this.request.body.hasOwnProperty('description')
      description = this.request.body.description

    postData = { classname: classname, posttitle: posttitle, posturl: posturl, mainimage:mainimage, description:description}
    onNewHotSharePost(postData)
    this.response.end('{"result": "ok"}\n')
  )

  Router.route('/restapi/workai-motion-imgs/:id', {where: 'server'}).get(()->
    id = this.params.id
    post = Posts.findOne({_id: id})
    html = Assets.getText('workai-motion-imgs.html');
    imgs = ''
    post.docSource.imgs.forEach (img)->
      imgs += '<li><img src="'+img+'" /></li>'
    html = html.replace('{{imgs}}', imgs)

    this.response.end(html)
  )
  Router.route('/restapi/workai-motion', {where: 'server'}).post(()->
    payload = this.request.body || {}
    deviceUser = Meteor.users.findOne({username: payload.uuid})|| {}
    groupUser = SimpleChat.GroupUsers.findOne({user_id: deviceUser._id}) || {} # 一个平板只对应一个聊天群
    group = SimpleChat.Groups.findOne({_id: groupUser.group_id})

    if (!group)
      return this.response.end('{"result": "error"}\n')
    if (payload.motion_gif)
      imgs = [payload.motion_gif]
    # if (payload.imgs)
    #   imgs = payload.imgs
    if (!imgs or imgs.length <= 0)
      return this.response.end('{"result": "error"}\n')
    if (imgs.length > 10)
        imgs = imgs.slice(0, 9)
    deferSetImmediate ()->
      # update follow
      SimpleChat.GroupUsers.find({group_id: group._id}).forEach (item)->
        if (Follower.find({userId: item.user_id, followerId: deviceUser._id}).count() <= 0)
          console.log('insert follower:', item.user_id)
          Follower.insert({
            userId: item.user_id
            followerId: deviceUser._id
            createAt: new Date()
          })
      #一个设备一天的动作只放在一个帖子里
      devicePost = Posts.findOne({owner:deviceUser._id})
      isTodayPost = false;
      if(devicePost)
        today = new Date().toDateString()
        isTodayPost = if devicePost.createdAt.toDateString() is today then true else false;
      console.log 'isTodayPost:'+isTodayPost
      name = PERSON.getName(payload.uuid, group._id, payload.id)
      postId = if isTodayPost then devicePost._id else new Mongo.ObjectID()._str
      deviceName = if deviceUser.profile and deviceUser.profile.fullname then deviceUser.profile.fullname else deviceUser.username
      title = if name then "摄像头看到#{name} 在#{deviceName}" else (if payload.type is 'face' then "摄像头看到有人在#{deviceName}" else "摄像头看到#{deviceName}有动静")
      time = '时间：' + new Date().toString()
      post = {
        pub: if isTodayPost then devicePost.pub else []
        title: title
        addontitle: time
        browse: 0
        heart: []
        retweet: []
        comment: []
        commentsCount: 0
        mainImage: if payload.motion_gif then payload.motion_gif else payload.img_url
        publish: true
        owner: deviceUser._id
        ownerName: deviceName
        ownerIcon: if deviceUser.profile and deviceUser.profile.icon then deviceUser.profile.icon else '/userPicture.png'
        createdAt: new Date # new Date(payload.ts)
        isReview: true
        insertHook: true
        import_status: 'done'
        fromUrl: ''
        docType: 'motion'
        docSource: payload
      }
      newPub = []
      # newPub.push({
      #   _id: new Mongo.ObjectID()._str
      #   type: 'text'
      #   isImage: false
      #   owner: deviceUser._id
      #   text: "类　型：#{if payload.type is 'face' then '人' else '对像'}\n准确度：#{payload.accuracy}\n模糊度：#{payload.fuzziness}\n设　备：#{deviceName}\n动　作：#{payload.mid}\n"
      #   style: ''
      #   data_row: 1
      #   data_col: 1
      #   data_sizex: 6
      #   data_sizey: 1
      #   data_wait_init: true
      # })
      # newPub.push({
      #   _id: new Mongo.ObjectID()._str
      #   type: 'text'
      #   isImage: false
      #   owner: deviceUser._id
      #   text: '以下为设备的截图：'
      #   style: ''
      #   data_row: 2
      #   data_col: 1
      #   data_sizex: 6
      #   data_sizey: 1
      #   data_wait_init: true
      # })

      data_row = 3
      imgs.forEach (img)->
        newPub.push({
          _id: new Mongo.ObjectID()._str
          type: 'image'
          isImage: true
          # inIframe: true
          owner: deviceUser._id
          # text: '您当前程序不支持视频观看',
          # iframe: '<iframe height="100%" width="100%" src="'+rest_api_url+'/restapi/workai-motion-imgs/'+postId+'" frameborder="0" allowfullscreen></iframe>'
          imgUrl: img,
          data_row: data_row
          data_col: 1
          data_sizex: 6
          data_sizey: 5
          data_wait_init: true
        })
        data_row += 5
      newPub.push({
        _id: new Mongo.ObjectID()._str
        type: 'text'
        isImage: false
        owner: deviceUser._id
        text: time
        style: ''
        data_row: 1
        data_col: 1
        data_sizex: 6
        data_sizey: 1
        data_wait_init: true
        isTime:true
      })
      newPub.push({
        _id: new Mongo.ObjectID()._str
        type: 'text'
        isImage: false
        owner: deviceUser._id
        text: title
        style: ''
        data_row: 1
        data_col: 1
        data_sizex: 6
        data_sizey: 1
        data_wait_init: true
      })
      Array.prototype.push.apply(newPub, post.pub)
      post.pub = newPub
      # formatPostPub(post.pub)
      if isTodayPost
        console.log('update motion post:', postId)
        Posts.update({_id:postId},{$set:post})
        globalPostsUpdateHookDeferHandle(post.owner, postId,null,{$set:post})
        return;
      post._id = postId
      globalPostsInsertHookDeferHandle(post.owner, post._id)
      Posts.insert(post)
      console.log('insert motion post:', post._id)
    this.response.end('{"result": "ok"}\n')
  )
  Router.route('/restapi/date', (req, res, next)->
    headers = {
      'Content-type':'text/html;charest=utf-8',
      'Date': Date.now()
    }
    this.response.writeHead(200, headers)
    this.response.end(Date.now().toString())
  , {where: 'server'})
  Router.route('/restapi/allgroupsid/:token/:skip/:limit', {where: 'server'}).get(()->
      token = this.params.token
      limit = this.params.limit
      skip  = this.params.skip

      headers = {
        'Content-type':'text/html;charest=utf-8',
        'Date': Date.now()
      }
      this.response.writeHead(200, headers)
      console.log '/restapi/allgroupsid get request, token:' + token + ' limit:' + limit + ' skip:' + skip

      allgroups = []
      groups = SimpleChat.Groups.find({}, {fields:{"_id": 1, "name": 1}, limit: parseInt(limit), skip: parseInt(skip)})
      unless groups
        return this.response.end('[]\n')
      groups.forEach((group)->
        allgroups.push({'id':group._id, 'name': group.name})
      )

      this.response.end(JSON.stringify(allgroups))
    )
  Router.route('/restapi/groupusers/:token/:groupid/:skip/:limit', {where: 'server'}).get(()->
      token = this.params.token
      limit = this.params.limit
      skip  = this.params.skip
      groupid = this.params.groupid

      headers = {
        'Content-type':'text/html;charest=utf-8',
        'Date': Date.now()
      }
      this.response.writeHead(200, headers)
      console.log '/restapi/groupusers get request, token:' + token + ' limit:' + limit + ' skip:' + skip + ' groupid:' + groupid

      group = SimpleChat.Groups.findOne({'_id': groupid})
      unless group
        console.log 'no group found:' + groupid
        return this.response.end('[]\n')

      #groupDevices = Devices.find({'groupId': groupid}).fetch()
      #console.log 'no group found:' + groupDevices

      allUsers = []
      userGroups = SimpleChat.GroupUsers.find({group_id: groupid}, {fields:{"user_id": 1, "user_name": 1}, limit: parseInt(limit), skip: parseInt(skip)})
      unless userGroups
        return this.response.end('[]\n')
      userGroups.forEach((userGroup)->
        #if _.pluck(groupDevices, 'uuid').indexOf(userGroup.user_id) is -1
        allUsers.push({'user_id':userGroup.user_id, 'user_name': userGroup.user_name})
      )

      this.response.end(JSON.stringify(allUsers))
    )
  Router.route('/restapi/activity/:token/:direction/:groupid/:ts/:skip/:limit', {where: 'server'}).get(()->
      token = this.params.token
      groupid = this.params.groupid
      limit = this.params.limit
      skip  = this.params.skip
      direction = this.params.direction
      starttime = this.params.ts

      headers = {
        'Content-type':'text/html;charest=utf-8',
        'Date': Date.now()
      }
      this.response.writeHead(200, headers)
      console.log '/restapi/user get request, token:' + token + ' limit:' + limit + ' skip:' + skip + ' groupid:' + groupid + ' Direction:' + direction + ' starttime:' + starttime

      group = SimpleChat.Groups.findOne({'_id': groupid})
      unless group
        console.log 'no group found:' + groupid
        return this.response.end('[]\n')

      allActivity = []
      #Activity.id is id of person name
      groupActivity = Activity.find(
       {'group_id': groupid, 'ts': {$gt: parseInt(starttime)}, 'in_out': direction}
       {fields:{'id': 1, 'name': 1, 'ts': 1, 'in_out': 1, 'img_url':1}, limit: parseInt(limit), skip: parseInt(skip)}
      )
      unless groupActivity
        return this.response.end('[]\n')
      groupActivity.forEach((activity)->
        allActivity.push({'user_id': activity.id, 'user_name': activity.name, 'in_out': activity.in_out, 'img_url': activity.img_url})
      )

      this.response.end(JSON.stringify(allActivity))
    )

  Router.route('/restapi/active/:active/:token/:direction/:skip/:limit', {where: 'server'}).get(()->
      token = this.params.token         #
      limit = this.params.limit         #
      skip  = this.params.skip          #
      direction = this.params.direction #'in'/'out'
      active = this.params.active       #'active'/'notactive'

      headers = {
        'Content-type':'text/html;charest=utf-8',
        'Date': Date.now()
      }
      this.response.writeHead(200, headers)
      console.log '/restapi/:active get request, token:' + token + ' limit:' + limit + ' skip:' + skip + ' Direction:' + direction + ' active:' + active

      allnotActivity = []
      daytime = new Date()
      daytime.setSeconds(0)
      daytime.setMinutes(0)
      daytime.setHours(0)
      daytime = new Date(daytime).getTime()

      notActivity = WorkAIUserRelations.find({}, {limit: parseInt(limit), skip: parseInt(skip)})
      unless notActivity
        return this.response.end('[]\n')
      notActivity.forEach((item)->
        #console.log(item)
        if !item.checkin_time
          item.checkin_time = 0
        if !item.ai_in_time
          item.ai_in_time= 0
        if !item.checkout_time
          item.checkout_time = 0
        if !item.ai_out_time
          item.ai_out_time = 0

        if active is 'notactive'
          if direction is 'in' and item.checkin_time < daytime and item.ai_in_time < daytime
            allnotActivity.push({
              'app_user_id': item.app_user_id
              'app_user_name': item.app_user_name
              'uuid': item.in_uuid
              'groupid': item.group_id
              'msgid': new Mongo.ObjectID()._str
            })
          else if direction is 'out' and item.checkout_time < daytime and item.ai_out_time < daytime
            allnotActivity.push({
              'app_user_id': item.app_user_id
              'app_user_name': item.app_user_name
              'uuid': item.out_uuid
              'groupid': item.group_id
              'msgid': new Mongo.ObjectID()._str
            })
        else if active is 'active'
          if direction is 'in' and (item.checkin_time > daytime or item.ai_in_time > daytime)
            allnotActivity.push({
              'app_user_id': item.app_user_id
              'app_user_name': item.app_user_name
              'uuid': item.in_uuid
              'groupid': item.group_id
              'msgid': new Mongo.ObjectID()._str
            })
          else if direction is 'out' and (item.checkout_time > daytime or item.ai_out_time > daytime)
            allnotActivity.push({
              'app_user_id': item.app_user_id
              'app_user_name': item.app_user_name
              'uuid': item.out_uuid
              'groupid': item.group_id
              'msgid': new Mongo.ObjectID()._str
            })
      )

      this.response.end(JSON.stringify(allnotActivity))
    )
  Router.route('/restapi/resetworkstatus/:token', {where: 'server'}).get(()->
      token = this.params.token         #

      headers = {
        'Content-type':'text/html;charest=utf-8',
        'Date': Date.now()
      }
      this.response.writeHead(200, headers)
      console.log '/restapi/resetworkstatus get request'

      date = Date.now();
      mod = 24*60*60*1000;
      date = date - (date % mod)
      nextday = date + mod

      relations = WorkAIUserRelations.find({})
      relations.forEach((fields)->
        if fields && fields.group_id
          #console.log('>>> ' + JSON.stringify(fields))
          workstatus = WorkStatus.findOne({'group_id': fields.group_id, 'date': nextday})
          if !workstatus
            newWorkStatus = {
              "app_user_id" : fields.app_user_id
              "group_id"    : fields.group_id
              "date"        : nextday
              "person_id"   : fields.ai_persons
              "person_name" : fields.person_name
              "status"      : "out"
              "in_status"   : "unknown"
              "out_status"  : "unknown"
              "in_uuid"     : fields.in_uuid
              "out_uuid"    : fields.out_uuid
              "whats_up"    : ""
              "in_time"     : 0
              "out_time"    : 0
            }
            #console.log('>>> new a WorkStatus ' + JSON.stringify(newWorkStatus))
            WorkStatus.insert(newWorkStatus)
      )

      # 计算没有确认下班的数据
      docs = UserCheckoutEndLog.find({}).fetch()
      docs.map (doc)->
        # remove
        UserCheckoutEndLog.remove({_id: doc._id})

        # 状态
        startUTC = Date.UTC(doc.params.msg_data.create_time.getUTCFullYear(), doc.params.msg_data.create_time.getUTCMonth(), doc.params.msg_data.create_time.getUTCDate(), 0, 0, 0, 0)
        endUTC = Date.UTC(doc.params.msg_data.create_time.getUTCFullYear(), doc.params.msg_data.create_time.getUTCMonth(), doc.params.msg_data.create_time.getUTCDate(), 23, 59, 59, 0)
        workstatus = WorkStatus.findOne({'group_id': doc.params.msg_data.group_id, 'date': {$gte: startUTC, $lte: endUTC}})

        # local date
        now = new Date()
        group = SimpleChat.Groups.findOne({_id: doc.params.msg_data.group_id})
        if (group and group.offsetTimeZone)
          now = new Date((now.getTime()+(now.getTimezoneOffset()*60000)) + (3600000*group.offsetTimeZone))
        else
          now = new Date((now.getTime()+(now.getTimezoneOffset()*60000)) + (3600000*8))

        # console.log('===1==', workstatus.status)
        unless (workstatus and workstatus.status is 'out')
          # console.log('===2==', doc.userName, doc.params.msg_data.create_time.getUTCDate(), now.getUTCDate())
          # 当天数据
          if (doc.params.msg_data.create_time.getUTCDate() is now.getUTCDate())
            # console.log('===3==', doc.userName)
            send_greeting_msg(doc.params.msg_data);
            PERSON.updateWorkStatus(doc.params.person._id)
            if (doc.params.person_info)
              PERSON.sendPersonInfoToWeb(doc.params.person_info)
          else
            # TODO:

      this.response.end(JSON.stringify({result: 'ok'}))
    )

 
  # params = {
  #   uuid: 设备UUID,
  #   person_id: id,
  #   video_post: 视频封面图地址,
  #   video_src: 视频播放地址
  #   ts: 时间戳
  #   ts_offset: 时区 (eg : 东八区 是 -8);
  # }
  Router.route('/restapi/timeline/video/', {where: 'server'}).post(()->
    payload = this.request.body || {}
    console.log('/restapi/timeline/video/ request body = ',JSON.stringify(payload))

    if (!payload.uuid or !payload.person_id or !payload.video_post or !payload.video_src or !payload.ts or !payload.ts_offset)
      return this.response.end('{"result": "error", "reson":"参数不全或格式错误！"}\n')

    # step 1. get group_id by uuid
    device = Devices.findOne({uuid: payload.uuid})
    if device and device.groupId
      group_id = device.groupId

    # step 2. get person_name by person_id
    person_name = PERSON.getName(payload.uuid, group_id, payload.person_id)
    if (!person_name)
      person_name = ""
    
    PERSON.updateToDeviceTimeline(payload.uuid,group_id,{
      is_video: true,
      person_id: payload.person_id,
      person_name: person_name,
      video_post: payload.video_post,
      video_src: payload.video_src,
      ts: Number(payload.ts),
      ts_offset: Number(payload.ts_offset)
    })
    
    return this.response.end('{"result": "success"}\n')
  )
