if Meteor.isClient
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id);
      loadingTemplate: 'loadingPost'
      action: ->
        post = Posts.findOne({_id: this.params._id})
        Session.set('postContent',post);
        Session.set("DocumentTitle",post.title + ':' + post.addontitle);
        this.render 'showPosts', {data: post}
        Session.set 'channel','posts/'+this.params._id
    }
if Meteor.isServer
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id);
      loadingTemplate: 'loadingPost'
    }