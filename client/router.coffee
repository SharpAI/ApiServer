if Meteor.isClient
  Meteor.startup ()->
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
      return
    Router.route '/search',()->
      if Meteor.isCordova is true
        this.render 'search'
        Session.set 'channel','search'
      return
    Router.route '/bell',()->
      if Meteor.isCordova is true
        this.render 'bell'
        Session.set 'channel','bell'
      return
    Router.route '/user',()->
      if Meteor.isCordova is true
        this.render 'user'
        Session.set 'channel','user'
        return
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
    Router.route '/posts/:_id', {
        waitOn: ->
          Meteor.subscribe("publicPosts",this.params._id);
        loadingTemplate: 'loadingPost'
        action: ->
          post = Posts.findOne({_id: this.params._id})
          Session.set('postContent',post);
          Session.set("DocumentTitle",post.title + ':' + post.addontitle);
          this.render 'showPosts', {data: post}
      }
    Router.route '/allDrafts',()->
      if Meteor.isCordova is true
        this.render 'allDrafts'
        Session.set 'channel','allDrafts'
        return
    Router.route '/myPosts',()->
      if Meteor.isCordova is true
        this.render 'myPosts'
        Session.set 'channel','myPosts'
        return
    Router.route '/my_email',()->
      if Meteor.isCordova is true
        this.render 'my_email'
        Session.set 'channel','my_email'
        return
    Router.route '/topicPosts',()->
      if Meteor.isCordova is true
        this.render 'topicPosts'
        Session.set 'channel','topicPosts'
        return
