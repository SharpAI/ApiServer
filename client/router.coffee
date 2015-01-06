if Meteor.isClient
  Meteor.startup ()->
    Router.route '/',()->
      this.render 'home'
      Session.set 'channel','home'
    Router.route '/search',()->
      this.render 'search'
      Session.set 'channel','search'
    Router.route '/bell',()->
      this.render 'bell'
      Session.set 'channel','bell'
    Router.route '/user',()->
      this.render 'user'
      Session.set 'channel','user'
    Router.route '/add',()->
      this.render 'addPost'
      Session.set 'channel','addPost'
    Router.route '/posts/:_id', ()->
      post = Posts.findOne({_id: this.params._id})
      this.render 'showPosts', {data: post}