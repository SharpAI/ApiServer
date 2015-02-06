Posts = new Meteor.Collection('posts');
FollowPosts = new Meteor.Collection('followposts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection(null);
SavedDrafts = new Meteor.Collection('saveddrafts');
Follows = new Meteor.Collection('follows');
Follower = new Meteor.Collection('follower');
Topics = new Meteor.Collection('topics');
TopicPosts = new Meteor.Collection('topicposs');
Comment = new Meteor.Collection('comment');

if(Meteor.isServer){
  Meteor.publish("topicposts", function() {
        return TopicPosts.find({});
  });
  Meteor.publish("topics", function() {
        return Topics.find({});
  });
  Meteor.publish("posts", function() {
        return Posts.find({owner: this.userId});
  });
  Meteor.publish("followposts", function(limit) {
        return FollowPosts.find({followby: this.userId}, {sort: {createdAt: -1}, limit:limit});
  });
  Meteor.publish("publicPosts", function(postId) {
        return Posts.find({_id: postId});
  });
  /*Meteor.publish("drafts", function() {
        return Drafts.find({owner: this.userId});
  });*/
  Meteor.publish("saveddrafts", function() {
        return SavedDrafts.find({owner: this.userId});
  });
  Meteor.publish("feeds", function() {
        return Feeds.find({followby: this.userId});
  });
  Meteor.publish("follows", function() {
        return Follows.find({});
  });
  Meteor.publish("follower", function() {
        return Follower.find({$or:[{userId:this.userId},{followerId:this.userId}]});
  });
  Meteor.publish("userinfo", function(id) {
        return Meteor.users.find({_id: id},{fields: {'username':1,'email':1,'profile.fullname':1,'profile.icon':1, 'profile.dec':1}});
  });
  Meteor.publish("comment", function(postId) {
        return Comment.find({postId: postId});
  });
  Posts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId){
        try{
            var follows=Follower.find({followerId:userId})
            if(follows.count()>0){
                follows.forEach(function(data){
                    FollowPosts.insert({
                        postId:doc._id,
                        title:doc.title,
                        addontitle:doc.addontitle,
                        mainImage: doc.mainImage,
                        heart:0,
                        retweet:0,
                        comment:0,
                        browse:0,
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        createdAt: doc.createdAt,
                        followby: data.userId
                    });

                    Feeds.insert({
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        eventType:'SelfPosted',
                        postId:doc._id,
                        postTitle:doc.title,
                        mainImage:doc.mainImage,
                        createdAt:doc.createdAt,
                        heart:0,
                        retweet:0,
                        comment:0,
                        followby: data.userId
                    });

                });
            }
            FollowPosts.insert({
                postId:doc._id,
                title:doc.title,
                addontitle:doc.addontitle,
                mainImage: doc.mainImage,
                heart:0,
                retweet:0,
                comment:0,
                browse:0,
                owner:doc.owner,
                ownerName:doc.ownerName,
                ownerIcon:doc.ownerIcon,
                createdAt: doc.createdAt,
                followby: userId
            });
        }
        catch(error){}

        return true;
      }
      return false;
    },
      remove: function (userId, doc) {
          if(doc.owner === userId){
              try{
                  FollowPosts.remove({
                      postId:doc._id
                  });
              }
              catch(error){}
              Feeds.remove({
                  owner:userId,
                  eventType:'SelfPosted',
                  postId:doc._id
              });
              return true;
          }
          return false;
      },
    update: function(userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' && modifier.$set !== void 0) {
        return true;
      }
      if (fieldNames.toString() === 'browse' && modifier.$set !== void 0) {
        try{
            var followPosts=FollowPosts.find({postId:doc._id});
            followPosts.forEach(function(data){
                FollowPosts.update(
                    {postId:doc._id, followby:data.followby},
                    {$set:{
                        browse:modifier.$set.browse
                      }
                    }
                );
            });
        }
        catch(error){}
        return true;
      }

      if(doc.owner === userId){
        try{
            var follows=Follower.find({followerId:userId})
            if(follows.count()>0){
                follows.forEach(function(data){
                    FollowPosts.update(
                        {postId:doc._id, followby:data.userId},
                        {$set:{
                            title:modifier.$set.title,
                            addontitle:modifier.$set.addontitle,
                            mainImage: modifier.$set.mainImage,
                          }
                        }
                    );
                });
            }
            FollowPosts.update(
                {postId:doc._id, followby:userId},
                {$set:{
                    title:modifier.$set.title,
                    addontitle:modifier.$set.addontitle,
                    mainImage: modifier.$set.mainImage,
                  }
                }
            );
        }
        catch(error){}
        return true;
      }
      return false;
    }
  });
  Drafts.allow({
    insert: function (userId, doc) {
      return doc.owner === userId;
    },
    remove: function (userId, doc) {
      return doc.owner === userId;
    },
    update: function (userId, doc) {
      return doc.owner === userId;
    }
  });
  FollowPosts.allow({
    update: function (userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'browse' || fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' || fieldNames.toString() === 'comment' && modifier.$inc !== void 0) {
        return true;
      }
      if(doc.owner === userId){
        return true
      }
      return false;
    }
  });
  SavedDrafts.allow({
    insert: function (userId, doc) {
      return doc.owner === userId;
    },
    remove: function (userId, doc) {
      return doc.owner === userId;
    },
    update: function (userId, doc) {
      return doc.owner === userId;
    }
  });
  Follower.allow({
    insert: function (userId, doc) {
      if(doc.userId === userId){
        try{
            var posts=Posts.find({owner: doc.followerId})
            if(posts.count()>0){
                posts.forEach(function(data){
                    FollowPosts.insert({
                        postId:data._id,
                        title:data.title,
                        addontitle:data.addontitle,
                        mainImage: data.mainImage,
                        owner:data.owner,
                        ownerName:data.ownerName,
                        ownerIcon:data.ownerIcon,
                        createdAt: data.createdAt,
                        followby: userId
                    });
                });
            }
          }
          catch(error){};
        return true;
      }
      return false;
    },
    remove: function (userId, doc) {
      if(doc.userId === userId){
        try{
          FollowPosts.remove({owner:doc.followerId,followby:userId});
        }
        catch(error){};
        return true;
      }
      return false;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Comment.allow({
    insert: function (userId, doc) {
      return doc.userId === userId;
    },
    remove: function (userId, doc) {
      return doc.userId === userId;
    },
    update: function (userId, doc) {
      return doc.userId === userId;
    }
  });
  Meteor.users.allow({
    update: function (userId, doc, fieldNames, modifier) {
      if (doc._id === userId)
        return true;
      return false;
    }
  });

  SearchSource.defineSource('followusers', function(searchText, options) {
    var options = {sort: {createdAt: -1}, limit: 20};

    if(searchText) {
      var regExp = buildRegExp(searchText);
      var selector = {$or: [
        {'username': regExp},
        {'profile.fullname': regExp}
      ]};

      return Meteor.users.find(selector, options).fetch();
    } else {
      return Meteor.users.find({}, options).fetch();
    }
  });

  function buildRegExp(searchText) {
    // this is a dumb implementation
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  }
}

if(Meteor.isClient){
  Meteor.subscribe("topicposts");
  Meteor.subscribe("topics");
  Meteor.subscribe("posts");
  /*Meteor.subscribe("drafts");*/
  Meteor.subscribe("saveddrafts");
  Meteor.subscribe("feeds");
  Meteor.subscribe("follows");
  Meteor.subscribe("follower");
  Tracker.autorun(function () {
    if(Session.get("postContent"))
      Meteor.subscribe("comment",Session.get("postContent")._id);
  });

  var options = {
    keepHistory: 1000 * 60 * 5,
    localSearch: true
  };
  var fields = ['username', 'profile.fullname'];
  FollowUsersSearch = new SearchSource('followusers', fields, options);

  var FOLLOWPOSTS_ITEMS_INCREMENT = 10;
  Session.setDefault('followpostsitemsLimit', FOLLOWPOSTS_ITEMS_INCREMENT);
  Deps.autorun(function() {
    Meteor.subscribe('followposts', Session.get('followpostsitemsLimit'));
  });
}
