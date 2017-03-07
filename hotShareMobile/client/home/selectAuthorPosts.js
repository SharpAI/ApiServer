Template.selectAuthorPosts.onRendered(function(){
  Meteor.subscribe('webUserPublishPosts',20);
  
});
Template.selectAuthorPosts.helpers({
  userPostsLists: function(){
    var postLists = Session.get('seriesContent').postLists;
    var ids = [];
    postLists.forEach(function(item){
      ids.push(item.postId);
    });
    return Posts.find({owner:Meteor.userId(),_id:{"$nin":ids},publish:{"$ne":false}}, {sort: {createdAt: -1}}, {limit:20});
  },
});

Template.selectAuthorPosts.events({
  'click .cancel': function(){
    $('.author-self-posts').hide();
  },
  'click .done': function(){
    if( $('.author-post-item-select').length === 0){
      return PUB.toast('至少选中一个故事哦～')
    }
    seriesContent = Session.get('seriesContent')
    $('.author-post-item-select').each(function(index){
      seriesContent.postLists.push({
        postId:$(this).attr('id'),
        postMainImage: $(this).data('image'),
        postTitle:$(this).data('title'),
        postAddonTitle: $(this).data('addontitle'),
      });
    });
    Session.set('seriesContent',seriesContent);
    return $('.author-self-posts').hide();
  },
  'click .author-post-item': function(e,t){
    return $(e.currentTarget).toggleClass('author-post-item-select');
  },
})