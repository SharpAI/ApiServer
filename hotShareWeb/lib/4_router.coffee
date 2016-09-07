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
      calcPostSignature(window.location.href.split('#')[0])
    ,300
  Router.route '/redirect/:_id',()->
    Session.set('nextPostID',this.params._id)
    this.render 'redirect'
    return
  Router.route '/import', ()->
    this.render 'importPost'
  Router.route '/posts/:_id', {
      waitOn: ->
          [subs.subscribe("publicPosts",this.params._id),
           subs.subscribe "pcomments"]
      loadingTemplate: 'loadingPost'
      action: ->
        post = Posts.findOne({_id: this.params._id})
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
    waitOn: ->
      [Meteor.subscribe("publicPosts",this.params._id),
       Meteor.subscribe "pcomments"]
    loadingTemplate: 'loadingPost'
    action: ->
      if Session.get("doSectionForward") is true
        Session.set("doSectionForward",false)
        Session.set("postPageScrollTop",0)
        document.body.scrollTop = 0
      post = Posts.findOne({_id: this.params._id})
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
if Meteor.isServer
  postFontStyleDefault='font-size:large;';
  postFontStyleNormal='font-size:large;';
  postFontStyleQuota='font-size:15px;background:#F5F5F5;padding-left:3%;padding-right:3%;color:grey;';

  calcTextItemStyle = (layoutObj)->
      fontStyle = postFontStyleDefault
      alignStyle = 'text-align:left;'
      if layoutObj
          if layoutObj.font
              if layoutObj.font is 'normal'
                  fontStyle=postFontStyleNormal
              else if layoutObj.font is 'quota'
                  fontStyle=postFontStyleQuota
          if layoutObj.align
              if layoutObj.align is 'right'
                  alignStyle = "text-align:right;"
              else if layoutObj.align is 'center'
                  alignStyle = "text-align:center;"
          if layoutObj.weight
              alignStyle = "font-weight:"+layoutObj.weight+";"
      fontStyle+alignStyle
  storeStyleInItem = (node,type,value)->
      $(node).attr('hotshare-'+type,value)
  getStyleInItem = (node,type,value)->
      $(node).attr('hotshare-'+type)


  GetTime0 = (dateM)->
      MinMilli = 1000 * 60;         #初始化变量。
      HrMilli = MinMilli * 60;
      DyMilli = HrMilli * 24;
      #计算出相差天数
      days=Math.floor(dateM/(DyMilli));

      #计算出小时数
      leave1=dateM%(DyMilli); #计算天数后剩余的毫秒数
      hours=Math.floor(leave1/(HrMilli));
      #计算相差分钟数
      leave2=leave1%(HrMilli);        #计算小时数后剩余的毫秒数
      minutes=Math.floor(leave2/(MinMilli));
      #计算相差秒数
      leave3=leave2%(MinMilli);      #计算分钟数后剩余的毫秒数
      seconds=Math.round(leave3/1000);
  
      prefix = ""
      if dateM > DyMilli
        prefix = days+"天 前"
      else if dateM > HrMilli
        prefix = hours+"小时 前"
      else if dateM > MinMilli
        prefix = minutes+"分钟 前"
      else if dateM <= MinMilli
        if seconds <= 0
            prefix = "刚刚"
        else
            prefix = seconds+"秒 前"

      return prefix
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

  SSR.compileTemplate('postItem', Assets.getText('static/postItem.html'))
  Template.postItem.helpers
      hasVideoInfo: (videoInfo)->
        if videoInfo
          return true
        else
          false
      myselfClickedUpStyle:->
        userId = null
        if userId and this.likeUserId isnt undefined and this.likeUserId[userId] is true
          return 'fa-thumbs-up'
        else
          return 'fa-thumbs-o-up'
      myselfClickedDownStyle:->
        userId = null
        if userId and this.dislikeUserId isnt undefined and this.dislikeUserId[userId] is true
          return 'fa-thumbs-down'
        else
          return 'fa-thumbs-o-down'
      calcStyle: ()->
        # For backforward compatible. Only older version set style directly
        if this.style and this.style isnt ''
          ''
        else
          calcTextItemStyle(this.layout)
      isTextLength:(text)->
        if(text.trim().length>20)
          return true
        else if  text.split(/\r\n|\r|\n/).length > 1
          return true
        else
          return false
      pcIndex:->
        pcindex = 0
        index = parseInt(this.index)
        if index is pcindex
          'dCurrent'
        else
          ''
      scIndex:->
        scindex = 0
        index = parseInt(this.index)
        if index is scindex
          'sCurrent'
        else
          ''
      plike:->
        if this.likeSum is undefined
          0
        else
          this.likeSum
      pdislike:->
        if this.dislikeSum is undefined
          0
        else
          this.dislikeSum
      getStyle:->
        self=this
        pclength=0
        if self.pcomments
          pclength=self.pcomments.length
        userId=""
        scolor="#F30B44"
        if userId and userId isnt ""
          if self.likeUserId and self.likeUserId[userId] is true
            scolor="#304EF5"
          if scolor is "#F30B44" and self.dislikeUserId and self.dislikeUserId[userId] is true
            scolor="#304EF5"
          if scolor is "#F30B44" and pclength>0
            for icomment in self.pcomments
              if icomment["userId"] is userId
                scolor="#304EF5"
                break
        #if scolor is "#304EF5"
        #  if Session.get("toasted") is false
        #    Session.set "toasted",true
        #    Session.set("needToast",true)
        dislikeSum = 0
        if self.dislikeSum
          dislikeSum=self.dislikeSum
        likeSum=0
        if self.likeSum
          likeSum=self.likeSum
        if dislikeSum + likeSum + pclength is 0
          self.style
        else
          if self.style is undefined or self.style.length is 0
            "color: "+scolor+";"
          else
            self.style.replace("grey",scolor).replace("rgb(128, 128, 128)",scolor).replace("rgb(0, 0, 0)",scolor).replace("#F30B44",scolor)

  SSR.compileTemplate('post', Assets.getText('static/post.html'))
  Template.post.helpers
      getAbstractSentence:->
        console.log('>>> abstractSentenceIndex: ', this.abstractSentenceIndex)
        if this.abstractSentenceIndex isnt undefined
          this.pub[this.abstractSentenceIndex].text
        else
          null  
      time_diff: (created)->
          GetTime0(new Date() - created)
      getPub:->
        self = this
        self.pub = self.pub || []
        if withSponserLinkAds
          position = 1+(self.pub.length / 2)
          self.pub.splice(position,0,{adv:true,type:'insertedLink',data_col:1,data_sizex:6,urlinfo:'http://cdn.tiegushi.com/posts/qwWdWJPMAbyeo8tiJ'})
          _.map self.pub, (doc, index, cursor)->
            if position < index
              _.extend(doc, {index: index-1})
            else
              _.extend(doc, {index: index})
        else
          _.map self.pub, (doc, index, cursor)->
            _.extend(doc, {index: index})

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
            subs.subscribe "pcomments"]
    fastRender: true
  }

  Router.route '/posts/:_id', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    postHtml = SSR.render('post', postItem)
    #postItem = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1}});
    Inject.rawModHtml('addxmlns', (html) ->
      return html.replace(/<html>/, '<html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:fb="http://ogp.me/ns/fb#">');
    )
    Inject.rawHead("inject-image", "<meta property=\"og:image\" content=\"#{postItem.mainImage}\"/>", res);
    Inject.rawHead("inject-description", "<meta property=\"og:description\" content=\"#{postItem.title} #{postItem.addontitle} 故事贴\"/>",res);
    Inject.rawHead("inject-url", "<meta property=\"og:url\" content=\"http://#{server_domain_name}/posts/#{postItem._id}\"/>",res);
    Inject.rawHead("inject-title", "<meta property=\"og:title\" content=\"#{postItem.title} - 故事贴\"/>",res);
    Inject.rawHead("inject-width", "<meta property=\"og:image:width\" content=\"400\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"og:image:height\" content=\"300\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"fb:app_id\" content=\"1759413377637096\" />",res);
    Inject.rawBody("inject-posthtml", postHtml, res);

    injectSignData(req,res)
    next()
  , {where: 'server'}
  Router.route '/posts/:_id/:index', (req, res, next)->
    postItem = Posts.findOne({_id: this.params._id})
    postItem.abstractSentenceIndex = parseInt(this.params.index)
    postHtml = SSR.render('post', postItem)
    #postItem = Posts.findOne({_id: this.params._id},{fields:{title:1,mainImage:1,addontitle:1}});
    Inject.rawModHtml('addxmlns', (html) ->
      return html.replace(/<html>/, '<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">');
    )
    Inject.rawHead("inject-image", "<meta property=\"og:image\" content=\"#{postItem.mainImage}\"/>", res);
    Inject.rawHead("inject-description", "<meta property=\"og:description\" content=\"#{postItem.title} #{postItem.addontitle} 故事贴\"/>",res);
    Inject.rawHead("inject-url", "<meta property=\"og:url\" content=\"http://#{server_domain_name}/posts/#{postItem._id}\"/>",res);
    Inject.rawHead("inject-title", "<meta property=\"og:title\" content=\"#{postItem.title} - 故事贴\"/>",res);
    Inject.rawHead("inject-width", "<meta property=\"og:image:width\" content=\"400\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"og:image:height\" content=\"300\" />",res);
    Inject.rawHead("inject-height", "<meta property=\"fb:app_id\" content=\"1759413377637096\" />",res);
    Inject.rawBody("inject-posthtml", postHtml, res);
    
    injectSignData(req,res)
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
    self = this
    failPage = ()->
      res.writeHead(404, {
        'Content-Type': 'text/html'
      })
      res.end("restapi failed! _userId="+self.params._userId+", _postId="+self.params._postId)
    sucPage = ()->
      res.writeHead(200, {
        'Content-Type': 'text/html'
      })
      res.end("restapi suc! _userId="+self.params._userId+", _postId="+self.params._postId)
    if this.params._userId is undefined or this.params._userId is null or this.params._postId is undefined or this.params._postId is null
      console.log("restapi/postInsertHook: Send fail page.");
      failPage()
      return
    globalPostsInsertHookDeferHandle(this.params._userId, this.params._postId)
    console.log("restapi/postInsertHook: Send suc page.");
    sucPage()
    return
  , {where: 'server'})



