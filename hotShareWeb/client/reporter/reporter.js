var formatTime = function(time, str) {
  var UTC = 8; // 启用北京时间
  var date = new Date(time);
  if(UTC){
    date.setUTCHours(date.getUTCHours()+UTC);
  }
  var Y,M,D,h,m,s,result;
  var addZero = function(val) {
    val = val.toString();
    if(val.length < 2){
      return '0'+val;
    } else {
      return val;
    }
  };
  Y = date.getUTCFullYear();
  M = addZero(date.getUTCMonth() + 1);
  D = addZero(date.getUTCDate());
  h = addZero(date.getUTCHours());
  m = addZero(date.getUTCMinutes());
  s = addZero(date.getUTCSeconds());

  switch (str) {
    case 'yyyy-mm-dd H:m:s':
      result = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
      break;
    case 'yyyy-mm-dd':
      result = Y+'-'+M+'-'+D;
      break;
    default:
      result = Y+'-'+M+'-'+D+' '+h+':'+m+':'+s;
  }
  return result;
}
Router.route('/reporter',{
  name:'reporter'
});
ReporterController = RouteController.extend({
  template: 'reporter',
  name:'reporter',
  title: '故事贴帖子监控',
  increment: 20,
  postsLimit: function(){
    var limit;
    if(Session.get('reporter-limit') && Session.get('reporter-page')){
      limit = Session.get('reporter-page') * Session.get('reporter-limit');
    } else {
      limit = this.increment;
    }
    console.log(limit)
    return parseInt(limit);
  },
  postsSkip: function(){
    var skip;
    if(Session.get('reporter-limit') && Session.get('reporter-page')){
      skip = (Session.get('reporter-page')-1) * Session.get('reporter-limit');
    } else {
      skip = 0;
    }
    console.log(skip)
    return parseInt(skip);
  },
  findOptions: function(){
    return {
      sort:{createdAt:-1},
      limit: this.postsLimit(),
      skip: this.postsSkip()
    };
  },
  findSelects: function(){
    return {
      startDate: Session.get('reporter-startDate'),
      endDate:Session.get('reporter-endDate')
    };
  },
  posts: function(){
      if(Session.get('reporter-startDate') && !Session.get('reporter-endDate')){
          return Posts.find({
            isReview:{$ne: false},
            createdAt:{
              $gt:new Date(Session.get('reporter-startDate')),
              $lte:new Date(Session.get('reporter-endDate')),
              $exists: true}
            },this.findOptions());
      } 
      return Posts.find({isReview:{$ne: false},createdAt:{$exists: true}}, this.findOptions());
  },
  removedPosts: function() {
    if(Session.get('reporter-startDate') && !Session.get('reporter-endDate')){
        return BackUpPosts.find({
          createdAt:{
            $gt:new Date(Session.get('reporter-startDate')),
            $lte:new Date(Session.get('reporter-endDate')),
            $exists: true}
          },this.findOptions());
    } 
    return BackUpPosts.find({createdAt:{$exists: true}}, this.findOptions());
  },
  reviewPosts: function() {
    if(Session.get('reporter-startDate') && !Session.get('reporter-endDate')){
        return Posts.find({
          isReview: false,
          createdAt:{
            $gt:new Date(Session.get('reporter-startDate')),
            $lte:new Date(Session.get('reporter-endDate')),
            $exists: true}
          },this.findOptions());
    } 
    return Posts.find({createdAt:{$exists: true},isReview: false},this.findOptions());
  },
  lockUserLists: function() {
    if(Session.get('reporter-startDate') && !Session.get('reporter-endDate')){
        return LockedUsers.find({
          createdAt:{
            $gt:new Date(Session.get('reporter-startDate')),
            $lte:new Date(Session.get('reporter-endDate')),
            $exists: true}
          },this.findOptions());
    } 
    return LockedUsers.find({createdAt:{$exists: true}}, this.findOptions());
  },
  waitOn: function(){
    if(!Session.get('reporter-page')){
      Session.set('reporter-page',1)
    }
    if(!Session.get('reporter-limit')){
      Session.set('reporter-limit',this.increment)
    }
    if(Session.get('reporterLayout') ==='montior'){
      return Meteor.subscribe('rpPosts','montior',this.findSelects(),this.findOptions());
    }
    if(Session.get('reporterLayout') ==='recover'){
      return Meteor.subscribe('rpPosts','recover',this.findSelects(),this.findOptions());
    }
    if(Session.get('reporterLayout') ==='review'){
      return Meteor.subscribe('rpPosts','review',this.findSelects(),this.findOptions());
    }
    if(Session.get('reporterLayout') ==='unblock'){
      return Meteor.subscribe('rpPosts','unblock',this.findSelects(),this.findOptions());
    }
    
  },
  data: function(){
    if(Session.get('reporterLayout') ==='montior'){
      return {posts:this.posts()};
    }
    if(Session.get('reporterLayout') ==='recover'){
      return {posts:this.removedPosts()};
    }
    if(Session.get('reporterLayout') ==='review'){
      return {posts:this.reviewPosts()};
    }
    if(Session.get('reporterLayout') ==='unblock'){
      return {posts:this.lockUserLists()};
    }
    
  }
});
Template.reporter.onRendered(function () {
  if(!Session.get('reporterLayout')){
    Session.set('reporterLayout','montior');
  }
  console.log('curr ='+Session.get('reporterLayout'))
});

Template.reporter.helpers({
  reporterSystemAuth: function(){
    return Meteor.user().profile.reporterSystemAuth;
  },
  isMontior:function(){
    return Session.get('reporterLayout') === 'montior';
  },
  isRecover:function(){
    return Session.get('reporterLayout') === 'recover';
  },
  isReview:function(){
    return Session.get('reporterLayout') === 'review';
  },
  isUnBlock:function(){
    return Session.get('reporterLayout') === 'unblock';
  },
  formatTime:function(time){
    if(time instanceof Date){
      return formatTime(time);
    } else {
      return '暂无数据';
    }
  },
  formatReviewTime:function(created,review){
    var result;
    if(review instanceof Date){
      result =  formatTime(review);
      var T = new Date(new Date(review.toUTCString()).getTime() - new Date(created.toUTCString()).getTime());
      T = T.getMinutes();
      result += "("+T +" min)";
    } else {
      result = '暂无数据';
    }
    return result;
  },
  page: function(){
    return Session.get('reporter-page');
  },
  limit: function(){
    return Session.get('reporter-limit');
  },
  isLogin: function(){
    return Meteor.userId() 
  },
  userName: function(){
    var user;
    user = Meteor.user();
    return user.profile.username || user.username || '匿名';
  },
  startDate: function(){
    return Session.get('reporter-startDate');
  },
  endDate: function(){
    return Session.get('reporter-endDate');
  },
  totalPage: function(){
    var limit,postsCount,totalPage;
    limit = parseInt(Session.get('reporter-limit'));
    postsCount = Counts.get('rpPostsCounts');
    totalPage = Math.ceil(postsCount/limit);
    return totalPage;
  },
  isCurrTab: function(id){
    if(id === Session.get('reporterLayout')){
      console.log('ceee')
      return 'rp-curr';
    }
    return '';
  },
  isReviewFalse: function(review){
    console.log(review)
    return review === false;
  }
});

Template.reporter.events({
  'click #closeReviewContent': function(){
    $('.reviewPostContent').hide();
  },
  'click .user': function(){
    $('.loginToReportSystem').toggle();
  },
  'click #montior': function(e,t){
    Session.set('reporterLayout','montior');
  },
  'click #recover': function(e,t){
    Session.set('reporterLayout','recover');
  },
  'click #review': function(e,t){
    Session.set('reporterLayout','review');
  },
  'click #unblock': function(e,t){
    Session.set('reporterLayout','unblock');
  },
  'click .showPostURI': function(e){
    Session.set('review-post-id',e.currentTarget.id);
    $('.reviewPostContent').show();
    // prompt("按CTRL + V 复制",'http://cdn.tiegushi.com/posts/'+e.currentTarget.id);
  },
  'click .remove': function(e,t){
    toastr.remove();
    $('.rp-click-area').addClass('rp-click-area-disable');
    Meteor.call('delectPostAndBackUp',e.currentTarget.id,Meteor.userId());
    $('tr#' + e.currentTarget.id).remove();
    toastr.info('已删除');
    $('.rp-click-area').removeClass('rp-click-area-disable');
  },
  'click .removeWithUser': function(e){
    toastr.remove();
    $('.rp-click-area').addClass('rp-click-area-disable');
    Meteor.call('delectPostWithUserAndBackUp',e.currentTarget.id,Meteor.userId());
    $('tr#' + e.currentTarget.id).remove();
    $('.reviewPostContent').hide();
    toastr.info('已删除');
    $('.rp-click-area').removeClass('rp-click-area-disable');
  },
  'click .restore': function(e,t){
    toastr.remove();
    $('.rp-click-area').addClass('rp-click-area-disable');
    Meteor.call('restorePost',e.currentTarget.id,Meteor.userId());
    $('.reviewPostContent').hide();
    $('tr#' + e.currentTarget.id).remove();
    toastr.info('已恢复');
    $('.rp-click-area').removeClass('rp-click-area-disable');
  },
  'click .del': function(e,t) {
    PUB.confirm('将从数据库中完全删除，并且无法恢复请确认！',function(){
      toastr.remove();
      $('.rp-click-area').addClass('rp-click-area-disable');
      Meteor.call('delPostfromDB',e.currentTarget.id,Meteor.userId());
      $('.reviewPostContent').hide();
      $('tr#' + e.currentTarget.id).remove();
      toastr.info('删除成功！');
      $('.rp-click-area').removeClass('rp-click-area-disable');
    })
  },
  'click .viewOwner': function(e,t){
    Meteor.subscribe('rpOwner',e.currentTarget.id);
    Session.set('rp-viewOwner-id',e.currentTarget.id);
    $('.rp-viewOwner').show();
  },
  'click #submit': function(e,t){
    var page,limit,startDate,endDate;
    page = $('#page').val();
    limit = $('#limit').val();
    Session.set('reporter-page',Number(page));
    Session.set('reporter-limit',Number(limit));
    startDate = $('#startDate').val();
    endDate = $('#endDate').val();
    if(startDate.length>2 && endDate.length>2){
      Session.set('reporter-startDate',startDate);
      Session.set('reporter-endDate',endDate);
    } else {
      Session.set('reporter-startDate',false);
      Session.set('reporter-endDate',false);
    }
    console.log(endDate);
    // Router.go('reporter');

  },
  'click #prev': function(){
    var page;
    page = Session.get('reporter-page');
    if(page<=1){
      toastr.remove();
      toastr.info('已经是第一页了～');
      return
    }
    page -= 1;
    Session.set('reporter-page',page);
    // Router.go('reporter');
  },
  'click #next': function(){
    var page,limit,postsCount;
    page = parseInt(Session.get('reporter-page'));
    limit = parseInt(Session.get('reporter-limit'));
    postsCount = Counts.get('rpPostsCounts');
    if(postsCount<=(limit*page)){
      toastr.remove();
      toastr.info('已经是最后一页了～');
      return
    }
    page += 1;
    Session.set('reporter-page',page);
    // Router.go('reporter');
  },
  'click #getAccess':function(){
    Meteor.logout(function(){
      $('.loginToReportSystem').toggle();
    });
  },

  // review
  'click .reviewPostPass': function(e,t){
    toastr.remove();
    $('.rp-click-area').addClass('rp-click-area-disable');
    Meteor.call('reviewPostPass',Meteor.userId(),e.currentTarget.id,function(err,result){
      if(!err && result){
        res = JSON.parse(result.content);
        console.log(res);
        if(res.result === true){
          $('.reviewPostContent').hide();
          $('tr#' + e.currentTarget.id).remove();
          toastr.info('通过发表成功');
          $('.rp-click-area').removeClass('rp-click-area-disable');
        } else {
          toastr.error('请重试');
          $('.rp-click-area').removeClass('rp-click-area-disable');
        }
      } else {
        toastr.error('请重试');
        $('.rp-click-area').removeClass('rp-click-area-disable');
      }
    });
  },
  'click .reviewPostMiss': function(e,t){
    toastr.remove();
    $('.rp-click-area').addClass('rp-click-area-disable');
    Meteor.call('reviewPostMiss',Meteor.userId(),e.currentTarget.id,function(err,result){
      if(!err && result){
        $('.reviewPostContent').hide();
        $('tr#' + e.currentTarget.id).remove();
        toastr.info('该帖未通过审核');
        $('.rp-click-area').removeClass('rp-click-area-disable');
      } else {
        toastr.error('请重试');
        $('.rp-click-area').removeClass('rp-click-area-disable');
      }
    });
  },

  // unblock user
  'click .restoreUser': function(e,t){
    PUB.confirm('请确认！',function(){
      toastr.remove();
      $('.rp-click-area').addClass('rp-click-area-disable');
      Meteor.call('restoreUser',Meteor.userId(),e.currentTarget.id,function(err,result){
        if(!err && result){
          $('tr#' + e.currentTarget.id).remove();
          toastr.info('恢复用户成功！');
          $('.rp-click-area').removeClass('rp-click-area-disable');
        } else {
          toastr.error('请重试');
          $('.rp-click-area').removeClass('rp-click-area-disable');
        }
      });
    });
  }
});



// ownerInfo
Template.reporterViewOwner.onRendered(function() {
  // Meteor.subscribe('rpOwner', Session.get('rp-viewOwner-id'));
});

Template.reporterViewOwner.helpers({
  owner: function(){
    // Meteor.subscribe('rpOwner', Session.get('rp-viewOwner-id'));
    return Meteor.users.findOne({
      _id: Session.get('rp-viewOwner-id')
    })
  }
});
Template.reporterViewOwner.events({
  'click .close': function(){
    $('.rp-viewOwner').hide();
  }
});


// login system
Template.loginToReportSystem.helpers({
  isLogin: function(){
    return Meteor.userId() 
  },
  userName: function(){
    var user;
    user = Meteor.user();
    return user.profile.username || user.username || '匿名';
  },
  auth: function(){
    return "'"+Meteor.user().profile.reporterSystemAuth+"'"
  }
});

Template.loginToReportSystem.events({
  'click #login': function(){
    var user = $('#username').val();
    var password = $('#pass').val();
    Meteor.loginWithPassword(user, password, function(err){
      if(err){
        toastr.info('登录失败');
      } else {
        $('.loginToReportSystem').toggle();
        amplify.store('uuid','');
        toastr.info('登录成功');
      }
    });
  },
  'click #logout': function(){
    Meteor.logout(function(){
      $('.loginToReportSystem').toggle();
      toastr.info('退出成功');
    });
  }
})


Template.ReviewPostContent.helpers({
  posts: function(){
    if(Session.get('reporterLayout') === 'recover'){
      return BackUpPosts.findOne({_id: Session.get('review-post-id')});
    } else {
      return Posts.findOne({_id: Session.get('review-post-id')});
    }
  },
  isMontior:function(){
    return Session.get('reporterLayout') === 'montior';
  },
  isRecover:function(){
    return Session.get('reporterLayout') === 'recover';
  },
  isReview:function(){
    return Session.get('reporterLayout') === 'review';
  }
})