Template.hotPosts.helpers({
  posts: function () {
    var _posts =  _.filter(Session.get('hottestPosts') || [], function (value) {
      return value.hasPush;
    });
    console.log(_posts);
    return _posts;
  }
})
Template.hotPosts.events({
  'click .submit': function () {
    var postItem = Posts.findOne({_id: Session.get('postContent')._id});
    var feedItem = {
      owner: Meteor.userId(),
      ownerName: postItem.ownerName,
      ownerIcon: postItem.ownerIcon,
      eventType:'SelfPosted',
      postId: postItem._id,
      postTitle: postItem.title,
      mainImage: postItem.mainImage,
      createdAt: postItem.createdAt,
      heart: 0,
      retweet: 0,
      comment: 0
    };

    var groups = [];
    $(".hot-posts").find("input:checked").each(function () {
      groups.push($(this).attr("id"));
    });

    if (groups.length <= 0){
      return PUB.toast('请选择要推荐的读友圈！')
    }
    Meteor.call('pushPostToHotPostGroups', feedItem, groups, function(err){
      console.log('pushPostToHotPostGroups:', err);
    });
    PUB.toast('推荐成功！')
    Meteor.setTimeout(function() {
      return PUB.page('/posts/' + postItem._id);
    }, animatePageTrasitionTimeout);
  }
})