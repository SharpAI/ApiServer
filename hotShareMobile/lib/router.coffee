if Meteor.isClient
  Meteor.startup ()->
    Tracker.autorun ()->
      channel = Session.get 'channel'
      Meteor.setTimeout ->
          Session.set 'focusOn',channel
        ,300
    Router.route(
      '/'
      {
        template: 'home'
        subscriptions: ()->
          this.subscribe("posts").wait()
        action: ()->
          this.render()
          Session.set('channel', 'home')
      }
    )
    Router.route(
      '/search'
      {
        template: 'search'
        subscriptions: ()->
          this.subscribe("topics").wait()
        action: ()->
          this.render()
          Session.set('channel', 'search')
      }
    )
    Router.route(
      '/searchFollow'
      {
        template: 'searchFollow'
        subscriptions: ()->
          this.subscribe("follows").wait()
          this.subscribe("follower").wait()
        action: ()->
          this.render()
          Session.set('channel', 'searchFollow')
      }
    )
    Router.route '/searchPeopleAndTopic',()->
      if Meteor.isCordova is true
        this.render 'searchPeopleAndTopic'
        Session.set 'channel','searchPeopleAndTopic'
      return
    Router.route '/cropImage',()->
      this.render 'cropImage'
      return
    Router.route '/bell',()->
      if Meteor.isCordova is true
        this.render 'bell'
        Session.set 'channel','bell'
      return
    Router.route(
      '/user'
      {
        template: 'user'
        subscriptions: ()->
          this.subscribe("saveddrafts").wait()
          this.subscribe("posts").wait()
        action: ()->
          if Meteor.isCordova is true
            this.render()
            Session.set('channel', 'user')
      }
    )
    Router.route '/dashboard',()->
      if Meteor.isCordova is true
        this.render 'dashboard'
        return
    Router.route '/followers',()->
      if Meteor.isCordova is true
        this.render 'followers'
        return
    Router.route '/add',()->
      if Meteor.isCordova is true
        this.render 'addPost'
        Session.set 'channel','addPost'
        return
    Router.route '/registerFollow',()->
      if Meteor.isCordova is true
        this.render 'registerFollow'
        Session.set 'channel','registerFollow'
        return
    Router.route '/authOverlay',()->
      if Meteor.isCordova is true
        this.render 'authOverlay'
        Session.set 'channel','authOverlay'
        return
      else
        this.render 'webHome'
        return
    Router.route '/webHome',()->
      this.render 'webHome'
      return
    Router.route '/progressBar',()->
      if Meteor.isCordova is true
        this.render 'progressBar'
        Session.set 'channel','progressBar'
        return
    Router.route '/redirect/:_id',()->
      Session.set('nextPostID',this.params._id)
      this.render 'redirect'
      return
    Router.route '/posts/:_id', {
        waitOn: ->
          Meteor.subscribe("publicPosts",this.params._id)
        loadingTemplate: 'loadingPost'
        action: ->
          post = Posts.findOne({_id: this.params._id})
          Session.set("refComment",[''])
          Meteor.subscribe "refcomments", ()->
            Meteor.setTimeout ()->
              refComment = RefComments.find()
              if refComment.count() > 0
                Session.set("refComment",refComment.fetch())
            ,2000
          Session.set('postContent',post)
          if post.addontitle and (post.addontitle isnt '')
            documentTitle = post.title + "：" + post.addontitle
          else
            documentTitle = post.title
          Session.set("DocumentTitle",documentTitle)
          this.render 'showPosts', {data: post}
          Session.set 'channel','posts/'+this.params._id
      }
    Router.route(
      '/allDrafts'
      {
        template: 'allDrafts'
        subscriptions: ()->
          this.subscribe("saveddrafts").wait()
        action: ()->
          if Meteor.isCordova is true
            this.render()
            Session.set('channel', 'allDrafts')
      }
    )
    Router.route(
      '/myPosts'
      {
        template: 'myPosts'
        subscriptions: ()->
          this.subscribe("posts").wait()
        action: ()->
          if Meteor.isCordova is true
            this.render()
            Session.set('channel', 'myPosts')
      }
    )
    Router.route '/my_email',()->
      if Meteor.isCordova is true
        this.render 'my_email'
        Session.set 'channel','my_email'
        return
    Router.route '/my_password',()->
      if Meteor.isCordova is true
        this.render 'my_password'
        Session.set 'channel','my_password'
        return
    Router.route '/my_notice',()->
      if Meteor.isCordova is true
        this.render 'my_notice'
        Session.set 'channel','my_notice'
        return
    Router.route '/my_about',()->
      if Meteor.isCordova is true
        this.render 'my_about'
        Session.set 'channel','my_about'
        return
    Router.route '/deal_page',()->
      if Meteor.isCordova is true
        this.render 'deal_page'
        Session.set 'channel','deal_page'
        return
    Router.route '/topicPosts',()->
      if Meteor.isCordova is true
        this.render 'topicPosts'
        Session.set 'channel','topicPosts'
        return
    Router.route '/addTopicComment',()->
      if Meteor.isCordova is true
        this.render 'addTopicComment'
        Session.set 'channel','addTopicComment'
        return
    Router.route '/thanksReport',()->
      if Meteor.isCordova is true
        this.render 'thanksReport'
        Session.set 'channel','thanksReport'
        return
    Router.route '/reportPost',()->
      if Meteor.isCordova is true
        this.render 'reportPost'
        Session.set 'channel','reportPost'
        return
    Router.route '/userProfile',()->
      if Meteor.isCordova is true
        this.render 'userProfile'
        Session.set 'channel','userProfile'
        return
if Meteor.isServer
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id)
    }
