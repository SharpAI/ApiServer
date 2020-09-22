Template.bindGroupUser.onRendered(function () {
  Meteor.subscribe('userGroups');
});

Template.bindGroupUser.helpers({
  groups: function() {
    return SimpleChat.GroupUsers.find({user_id: Meteor.userId()}).fetch();
  },
  persons: function (group_id) {
    return Persons.find({group_id: group_id}).fetch()
  },

});

Template.bindGroupUser.events({
  'click .back': function(e) {
    return PUB.back();
  },
  'click li': function(e) {
    return PUB.page('/bindUserPopup/'+this.group_id);
  }
});


var limit = new ReactiveVar(20);
Template.bindUserPopup.onRendered(function () {
  var group_id = Router.current().params._id;
  Meteor.subscribe('group_person',group_id,limit.get());
  Meteor.subscribe('workaiUserRelationsByGroup', group_id);
});

Template.bindUserPopup.helpers({
  persons: function () {
    var group_id = Router.current().params._id;
    return Person.find({group_id: group_id}).fetch();
  }
});

Template.bindUserPopup.events({
  'click .back': function(e) {
    return Router.go('/bindGroupUser');
  },
  'click li': function(e) {
    // 绑定
    var group_id = Router.current().params._id;
    var self = this;

    var relation = WorkAIUserRelations.findOne({group_id: group_id, person_name: self.name});
    if (relation) {
      if (relation.app_user_id) {
        return PUB.toast('已被其他用户绑定');
      }
      WorkAIUserRelations.update({_id: relation._id},{$set:{app_user_id: Meteor.userId()}},function(error, _id){
        if (error) {
          console.log(error);
          return PUB.toast('请重试');
        }
        PUB.toast('绑定成功');
        // 初始化对应的WorkStatus 
        Meteor.call('initUserWorkStatusToday',relation._id);
        return Router.go('/bindGroupUser');
      });
    } else {
      var user = Meteor.user();
      var userName = user.username
      WorkAIUserRelations.insert({
        group_id: group_id,
        person_name: self.name,
        ai_persons: [{
          id: self._id
        }],
        app_user_id: user._id,
        app_user_name: userName
      },function(error, _id){
        if (error) {
          console.log(error);
          return PUB.toast('请重试');
        }
        PUB.toast('绑定成功');
        // 初始化对应的WorkStatus 
        Meteor.call('initUserWorkStatusToday',_id);
        return Router.go('/bindGroupUser');
      })
    }
  },
});