Template.groupUserHide.onRendered(function(){
  var group_id = Router.current().params._id;
  Session.set('groupUserHideLimit',20);
  Session.set('groupUserHideLoaded','loading');
  Session.set('groupUserHideLoadedCount',0);
  Meteor.subscribe('group-user-relations',group_id,Session.get('groupUserHideLimit'),function(){
    Session.set('groupUserHideLoaded','loaded');
  });

  // 页面滚动监听
  $(document).on('scroll', function(){
    var diff = $('.userHideLists').height() - $('body').scrollTop() - $('body').height() + 50;
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
    return '/userPicture.png';
  },
  isHide: function(){
    return this.hide_it;
  },
  isLoading: function(){
    return Session.equals('groupUserHideLoaded','loading');
  }
});

Template.groupUserHide.events({
  'click .back': function(e){
    return PUB.back();
  },
  'click .btnShow': function(e){
    var _id = e.currentTarget.id;
    // PUB.showWaitLoading('正在处理');
    WorkAIUserRelations.update({_id: _id},{
      $set: {hide_it: false}
    }, function(err, result){
      // PUB.hideWaitLoading();
      if(err){
        return console.log(err);
      }
      Meteor.call('update_workai_hide_it', this.group_id, this.person_name, false);
    });
  },
  'click .btnHide': function(e){
    var _id = e.currentTarget.id;
    // PUB.showWaitLoading('正在处理')
    WorkAIUserRelations.update({_id: _id},{
      $set: {hide_it: true}
    }, function(err, result){
      // PUB.hideWaitLoading();
      if(err){
       return console.log(err);
      }
      Meteor.call('update_workai_hide_it', this.group_id, this.person_name, true);
    });
  }
})