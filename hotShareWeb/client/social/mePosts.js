var loading = new ReactiveVar(false);
var limit = new ReactiveVar(2);
var posts = new ReactiveVar([]);

Template.myPubPosts.onRendered(function () {
  limit.set(2);
  posts.set([]);
  loading.set(true);
});
Template.myPubPosts.helpers({
  loading: function () {
    return loading.get();
  },
  hasMore: function () {
    return posts.get().length >= limit.get();
  },
  myPubPosts: function () {
    return posts.get();
  }
});
Template.myPubPosts.events({
  'click .more': function () {
    limit.set(limit.get()+10);
    loading.set(true);
  },
  'click li': function () {
    PUB.openPost(this._id);
  }
});

Tracker.autorun(function () {
  if(loading.get()){
    console.log('load data:', limit.get());
    Meteor.subscribe('webUserPublishPosts', limit.get(), function () {
      //posts.set(Posts.find({}, {sort: {createdAt: -1}, limit: limit.get()}).fetch());
      posts.set(Posts.find({owner: Meteor.userId()}, {sort: {createdAt: -1}, limit: limit.get()}).fetch());
      loading.set(false);
    });
  }
});