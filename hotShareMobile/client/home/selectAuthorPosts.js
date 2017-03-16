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
    var ids = Session.get('selectedPostIds');
    console.table(ids)
    if (!ids)
      ids = [];
    if(ids.length > 0){
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
    var selectPosts = $('.author-post-item-select').clone();
    selectPosts.each(function(){
      $(this).removeClass('author-post-item author-post-item-select').addClass('series-post-item series-post-item-not-select series-select-item')
    })
    $('#editSeriesList').append(selectPosts)
    Session.set('seriesAuthorPostsCount',0);
    return $('.author-self-posts').hide();
  },
  'click .author-post-item': function(e,t){
    return $(e.currentTarget).toggleClass('author-post-item-select');
  },
})
