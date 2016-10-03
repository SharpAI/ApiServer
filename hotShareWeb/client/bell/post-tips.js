var renderPage = function(){
  Meteor.setTimeout(function(){
    var $box = $('.show-post-new-message');
    var $wrapper = $('#wrapper');
    var $gridster = $('.gridster');
    var $span = $('.bell-post-tips-span');
    var $test = $('#test');

    console.log('render post-tips:', $box.length > 0 ? 'show' : 'hide');
    if($box.length > 0){
      $box.css('top', ($wrapper.height() + 50) + 'px');
      $span.css('height', '70px');
      $test.css({
        'position': 'position',
        'top': '70px'
      });
    }else{
      $span.css('height', '0px');
      $test.css({
        'position': 'position',
        'top': '0px'
      });
    }
  }, 300);
};

Template.bellPostTips.helpers({
  hasNew: function(){
    return Template.bellPostTips.__helpers.get('feedsCount')() > 0;
  },
  feedsCount: function(){
    
    return Feeds.find({followby: Meteor.userId(), isRead:{$ne: true}, checked:{$ne: true}}).count();
  },
  lsatFeed: function(){
    return Feeds.findOne({followby: Meteor.userId(), isRead:{$ne: true}, checked:{$ne: true}}, {sort: {createdAt: -1}});
  },
  onLoadData: function(){
    renderPage();
  }
});

Template.bellPostTips.events({
  'click .show-post-new-message': function(){
    Router.go('/bell');
  }
});