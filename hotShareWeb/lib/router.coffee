if Meteor.isClient
  Router.route '/redirect/:_id',()->
    Session.set('nextPostID',this.params._id)
    this.render 'redirect'
    return
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id)
      action: ->
        post = Posts.findOne({_id: this.params._id})
        Session.set("refComment",[''])
        Meteor.subscribe "refcomments",()->
          Meteor.setTimeout ()->
            refComment = RefComments.find()
            if refComment.count() > 0
              Session.set("refComment",refComment.fetch())
          ,2000
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

        this.render 'showPosts', {data: post}
        Session.set 'channel','posts/'+this.params._id
      fastRender: true
    }
  Router.route '/',()->
    this.render 'webHome'
    return
if Meteor.isServer
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id)
      fastRender: true
    }
