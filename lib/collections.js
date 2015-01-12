Posts = new Meteor.Collection('posts');
Feeds = new Meteor.Collection('feeds');
Drafts = new Meteor.Collection('drafts');
Follows = new Meteor.Collection('follows');

if(Meteor.isServer){
  Meteor.publish("posts", function() {
        return Posts.find({owner: this.userId});
  });
  Meteor.publish("publicPosts", function(postId) {
        return Posts.find({_id: postId});
  });
  Meteor.publish("drafts", function() {
        return Drafts.find({owner: this.userId});
  });
  Meteor.publish("feeds", function() {
        return Feeds.find({owner: this.userId});
  });
  Meteor.publish("follows", function() {
        return Follows.find({});
  });
  Posts.allow({
    insert: function (userId, doc) {
      if(doc.owner === userId){
        Feeds.insert({
          owner:userId,
          eventType:'SelfPosted',
          postId:doc._id,
          postTitle:doc.title,
          mainImage:doc.mainImage,
          createdAt:doc.createdAt
        });
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
    }
  });
}

if(Meteor.isClient){
  Meteor.subscribe("posts");
  Meteor.subscribe("drafts");
  Meteor.subscribe("feeds");
  Meteor.subscribe("follows");
}
