Posts = new Meteor.Collection('posts');
// Local only Draft for Post
Drafts = new Meteor.Collection('drafts');

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
  Posts.allow({
    insert: function (userId, doc) {
      return doc.owner === userId;
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
}