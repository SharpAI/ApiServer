if Meteor.isClient
  Meteor.startup ()->
    Tracker.autorun ()->
      channel = Session.get 'channel'
      Meteor.setTimeout ->
          Session.set 'focusOn',channel
        ,300
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
      return
    Router.route '/search',()->
      if Meteor.isCordova is true
        this.render 'search'
        Session.set 'channel','search'
      return
    Router.route '/searchFollow',()->
      if Meteor.isCordova is true
        this.render 'searchFollow'
        Session.set 'channel','searchFollow'
      return
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
    Router.route '/progressBar',()->
      if Meteor.isCordova is true
        this.render 'progressBar'
        Session.set 'channel','progressBar'
        return
    Router.route '/posts/:_id', {
        waitOn: ->
          Meteor.subscribe("publicPosts",this.params._id);
          Meteor.subscribe("refcomments");
        loadingTemplate: 'loadingPost'
        action: ->
          post = Posts.findOne({_id: this.params._id})
          Session.set('postContent',post);
          Session.set("DocumentTitle",post.title + ':' + post.addontitle);
          this.render 'showPosts', {data: post}
          Session.set 'channel','posts/'+this.params._id
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
    Router.route '/my_password',()->
      if Meteor.isCordova is true
        this.render 'my_password'
        Session.set 'channel','my_password'
        return
    Router.route '/my_about',()->
      if Meteor.isCordova is true
        this.render 'my_about'
        Session.set 'channel','my_about'
        return
    Router.route '/topicPosts',()->
      if Meteor.isCordova is true
        this.render 'topicPosts'
        Session.set 'channel','topicPosts'
        return
   Router.route '/addTopicComment',()->
     this.render 'addTopicComment'
     Session.set 'channel','addTopicComment'
     return
if Meteor.isServer
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id);
        Meteor.subscribe("refcomments");
    }
