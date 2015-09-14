if Meteor.isClient
  SyncPostToClient = (postId)->
    post = Posts.findOne({_id: postId})
    if post
      try
        if ClientPosts.find({_id:postId}).count() is 0
          ClientPosts.insert post
        else
          ClientPosts.update {_id: post._id},{$set:post}
      catch error
        console.log("Insert ClientPosts error!");
  PostRender = (self,postId,reRender)->
    post = ClientPosts.findOne({_id: postId})
    if post
      Session.set('postContent',post)
      if post.addontitle and (post.addontitle isnt '')
        documentTitle = "『故事贴』" + post.title + "：" + post.addontitle
      else
        documentTitle = "『故事贴』" + post.title
      Session.set("DocumentTitle",documentTitle)
      favicon = document.createElement('link')
      favicon.id = 'icon'
      favicon.rel = 'icon'
      favicon.href = post.mainImage
      document.head.appendChild(favicon)
      self.render 'showPosts', {data: post}
      Session.set 'channel','posts/'+postId
    else
      if reRender
        Router.go '/posts/'+postId
      else
        console.log "Cant find the request post"
        this.render 'postNotFound'
        return
  Router.route '/redirect/:_id',()->
    Session.set('nextPostID',this.params._id)
    this.render 'redirect'
    return
  Router.route '/post/:_id', {
      loadingTemplate: 'loadingPost'
      action: ->
        PostRender(this, this.params._id,true)
    }
  Router.route '/posts/:_id', {
      waitOn: ->
          [Meteor.subscribe("publicPosts",this.params._id),
          Meteor.subscribe "pcomments"]
      loadingTemplate: 'loadingPost'
      action: ->
        [SyncPostToClient(this.params._id),
        PostRender(this,this.params._id,false)]
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
if Meteor.isServer
  Router.route '/posts/:_id', {
      waitOn: ->
          [Meteor.subscribe("publicPosts",this.params._id),
          Meteor.subscribe "pcomments"]
      fastRender: true
    }
