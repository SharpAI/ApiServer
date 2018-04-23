Template.groupUserHide.onRendered(function(){
  var group_id = Router.current().params._id;
  Session.set('groupUserHideLimit',20);
  Session.set('groupUserHideLoaded','loading');
  Session.set('groupUserHideLoadedCount',0);
  Meteor.subscribe('group-user-relations',group_id,Session.get('groupUserHideLimit'),function(){
    Session.set('groupUserHideLoaded','loaded');
  });
  $('html,body').scrollTop(0);
  // 页面滚动监听
  $(document).on('scroll', function(){
    var diff = $('.userHideLists').height() - $('html,body').scrollTop() - $('body').height() + 50;
    if(diff < 0){
      console.log('loading', diff)
      var limit = Session.get('groupUserHideLimit');
      limit = limit + 20;
      Session.set('groupUserHideLoaded','loading');
      Meteor.subscribe('group-user-relations',group_id,limit,function(){
        Session.set('groupUserHideLoaded','loaded');
        var count = WorkAIUserRelations.find({'group_id':group_id}).count();
        if(Session.get('groupUserHideLoadedCount') < count){
          Session.set('groupUserHideLoadedCount',count);
          Session.set('groupUserHideLimit',limit);
        }
      });
    }
  });

});

Template.groupUserHide.helpers({
  lists: function () {
    var group_id = Router.current().params._id;
    return  WorkAIUserRelations.find({'group_id':group_id}).fetch();
  },
  icon: function (){
    if(this.ai_in_image){
      return this.ai_in_image;
    }
    if(this.checkin_image){
      return this.checkin_image;
    }
    if(this.ai_out_image){
      return this.ai_out_image;
    }
    if(this.checkout_image){
      return this.checkout_image;
    }
    // if(this.app_user_icon){
    //   return this.app_user_icon;
    // }
    return '/user_new.png';
  },
  isShow:function(){
    return !this.hide_it;
  },
  isHide: function(){
    return this.hide_it;
  },
  isLoading: function(){
    return Session.equals('groupUserHideLoaded','loading');
  },
  getStrangerConfig: function() {
    //var result = localStorage.getItem('show_stranger_report');
    var isShow = false, result = null;
    var group_id = Router.current().params._id;
    console.log("getStrangerConfig: group_id = "+group_id);
    var group = SimpleChat.Groups.findOne({_id:group_id});
    if (group && group.settings) {
        result = group.settings.notify_stranger;
    }
    console.log("Frank: result="+result)
    if (result || result == null || result == undefined) {
        isShow = true;
    }
    return {'hide_it': !isShow, 'isShow': isShow}
  },
  //积极报告
  getReportConfig:function(){
    var isShow = false, result = null;
    var group_id = Router.current().params._id;
    var group = SimpleChat.Groups.findOne({_id:group_id});
    if (group && group.settings) {
        result = group.settings.report;
    }
    if (result || result == null || result == undefined) {
        isShow = true;
    }
    return {'hide_it': !isShow, 'isShow': isShow}
  },
  getIsShow: function(isShow) {
    console.log("Frank: isShow="+JSON.stringify(isShow));
  }
});

Template.groupUserHide.events({
  'click .back': function(e){
    var group_id = Router.current().params._id;
    Meteor.setTimeout(function(){
      $('html,body').scrollTop(Session.get('scrollTop'));
    },50);
    return Router.go('/groupsProfile/group/'+ group_id);
  },
  'click .switch':function(e){
    var _id = e.currentTarget.id;
    if(_id == 'report_id'){
        var group_id = Router.current().params._id;
        Meteor.call('update_group_settings', group_id, {'settings.report':!this.isShow});
        this.hide_it = !this.hide_it;
        this.isShow = !this.isShow;
        return;
    }
    if (_id == "stranger_id") {
        //localStorage.setItem('show_stranger_report', !this.hide_it);
        var group_id = Router.current().params._id;
        Meteor.call('update_group_settings', group_id, {'settings.notify_stranger':!this.isShow});
        this.hide_it = !this.hide_it;
        this.isShow = !this.isShow;
        console.log("Frank: this.hide_it="+JSON.stringify(this))
        return;
    }
    var isHide = this.hide_it;
    var group_id = this.group_id;
    var person_name = this.person_name;
    WorkAIUserRelations.update({_id: _id},{
        $set: {hide_it: !isHide}
      }, function(err, result){
        // PUB.hideWaitLoading();
        if(err){
          return console.log(err);
        }
        Meteor.call('update_workai_hide_it', group_id, person_name, !isHide);
      });
  },
  'click .btnShow': function(e){
    var _id = e.currentTarget.id;
    var group_id = this.group_id;
    var person_name = this.person_name;
    // PUB.showWaitLoading('正在处理');
    WorkAIUserRelations.update({_id: _id},{
      $set: {hide_it: false}
    }, function(err, result){
      // PUB.hideWaitLoading();
      if(err){
        return console.log(err);
      }
      Meteor.call('update_workai_hide_it', group_id, person_name, false);
    });
  },
  'click .btnHide': function(e){
    var _id = e.currentTarget.id;
    var group_id = this.group_id;
    var person_name = this.person_name;
    // PUB.showWaitLoading('正在处理')
    WorkAIUserRelations.update({_id: _id},{
      $set: {hide_it: true}
    }, function(err, result){
      // PUB.hideWaitLoading();
      if(err){
       return console.log(err);
      }
      Meteor.call('update_workai_hide_it', group_id, person_name, true);
    });
  }
})