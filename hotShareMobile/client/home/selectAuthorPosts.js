Template.selectAuthorPosts.onRendered(function(){
  SERIES_AUTHOR_POST_LIMIT = 15;
  Session.get('authorPublishPostForSeries','loaded');
  Session.set('seriesAuthorPostsLimit',SERIES_AUTHOR_POST_LIMIT);
  Session.set('seriesAuthorPostsCount',0);
  $('.author-self-posts-container').scroll(function(event){
    var container = $('.author-self-posts-container');
    var target = $('.author-self-posts-container ul');
    var containerMargin = 40;
    var threshold = target.height() - container.scrollTop() - container.height() - containerMargin;
    if(threshold < 0){
      if(Session.get('authorPublishPostForSeries') === 'loaded'){
        Session.set('authorPublishPostForSeries','loading');
        Session.set('seriesAuthorPostsLimit',Session.get('seriesAuthorPostsLimit') + SERIES_AUTHOR_POST_LIMIT);
        console.log('need pull more')
      }
    }
  });
  
});
Template.selectAuthorPosts.helpers({
  userPostsLists: function(){
    if(Session.get('seriesContent')){
      var postLists = Session.get('seriesContent').postLists;
      var ids = [];
      postLists.forEach(function(item){
        ids.push(item.postId);
      });
      var posts = Posts.find({owner:Meteor.userId(),_id:{"$nin":ids},publish:{"$ne":false}}, {sort: {createdAt: -1}}, {limit:Session.get('seriesAuthorPostsLimit')});
    } else {
      var posts = Posts.find({owner:Meteor.userId(),publish:{"$ne":false}}, {sort: {createdAt: -1}}, {limit:Session.get('seriesAuthorPostsLimit')});
    }
    return posts;
  },
  showLoadingElem: function(){
    return Session.equals('authorPublishPostForSeries','loading');
  },
  allPostsLoaded: function() {
    return Session.equals('authorPublishPostForSeries','loadedall');
  }
});

Template.selectAuthorPosts.events({
  'click .cancel': function(){
    Session.set('seriesAuthorPostsCount',0);
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
    Session.set('seriesAuthorPostsCount',0);
    return $('.author-self-posts').hide();
  },
  'click .author-post-item': function(e,t){
    return $(e.currentTarget).toggleClass('author-post-item-select');
  },
})