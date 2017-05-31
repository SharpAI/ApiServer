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

  insert_msg2 = (id, url, uuid, img_type, accuracy, fuzziness)->
    people = People.findOne({id: id, uuid: uuid})
    name = PERSON.getName(uuid,null,id)
    device = PERSON.upsetDevice(uuid)
    Accuracy =  if name then accuracy else false
    Fuzziness = fuzziness

    if !people
      people = {_id: new Mongo.ObjectID()._str, id: id, uuid: uuid,name: name,embed: null,local_url: null,aliyun_url: url}
      People.insert(people)
    else
      People.update({_id: people._id}, {$set: {aliyun_url: url}})

    PeopleHis.insert {id: id,uuid: uuid,name: name, people_id: people._id, embed: null,local_url: null,aliyun_url: url}, (err, _id)->
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
        name = PERSON.getName(uuid,userGroup.group_id,id)
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
          images: [
            {_id: new Mongo.ObjectID()._str, id: id, people_his_id: _id, url: url, label: name, img_type: img_type, accuracy: Accuracy, fuzziness: Fuzziness} # 暂一次只能发一张图
          ]
          to_type: "group"
          type: "text"
          text: if !name then '1 张照片需要标注' else name + ':'
          create_time: new Date()
          people_id: id
          people_uuid: uuid
          people_his_id: _id
          wait_lable: !name
          is_people: true
          is_read: false
        })
      )

  @insert_msg2forTest = (id, url, uuid, accuracy, fuzziness)->
    insert_msg2(id, url, uuid, 'face', accuracy, fuzziness)

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
      console.log '/restapi/workai get request, id:' + id + ', img_url:' + img_url + ',uuid:' + uuid
      unless id and img_url and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      accuracy = this.params.query.accuracy
      fuzziness = this.params.query.fuzziness
      insert_msg2(id, img_url, uuid, img_type, accuracy, fuzziness)
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
      console.log '/restapi/workai post request, id:' + id + ', img_url:' + img_url + ',uuid:' + uuid + ' img_type=' + img_type
      unless id and img_url and uuid
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')
      accuracy = this.params.query.accuracy
      fuzziness = this.params.query.fuzziness
      insert_msg2(id, img_url, uuid, img_type, accuracy, fuzziness)
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

  device_join_group = (uuid,group_id)->
    device = PERSON.upsetDevice(uuid)
    user = Meteor.users.findOne({username: uuid})
    if !user
      userId = Accounts.createUser({username: uuid, password: '123456', profile: {fullname: device.name, icon: '/device_icon_192.png'}})
      user = Meteor.users.findOne({_id: userId})
    group = SimpleChat.Groups.findOne({_id: group_id})
    #一个设备只允许加入一个群
    groupUsers = SimpleChat.GroupUsers.find({user_id: user._id})
    hasBeenJoined = false
    if groupUsers.count() > 0
      groupUsers.forEach((groupUser)->
        if groupUser.group_id is group_id
          hasBeenJoined = true
        else
          _group = SimpleChat.Groups.findOne({_id: groupUser.group_id})
          SimpleChat.GroupUsers.remove(groupUser._id)
          sendMqttMessage('/msg/g/'+ _group._id, {
            _id: new Mongo.ObjectID()._str
            form: {
              id: user._id
              name: user.username
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
            text: '设备 ['+user.username+'] 已退出该群!'
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
      });
      sendMqttMessage('/msg/g/'+ group_id, {
        _id: new Mongo.ObjectID()._str
        form: {
          id: user._id
          name: user.username
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
        text: '设备 ['+user.username+'] 已加入!'
        create_time: new Date()
        is_read: false
      })
    console.log('user:', user)
    console.log('device:', device)

  Router.route('/restapi/workai-join-group', {where: 'server'}).get(()->
      uuid = this.params.query.uuid
      group_id = this.params.query.group_id
      console.log '/restapi/workai-join-group get request, uuid:' + uuid + ', group_id:' + group_id
      unless uuid or group_id
        console.log '/restapi/workai-join-group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      device_join_group(uuid,group_id)
      this.response.end('{"result": "ok"}\n')
    ).post(()->
      if this.request.body.hasOwnProperty('uuid')
        uuid = this.request.body.uuid
      if this.request.body.hasOwnProperty('group_id')
        group_id = this.request.body.group_id
      console.log '/restapi/workai-join-group post request, uuid:' + uuid + ', group_id:' + group_id
      unless uuid or group_id
        console.log '/restapi/workai-join-group get unless resturn'
        return this.response.end('{"result": "failed", "cause": "invalid params"}\n')

      device_join_group(uuid,group_id)
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

  upset_workai_motion = (msg, pub, groupId, userId)->
    name = PERSON.getName(mgs.uuid, groupId, msg.id)
    pub.unshift({
      _id: new Mongo.ObjectID()._str
      type: 'text'
      isImage: false
      owner: userId
      text: new Date().format('yyyy-MM-dd hh:mm') + ': ' + (if name then '发现『'+name+'』' else '有新的未知信息') + '，详情：http://workaihost.tiegushi.com/motion/' + msg.id
      style: ''
      layout: {font: 'quota'}
      data_row: 1
      data_col: 1
      data_sizex: 6
      data_sizey: 3
      msgObj: msg
    })
    pub.unshift({
      _id: new Mongo.ObjectID()._str
      type: 'image'
      isImage: true
      owner: userId
      imgUrl: msg.img_url
      data_row: 1
      data_col: 1
      data_sizex: 6
      data_sizey: 3
      msgObj: msg
    })
  Router.route('/restapi/workai-motion', {where: 'server'}).post(()->
    payload = this.request.body || {}
    deviceUser = Meteor.users.findOne({username: payload.uuid})|| {}
    groupUser = SimpleChat.GroupUsers.findOne({user_id: deviceUser._id}) || {} # 一个平板只对应一个聊天群
    group = SimpleChat.Groups.findOne({_id: groupUser.group_id})

    if (!group)
      return this.response.end('{"result": "error"}\n')
    deferSetImmediate ()->
      # update follow
      SimpleChat.GroupUsers.find({group_id: group._id}).forEach (item)->
        if (Follower.find({userId: item.user_id, followerId: deviceUser._id}).count() <= 0)
          Follower.insert({
            userId: item.user_id
            followerId: deviceUser._id
            createAt: new Date()
          })

      # update post object
      post = Posts.findOne({owner: deviceUser._id, docType: 'motion'})
      if (!post)
        title: group.name
        addontitle: '训练消息'
        browse: 0
        heart: []
        retweet: []
        comment: []
        commentsCount: 0
        mainImage: 'http://data.tiegushi.com/ocmainimages/mainimage1.jpg'
        publish: true
        owner: deviceUser._id
        ownerName: if deviceUser.profile and deviceUser.profile.fullname then deviceUser.profile.fullname else deviceUser.username
        ownerIcon: if deviceUser.profile and deviceUser.profile.icon then deviceUser.profile.icon else '/userPicture.png'
        createdAt: new Date()
        isReview: true
        insertHook: true
        import_status: 'done'
        fromUrl: ''
        docType: 'motion'

      # set post collection
      upset_workai_motion(payload, post.pub, group._id, deviceUser._id)
      formatPostPub(post.pub)
      if (!post._id)
        post._id = new Mongo.ObjectID()._str
        postsInsertHookDeferHandle(post.owner, post)
        Posts.insert(post)
      else
        FollowPosts.update({postId: post._id}, {$set: {createdAt: new Date()}})
        Posts.update({_id: post._id}, {$set: {pub: post.pub}})
      console.log('upsert motion post:', post._id)
    this.response.end('{"result": "ok"}\n')
