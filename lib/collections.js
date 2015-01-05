Posts = new Meteor.Collection('posts');

if(Meteor.isServer){
  Meteor.publish("posts", function() {
        return Posts.find({owner: this.userId});
  });
}

if(Meteor.isClient){
  Meteor.subscribe("posts");
}