Template.hotPosts.helpers({
  posts: function () {
    var _posts =  _.filter(Session.get('hottestPosts') || [], function (value) {
      return value.hasPush;
    });
    console.log(_posts);
    return _posts;
  },
  isSelect: function(id) {
    console.log($('#'+id).hasClass('select'));
    return $('#'+id).hasClass('select');
  }
})
Template.hotPosts.events({
  'click .pin': function(e){
    e.preventDefault();
    if($('#'+e.currentTarget.id).hasClass('select')){
      $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_n.png');
    } else {
      $('#'+e.currentTarget.id+' .selectHelper img').attr('src','/select_p.png');
    }
    $(e.currentTarget).toggleClass('select')
  },
  'click .back': function(){
    return PUB.page('/posts/' + Session.get('postContent')._id);
  },
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
    // $(".hot-posts").find("input:checked").each(function () {
    //   groups.push($(this).attr("id"));
    // });
    $('.select').each(function () {
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