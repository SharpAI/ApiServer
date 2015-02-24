if Meteor.isClient
  Router.route '/posts/:_id', {
      waitOn: ->
        Meteor.subscribe("publicPosts",this.params._id);
      action: ->
        post = Posts.findOne({_id: this.params._id})
        Session.set('postContent',post);
        Session.set("DocumentTitle",post.title + ':' + post.addontitle);
        favicon = document.createElement('link');
        favicon.id = 'icon';
        favicon.rel = 'icon';
        favicon.href = post.mainImage;
        document.head.appendChild(favicon);

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
        Meteor.subscribe("publicPosts",this.params._id);
        Meteor.subscribe("refcomments");
      fastRender: true
    }
