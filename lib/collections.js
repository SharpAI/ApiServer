Posts = new Meteor.Collection('posts');
FollowPosts = new Meteor.Collection('followposts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection(null);
SavedDrafts = new Meteor.Collection('saveddrafts');
Follows = new Meteor.Collection('follows');
Follower = new Meteor.Collection('follower');
Topics = new Meteor.Collection('topics');
TopicPosts = new Meteor.Collection('topicposs');

if(Meteor.isServer){
  Meteor.publish("topicposts", function(id) {
        return TopicPosts.find({topicId: id});
  });
  Meteor.publish("topics", function() {
        return Topics.find({});
  });
  Meteor.publish("posts", function() {
        return Posts.find({owner: this.userId});
  });
  Meteor.publish("followposts", function() {
        return FollowPosts.find({followby: this.userId});
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
        return Feeds.find({owner: this.userId});
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
                        owner:doc.owner,
                        ownerName:doc.ownerName,
                        ownerIcon:doc.ownerIcon,
                        createdAt: doc.createdAt,
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
                owner:doc.owner,
                ownerName:doc.ownerName,
                ownerIcon:doc.ownerIcon,
                createdAt: doc.createdAt,
                followby: userId
            });
        }
        catch(error){}
        Feeds.insert({
          owner:userId,
          eventType:'SelfPosted',
          postId:doc._id,
          postTitle:doc.title,
          mainImage:doc.mainImage,
          createdAt:doc.createdAt,
          heart:0,
          retweet:0,
          comment:0
        });
        return true;
      }
      return false;
    },
    update: function(userId, doc, fieldNames, modifier) {
      if (fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' && modifier.$set !== void 0) {
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
      if (fieldNames.toString() === 'heart' || fieldNames.toString() === 'retweet' && modifier.$inc !== void 0) {
        return true;
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
          var posts=FollowPosts.find({owner:{$ne:userId},followby:userId})
          if(posts.count()>0){
            posts.forEach(function(data){
              FollowPosts.remove({_id:data._id});
            });
          }
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
}

if(Meteor.isClient){
  Meteor.subscribe("topicposts");
  Meteor.subscribe("topics");
  Meteor.subscribe("posts");
  Meteor.subscribe("followposts");
  /*Meteor.subscribe("drafts");*/
  Meteor.subscribe("saveddrafts");
  Meteor.subscribe("feeds");
  Meteor.subscribe("follows");
  Meteor.subscribe("follower");
}
