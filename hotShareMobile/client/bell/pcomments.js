Router.route('/bell/pcomments', function(){
  this.render('bell_pcomments');
  Session.set('channel','bell');
});

Template.bell_pcomments.rendered = function() {
  Session.set("bell_pcomments_postPageScrollTop", 0);
  $('.content').css('min-height', $(window).height());
  return $(window).scroll(function(event) {
    var FEEDS_ITEMS_INCREMENT, target, threshold;
    target = $("#showMoreFeedsResults");
    var FEEDS_ITEMS_INCREMENT = 20;
    if (!target.length) {
      return;
    }
    threshold = $(window).scrollTop() + $(window).height() - target.height();
    if (target.offset().top < threshold) {
      if (!target.data("visible")) {
        target.data("visible", true);
        return Session.set("bell_pcomments_feedsitemsLimit", Session.get("bell_pcomments_feedsitemsLimit") + FEEDS_ITEMS_INCREMENT);
      }
    } else {
      if (target.data("visible")) {
        return target.data("visible", false);
      }
    }
  });
};

Template.bell_pcomments.events({
  'click .leftButton': function(){
    history.go(-1);
  }
});

Template.bell_pcomments.helpers({
  eventFeeds: function(){
    var feeds = Feeds.find({eventType: {$in: ['pcomment', 'pfavourite', 'pcommentowner', 'recomment', 'comment']}}, {sort: {createdAt: -1}})
    if (feeds.count() > 0){
      Meteor.defer(function(){
        Session.setPersistent('bell_pcommentsFeedsForMe', feeds.fetch());
      });
      return feeds
    }else{
      return Session.get('bell_pcommentsFeedsForMe');
    }
  },
  notRead: function(read, check, index, createAt){
    console.log('isRead:'+read+ 'isCheck:'+check+'>>>>>>>>>>>参数 长度：'+arguments.length);
    if ((new Date() - new Date(createAt).getTime()) > (7 * 24 * 3600 * 1000))
      return false;
    if (index > 20)
      return false;
    if (check || read)
      return false
    else if (arguments.length === 2)
      return false;
    else
      return true;
  },
  time_diff: function(created){
    return GetTime0(new Date() - created);
  },
  moreResults: function(){
    return !(Feeds.find({eventType: {$in: ['pcomment', 'pfavourite', 'pcommentowner', 'recomment', 'comment']}}).count() < Session.get("bell_pcomments_feedsitemsLimit"));
  },
  isAlsoComment: function(eventType) {
    return eventType === 'pcomment';
  },
  isAlsoFavourite: function(eventType) {
    return eventType === 'pfavourite';
  },
  isPcommentOwner: function(eventType) {
    return eventType === 'pcommentowner';
  },
  isPersonalletter: function(eventType) {
    return eventType === 'personalletter';
  },
  isGetRequest: function(eventType) {
    return eventType === 'getrequest';
  },
  isSendRequest: function(eventType) {
    return eventType === 'sendrequest';
  },
  isRecommand: function(eventType) {
    return eventType === 'recommand';
  },
  isReComment: function(eventType) {
    return eventType === 'recomment';
  },
  isComment: function(eventType) {
    return eventType === 'comment';
  }
});

Template.bell_pcomments.events({
  'click .new-msg-box': function(){
    Router.go('/bell/pcomments');
  },
  'click .closePersonalLetter': function(){
    Session.set('inPersonalLetterView',false);
    $('body').css('overflow-y','auto');
    $('.personalLetterContent,.bellAlertBackground').fadeOut(300);
  },
  'click #personalLetter': function(e){
    Session.set('inPersonalLetterView',true);
    $('body').css('overflow-y','hidden');
    document.getElementById(this._id + 'content').style.display='block';
    $(".bellAlertBackground").fadeIn(300);
  },
  'click .contentList': function(e){
    if (this.pindex != null) {
      Session.set("pcurrentIndex",this.pindex);
      Session.set("pcommetsId",this.owner);
      Session.set("pcommentsName",this.ownerName);
      Session.set("toasted",false);
      Feeds.update({_id:this._id},{$set: {checked:true}});
    }
    console.log(this._id);
    Meteor.call('updataFeedsWithMe', Meteor.userId());
  },
  'click .acceptrequest': function(event){
    Follower.insert({
      userId: this.requesteeId,
      userName: this.requestee,
      userIcon: this.requesteeIcon,
      userDesc: '',
      followerId: this.requesterId,
      followerName: this.requester,
      followerIcon: this.requesterIcon,
      followerDesc: '',
      createAt: new Date()
    });
    Follower.insert({
      userId: this.requesterId,
      userName: this.requester,
      userIcon: this.requesterIcon,
      userDesc: '',
      followerId: this.requesteeId,
      followerName: this.requestee,
      followerIcon: this.requesteeIcon,
      followerDesc: '',
      createAt: new Date()
    });
  }
});