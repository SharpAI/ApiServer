if Meteor.isClient
  Meteor.startup ()->
    Tracker.autorun ()->
      channel = Session.get 'channel'
      $(window).off('scroll')
      console.log('channel changed to '+channel+' Off Scroll')
      Meteor.setTimeout ->
          Session.set 'focusOn',channel
        ,300
    Tracker.autorun ()->
      if Session.get('channel') isnt 'addPost' and (Session.get('focusOn') is 'addPost')
        console.log('Leaving addPost mode')
        if window.iabHandle
          window.iabHandle.close()
          window.iabHandle = null
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
      return
    Router.route '/splashScreen',()->
      this.render 'splashScreen'
      Session.set 'channel', 'splashScreen'
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
    Router.route '/help',()->
      this.render 'help'
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
          [Meteor.subscribe("publicPosts",this.params._id),
           Meteor.subscribe "pcomments"]
        loadingTemplate: 'loadingPost'
        action: ->
          post = Posts.findOne({_id: this.params._id})
          Session.set('postContent',post)
          if post.addontitle and (post.addontitle isnt '')
            documentTitle = "『故事贴』" + post.title + "：" + post.addontitle
          else
            documentTitle = "『故事贴』" + post.title
          Session.set("DocumentTitle",documentTitle)
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
    }
