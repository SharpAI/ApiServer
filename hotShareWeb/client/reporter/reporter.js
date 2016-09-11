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
    if(Session.get('reporter-startDate') &&  Session.set('reporter-endDate')){
      return {createdAt:{
          $gte: Session.get('reporter-startDate'),
          $lte: Session.get('reporter-startDate')}
      };
    } else {
      return {};
    }
  },
  posts: function(){
      return Posts.find(this.findSelects(), this.findOptions());
  },
  removedPosts: function() {
      return BackUpPosts.find(this.findSelects(), this.findOptions());
  },
  waitOn: function(){
    if(!Session.get('reporterLayout')){
      Session.set('reporterLayout','montior');
    }
    if(!Session.get('reporter-page')){
      Session.set('reporter-page',1)
    }
    if(!Session.get('reporter-limit')){
      Session.set('reporter-limit',this.increment)
    }
    if(Session.get('reporterLayout') ==='montior'){
      return Meteor.subscribe('rpPosts','montior',this.findSelects(),this.findOptions());
    } else {
      return Meteor.subscribe('rpPosts','recover',this.findSelects(),this.findOptions());
    }
    
  },
  data: function(){
    if(Session.get('reporterLayout') ==='montior'){
      return {posts:this.posts()};
    } else {
      return {posts:this.removedPosts()};
    }
    
  }
});
Template.reporter.onRendered(function () {
  
  // if(Session.get('reporterLayout') ==='montior'){
  //   Meteor.subscribe('rpPosts',1)
  // } else {
  //   Meteor.subscribe('rpPosts',2)
  // }
  console.log('curr ='+Session.get('reporterLayout'))
});

Template.reporter.helpers({
  isMontior:function(){
    return Session.get('reporterLayout') === 'montior';
  },
  formatTime:function(time){
    return GetTime0(time)
  },
  page: function(){
    return Session.get('reporter-page');
  },
  limit: function(){
    return Session.get('reporter-limit');
  }
});

Template.reporter.events({
  'click #montior': function(e,t){
    Session.set('reporterLayout','montior');
  },
  'click #recover': function(e,t){
    Session.set('reporterLayout','recover');
  },
  'click .showPostURI': function(e){
    alert('http://cdn.tiegushi.com/posts/'+e.currentTarget.id);
  },
  'click .remove': function(e,t){
    Meteor.call('delectPostAndBackUp',e.currentTarget.id);
    $('tr#' + e.currentTarget.id).remove();
    toastr.info('已删除')
  },
  'click .restore': function(e,t){
    Meteor.call('restorePost',e.currentTarget.id);
    $('tr#' + e.currentTarget.id).remove();
    toastr.info('已恢复')
  },
  'click .del': function(e,t) {
    PUB.confirm('将从数据库中完全删除，并且无法恢复请确认！',function(){
      Meteor.call('delPostfromDB',e.currentTarget.id);
      $('tr#' + e.currentTarget.id).remove();
      toastr.info('删除成功！');
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
    if(startDate && endDate){
      startDate = new Date(startDate).getTime();
      endDate = new Date(endDate).getTime();
      Session.set('reporter-startDate',startDate);
      Session.set('reporter-endDate',endDate);
    }
    console.log(endDate);
    // Router.go('reporter');

  },
  'click #prev': function(){
    var page;
    page = Session.get('reporter-page');
    if(page>1){
      page -= 1;
      Session.set('reporter-page',page);
    }
    // Router.go('reporter');
  },
  'click #next': function(){
    var page;
    page = Session.get('reporter-page');
    page += 1;
    Session.set('reporter-page',page);
    // Router.go('reporter');
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
